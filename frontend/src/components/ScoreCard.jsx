import React from "react";

function verdict(score) {
  if (score >= 80) return "Strong resume — minor polish left.";
  if (score >= 60) return "Solid foundation, a few gaps to close.";
  if (score >= 40) return "Needs meaningful work before applying.";
  return "Significant revisions recommended.";
}

export default function ScoreCard({ score, fileName }) {
  return (
    <div className="score-card">
      <div className="gauge-wrap">
        <div className="fill" style={{ height: `${score}%` }} />
        <div className="scan-line" />
        <div className="score-number">{score}</div>
      </div>
      <div className="score-summary">
        <h2>{fileName}</h2>
        <p>{verdict(score)}</p>
      </div>
    </div>
  );
}
