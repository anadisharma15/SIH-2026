import { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyzeAudio, getRecentAnalyses } from "../services/api";
import "../styles/detect.css";

function Detect() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real recent analyses on mount
    getRecentAnalyses()
      .then((data) => setRecentAnalyses(data))
      .catch((err) => console.error("Error fetching analyses:", err));
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select an audio file");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Connect to the real backend analyzer
      const result = await analyzeAudio(selectedFile);
      navigate("/results", { state: { data: result } });
    } catch (error) {
      console.error(error);
      alert("Analysis failed or backend is down.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="detect-page">
      <div className="page-container">
        {/* HEADING */}
        <div className="page-heading">
          <h1>AI Voice Detection</h1>
          <p>Upload a vocal recording to evaluate probability of machine synthesis.</p>
        </div>

        <div className="detect-grid">
          {/* UPLOAD */}
          <div className="upload-card">
            {isAnalyzing ? (
              <div className="analyzing-overlay">
                <video
                  className="analyzing-video"
                  src="/logo-animation.mp4"
                  autoPlay
                  muted
                  playsInline
                  loop
                />
                <h3>Analyzing Audio...</h3>
                <p>Processing voice patterns and features</p>
              </div>
            ) : (
              <>
                <label className="upload-area">
                  <input
                    type="file"
                    accept=".mp3,.wav,.flac"
                    onChange={handleFileChange}
                  />

                  <div className="upload-icon">
                    <UploadCloud size={30} />
                  </div>

                  <h3>
                    {selectedFile
                      ? selectedFile.name
                      : "Drag & drop your audio file here or click to browse"}
                  </h3>

                  <p>Supported formats: MP3, WAV, FLAC — Max 10MB</p>
                </label>

                <button className="upload-btn" onClick={handleAnalyze}>
                  {selectedFile
                    ? "Analyze Audio"
                    : "Upload a file to begin analysis"}
                </button>
              </>
            )}
          </div>

          {/* RECENT ANALYSES */}
          <div className="recent-card">
            <h2>Recent Analyses</h2>
            <div className="analysis-list">
              {recentAnalyses.length > 0 ? (
                recentAnalyses.map((item, index) => (
                  <AnalysisItem
                    key={index}
                    name={item.filename}
                    date={item.date}
                    result={item.ai_probability > 0.5 ? "AI Voice" : "Human"}
                    type={item.ai_probability > 0.5 ? "ai" : "human"}
                  />
                ))
              ) : (
                <p>No recent analyses found or backend unavailable.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisItem({ name, date, result, type }) {
  return (
    <div className="analysis-item">
      <div>
        <h3>{name}</h3>
        <p>{date}</p>
      </div>
      <span className={`result-badge ${type}`}>{result}</span>
    </div>
  );
}

export default Detect;