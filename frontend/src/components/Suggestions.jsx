import React from "react";

export default function Suggestions({ tips, aiFeedback }) {
  return (
    <div className="section-block">
      <h3>Rule-based tips</h3>
      {tips.length > 0 ? (
        <ul className="tips-list">
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: 14, color: "#5a5a52" }}>No major issues found — nice work.</p>
      )}

      {aiFeedback && !aiFeedback.error && (
        <div style={{ marginTop: 24 }}>
          <h3>
            AI feedback <span className="ai-badge">Claude</span>
          </h3>
          <p style={{ fontSize: 14, color: "#5a5a52" }}>{aiFeedback.summary}</p>

          {aiFeedback.strengths?.length > 0 && (
            <>
              <div className="field-label" style={{ marginTop: 14 }}>Strengths</div>
              <ul className="strengths-list">
                {aiFeedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {aiFeedback.weaknesses?.length > 0 && (
            <>
              <div className="field-label" style={{ marginTop: 14 }}>Weaknesses</div>
              <ul className="strengths-list">
                {aiFeedback.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {aiFeedback.rewriteSuggestions?.length > 0 && (
            <>
              <div className="field-label" style={{ marginTop: 14 }}>Bullet rewrites</div>
              {aiFeedback.rewriteSuggestions.map((r, i) => (
                <div className="rewrite-pair" key={i}>
                  <div className="original">{r.original}</div>
                  <div className="improved">{r.improved}</div>
                </div>
              ))}
            </>
          )}

          {aiFeedback.fitForRole && (
            <>
              <div className="field-label" style={{ marginTop: 14 }}>Fit for role</div>
              <p style={{ fontSize: 14 }}>{aiFeedback.fitForRole}</p>
            </>
          )}
        </div>
      )}

      {aiFeedback?.error && (
        <p style={{ fontSize: 13, color: "#8a8577", marginTop: 14 }}>{aiFeedback.error}</p>
      )}

      {!aiFeedback && (
        <p style={{ fontSize: 13, color: "#8a8577", marginTop: 14 }}>
          AI feedback is off. Add an ANTHROPIC_API_KEY in the backend .env to enable Claude-powered rewrites and fit analysis.
        </p>
      )}
    </div>
  );
}
