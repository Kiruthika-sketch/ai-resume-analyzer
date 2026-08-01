import React from "react";

export default function JDMatch({ jdMatch }) {
  if (!jdMatch) return null;

  return (
    <div className="section-block">
      <h3>Job description match — {jdMatch.matchPercentage}%</h3>

      {jdMatch.matchedSkills.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="field-label">Matched skills</div>
          <div className="chip-list">
            {jdMatch.matchedSkills.map((s) => (
              <span className="chip matched" key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {jdMatch.missingSkills.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="field-label">Missing skills mentioned in the JD</div>
          <div className="chip-list">
            {jdMatch.missingSkills.map((s) => (
              <span className="chip missing" key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="field-label">Top missing keywords</div>
      <div className="chip-list">
        {jdMatch.missingKeywords.slice(0, 15).map((k) => (
          <span className="chip missing" key={k}>{k}</span>
        ))}
      </div>
    </div>
  );
}
