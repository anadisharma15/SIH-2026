import io
import os
import sys
import numpy as np
import librosa
import onnxruntime as ort

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
aasist_dir = os.path.join(base_dir, "models", "W2V2_AASIST")

MODEL = None

def load_model():
    global MODEL
    if MODEL is not None:
        return MODEL
    
    onnx_path = os.path.join(aasist_dir, "w2v2-aasist.onnx")
    # Using CPU Execution provider, since onnxruntime-gpu isn't guaranteed
    MODEL = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
    return MODEL

def pad(x, max_len=64600):
    x_len = x.shape[0]
    if x_len >= max_len:
        return x[:max_len]
    num_repeats = int(max_len / x_len) + 1
    padded_x = np.tile(x, (1, num_repeats))[:, :max_len][0]
    return padded_x

def analyze_audio_quality(y, sr):
    # Calculate clipping (percentage of samples very close to amplitude 1.0 or -1.0)
    clipping_ratio = np.sum(np.abs(y) >= 0.99) / len(y)
    
    # Calculate Signal-to-Noise Ratio (SNR) heuristically
    # Split audio into short 20ms frames
    frame_length = int(0.02 * sr)
    if len(y) < frame_length * 2:
        return {"audio_quality_score": 100, "audio_quality_level": "High"}
        
    frames = [y[i:i+frame_length] for i in range(0, len(y), frame_length)]
    frame_energies = np.array([np.sum(f**2) for f in frames])
    
    # Sort energies to isolate periods of speech vs silence/background noise
    frame_energies = np.sort(frame_energies)
    n_frames = len(frame_energies)
    noise_frames = frame_energies[:max(1, int(n_frames * 0.1))] # bottom 10%
    signal_frames = frame_energies[int(n_frames * 0.9):] # top 10%
    
    noise_power = np.mean(noise_frames) + 1e-10
    signal_power = np.mean(signal_frames) + 1e-10
    
    snr_db = 10 * np.log10(signal_power / noise_power)
    
    # Map SNR (e.g., 10 dB to 40 dB) to a base quality score of 0 - 100
    base_score = np.clip((snr_db - 10) / (40 - 10) * 100, 0, 100)
    
    # Apply harsh penalty for clipping (clipping ratio > 1% is very bad)
    penalty = np.clip(clipping_ratio * 100 * 10, 0, 100) # 10% clipping = -100 points
    
    final_score = int(np.clip(base_score - penalty, 0, 100))
    
    if final_score >= 70:
        level = "High"
    elif final_score >= 40:
        level = "Medium"
    else:
        level = "Low"
        
    return {
        "audio_quality_score": final_score,
        "audio_quality_level": level
    }

def detect_voice(audio_data: bytes):
    sess = load_model()
    
    # We use librosa to make sure it's loaded as 16kHz mono which the model expects
    y, sr = librosa.load(io.BytesIO(audio_data), sr=16000, mono=True)
    
    # Pad to expected 64600 length, shape (1, 64600)
    y_padded = pad(y, 64600)
    
    # Run the ONNX model (Input format observed during dynamic check: float32 tensor of shape (batch, 64600))
    x_inp = np.expand_dims(y_padded, axis=0).astype(np.float32)
    
    # ONNX inputs are passed as a dictionary mapping input name to array
    input_name = sess.get_inputs()[0].name
    outputs = sess.run(None, {input_name: x_inp})
    
    # The output is [batch, 2], representing logits.
    logits = outputs[0][0]
    
    # Calculate softmax using numpy
    exp_logits = np.exp(logits - np.max(logits)) # subtracting max for numerical stability
    probs = exp_logits / exp_logits.sum()
    
    # Based on the typical AASIST setup, 0 is spoof, 1 is bonafide
    raw_ai_probability = float(probs[0])
    
    # Due to MP3 conversion artifacts or high model confidence bias, we recalibrate 
    # the probability. We set 0.95 as the new decision boundary (50% calibrated).
    ai_threshold = 0.95
    
    if raw_ai_probability < ai_threshold:
        # Map [0, 0.95] to [0.0, 0.49]
        calibrated_prob = (raw_ai_probability / ai_threshold) * 0.49
    else:
        # Map [0.95, 1.0] to [0.50, 1.0]
        calibrated_prob = 0.50 + ((raw_ai_probability - ai_threshold) / (1.0 - ai_threshold)) * 0.50
        
    is_ai = bool(calibrated_prob >= 0.50)
    quality_metrics = analyze_audio_quality(y, sr)
    
    return {
        "is_ai_generated": is_ai,
        "ai_probability": round(calibrated_prob, 4),
        "audio_quality_score": quality_metrics["audio_quality_score"],
        "audio_quality_level": quality_metrics["audio_quality_level"]
    }