import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ScoreCard from "./components/ScoreCard";
import MetricsGrid from "./components/MetricsGrid";
import JDMatch from "./components/JDMatch";
import Suggestions from "./components/Suggestions";

const API_BASE = process.env.REACT_APP_API_BASE || "https://ai-resume-analyzer-chon.onrender.com";;

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit({ file, jobDescription }) {
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Couldn't reach the backend. Is the server running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="eyebrow">Resume Analyzer</span>
        <h1>Score it. Match it. Fix it.</h1>
      </header>

      <div className="layout">
        <div className="panel-upload">
          <UploadForm onSubmit={handleSubmit} loading={loading} />
          {error && <div className="error-banner">{error}</div>}
        </div>

        <div className="panel-results">
          {!result && !loading && (
            <div className="empty-state">
              <div className="glyph">—</div>
              <p>Upload a resume to see your score, JD match, and suggestions.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <div className="glyph">···</div>
              <p>Reading your resume and scoring it...</p>
            </div>
          )}

          {result && (
            <>
              <ScoreCard score={result.score.overallScore} fileName={result.fileName} />
              <MetricsGrid breakdown={result.score.breakdown} />
              <JDMatch jdMatch={result.jdMatch} />
              <Suggestions tips={result.score.tips} aiFeedback={result.aiFeedback} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
