def detect_voice(audio_data: bytes):

    # Temporary dummy result
    # Later this will call the actual ML model.

    ai_probability = 0.87

    return {
        "is_ai_generated": ai_probability >= 0.50,
        "ai_probability": ai_probability
    }