import { Square, Mic } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { connectLiveDetection } from "../services/api";
import "../styles/liveDetection.css";

function LiveDetection() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [liveData, setLiveData] = useState({ human: 100, ai: 0 });
  const [logs, setLogs] = useState([]);

  const navigate = useNavigate();
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Only timer is required here
    if (!isRecording) return undefined;

    const timer = setInterval(() => {
      setDuration((currentDuration) => currentDuration + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, `[${time}] ${message}`].slice(-6));
  };

  const startRecording = async () => {
    try {
      addLog("Requesting microphone access...");
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      addLog("Microphone permission granted.");

      setDuration(0);
      addLog("Attempting WebSocket handshake...");

      try {
        const { socket, close } = connectLiveDetection(
          (data) => {
            if (data.type === "probabilities") {
              setLiveData({ human: data.human * 100, ai: data.ai * 100 });
            } else if (data.type === "log") {
              addLog(data.message);
            }
          },
          (error) => {
            addLog("WebSocket error or backend unavailable.");
          }
        );

        wsRef.current = { socket, close };
        addLog("WebSocket initiated.");

        // Start MediaRecorder
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && wsRef.current?.socket?.readyState === WebSocket.OPEN) {
            wsRef.current.socket.send(event.data);
          }
        };

        mediaRecorder.start(1000); // 1-second chunks
      } catch (err) {
        addLog("Failed to initiate WebSocket. Backend inactive.");
      }

      setIsRecording(true);
    } catch (err) {
      addLog("Microphone access denied or error: " + err.message);
    }
  };

  const stopRecordingBase = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsRecording(false);
  };

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecordingBase();
      addLog("WebSocket disconnected.");
    }
  };

  const stopAndReport = () => {
    stopRecordingBase();

    // Instead of navigating blindly, we could navigate with the aggregated result
    // We'll pass the last liveData as a mock for the Results page for now.
    navigate("/results", {
      state: {
        data: {
          analysis_id: "LIVE-001",
          filename: "Live Stream",
          is_ai_generated: liveData.ai > 50,
          ai_probability: liveData.ai / 100,
          risk_score: liveData.ai / 100,
          risk_level: liveData.ai > 50 ? "high" : "low",
          message: "Live stream evaluated dynamically via WebSockets."
        }
      }
    });
  };

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
  };

  return (
    <div className="live-page">
      <div className="live-container">
        {/* HEADING */}
        <div className="page-heading">
          <h1>Live Voice Detection</h1>
          <p>Perform continuous evaluation of spoken audio stream via WebSockets.</p>
        </div>

        <div className="live-grid">
          {/* RECORDING */}
          <div className="record-card">
            {/* Unified Logo Button */}
            <button
              className={`record-logo-button ${isRecording ? "recording" : ""}`}
              onClick={handleRecording}
              aria-label={isRecording ? "Stop Recording" : "Start Recording"}
            >
              {isRecording ? (
                <video
                  className="record-logo-video"
                  src="/logo-animation.mp4"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
              ) : (
                <img src="/logo.png" alt="Start Vaani AI" className="record-logo-img" />
              )}
            </button>

            <h3>{isRecording ? "Recording Active..." : "Ready to Record"}</h3>
            <p className="connection">{isRecording ? "Live Stream Connected" : "Click microphone to start"}</p>

            <div className="mini-waveform">
              {Array.from({ length: 25 }, (_, index) => (
                <span key={index} className="mini-wave-bar" />
              ))}
            </div>

            <button className="report-btn" onClick={stopAndReport}>
              Stop & Get Full Report
            </button>
          </div>

          {/* MONITOR */}
          <div className="monitor-card">
            <h2>Real-Time Monitor</h2>

            <div className="monitor-stats">
              <div>
                <span>DURATION</span>
                <h3>{formatDuration(duration)}</h3>
              </div>
              <div>
                <span>SAMPLE RATE</span>
                <h3>16 kHz</h3>
              </div>
            </div>

            <hr />
            <h4>LIVE PROBABILITY</h4>

            <div className="probability-labels">
              <span className="human-text">Human: {liveData.human.toFixed(0)}%</span>
              <span className="ai-text">AI: {liveData.ai.toFixed(0)}%</span>
            </div>

            <div className="probability-bar">
              <div className="human-bar" style={{ width: `${liveData.human}%` }} />
              <div className="ai-bar" style={{ width: `${liveData.ai}%` }} />
            </div>

            <hr />
            <div className="system-log">
              <h4>SYSTEM LOG</h4>
              {logs.map((log, idx) => (
                <p key={idx}>{log}</p>
              ))}
              {logs.length === 0 && <p className="text-secondary text-sm">No activity</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveDetection;