import React from "react";

export default function MetricsGrid({ breakdown }) {
  const tiles = [
    { label: "Sections completeness", value: `${breakdown.sections.score}%` },
    { label: "Action verbs used", value: breakdown.actionVerbs.count },
    { label: "Quantified bullet lines", value: `${breakdown.quantification.quantifiedLines}/${breakdown.quantification.totalLines}` },
    { label: "Technical skills detected", value: breakdown.skillsDetected.skills.length },
    { label: "Word count", value: breakdown.length.wordCount },
  ];

  const missingSections = Object.entries(breakdown.sections.present)
    .filter(([, present]) => !present)
    .map(([name]) => name);

  return (
    <div className="section-block">
      <h3>Metrics</h3>
      <div className="metric-grid">
        {tiles.map((t) => (
          <div className="metric-tile" key={t.label}>
            <div className="value">{t.value}</div>
            <div className="label">{t.label}</div>
          </div>
        ))}
      </div>

      {breakdown.skillsDetected.skills.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="field-label">Skills detected</div>
          <div className="chip-list">
            {breakdown.skillsDetected.skills.map((s) => (
              <span className="chip matched" key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {missingSections.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="field-label">Sections missing</div>
          <div className="chip-list">
            {missingSections.map((s) => (
              <span className="chip missing" key={s}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
