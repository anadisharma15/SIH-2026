import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { downloadReport } from "../services/api";
import "../styles/results.css";

function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state?.data;

  // Graceful fallback if opened directly without prior analysis
  if (!data) {
    return <Navigate to="/detect" replace />;
  }

  const handleDownload = async () => {
    try {
      const blob = await downloadReport(data.analysis_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voice-report-${data.analysis_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Failed to download PDF report. Ensure backend PDF generation is active.");
      console.error(err);
    }
  };

  return (
    <div className="results-page">
      <div className="results-container">
        {/* HEADING */}
        <div className="page-heading">
          <h1>Detection Results</h1>
          <p>
            Report generated successfully. Below is the computed confidence breakdown.
          </p>
        </div>

        <div className="results-grid">
          {/* RESULT */}
          <div className="result-card">
            <div className="status-header">
              <div
                className={`status-icon ${data.is_ai_generated === "Uncertain" ? "uncertain"
                    : data.is_ai_generated ? "danger" : "safe"
                  }`}
              >
                {data.is_ai_generated === "Uncertain" ? <HelpCircle size={30} />
                  : data.is_ai_generated ? <AlertTriangle size={30} /> : <CheckCircle size={30} />}
              </div>

              <div>
                <h2>{data.is_ai_generated === "Uncertain" ? "Uncertain Detection"
                  : data.is_ai_generated ? "AI Voice Detected" : "Human Voice Detected"}</h2>
                <p>File: {data.filename || "Unknown Audio File"}</p>
              </div>
            </div>

            <div className="confidence-section">
              <div className="confidence-circle" style={{ borderColor: data.is_ai_generated === "Uncertain" ? "var(--warning-yellow)" : data.is_ai_generated ? "var(--accent-red)" : undefined }}>
                <span style={{ color: data.is_ai_generated === "Uncertain" ? "var(--warning-yellow)" : data.is_ai_generated ? "var(--accent-red)" : undefined }}>
                  {data.risk_score}%
                </span>
              </div>

              <div>
                <h3>{data.is_ai_generated === "Uncertain" ? "Resultant Risk Score"
                  : data.is_ai_generated ? "AI Risk Score" : "Human Risk Score"}</h3>
                <p>{data.message}</p>
              </div>
            </div>

            <h4 className="wave-title">INPUT SIGNAL WAVEFORM (SEGMENT)</h4>
            <div className="result-waveform">
              {Array.from({ length: 40 }, (_, index) => (
                <span key={index} className="result-wave-bar" />
              ))}
            </div>

            <div className="result-buttons">
              <button className="primary-result-btn" onClick={() => navigate("/detect")}>
                Analyze Another
              </button>

              <button className="download-btn" onClick={handleDownload} disabled={!data.analysis_id}>
                Download Report
              </button>
            </div>
          </div>

          {/* FEATURE ANALYSIS */}
          <div className="feature-card">
            <h2>Feature Variance Analysis</h2>

            <Feature name="Risk Level" value={(data.risk_level || "").toUpperCase()} />
            <Feature name="Risk Score" value={data.risk_score ? (data.risk_score).toFixed(1) + "%" : "0%"} />
            <Feature name="AI Probability Base" value={(data.ai_probability * 100).toFixed(1) + "%"} />

            <hr />

            <h4>CLASSIFIER NOTE</h4>
            <p className="classifier-note">
              Results are based exclusively on live data from the backend analysis engine. Actual spectral pattern variations and fundamental frequencies were calculated securely backend-side to output this prediction map.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ name, value }) {
  return (
    <div className="feature">
      <div className="feature-label">
        <span>{name}</span>
        <strong>{value}</strong>
      </div>
      <div className="feature-progress">
        <div
          className="feature-progress-fill"
          style={{ width: value.includes('%') ? value : '100%' }}
        />
      </div>
    </div>
  );
}

export default Results;