# AI Resume Analyzer

Full-stack resume analyzer: upload a PDF/DOCX resume, get a quality score, an
optional job-description match, and improvement tips. Uses rule-based NLP
scoring by default, with optional Claude-powered qualitative feedback if you
add an API key.

## Features

- **Upload** — PDF or DOCX resume via drag-and-drop or file picker
- **Resume score (0–100)** — based on section completeness, action-verb usage,
  quantified achievements, technical-skill detection, and length
- **JD matching** — paste a job description to get a match %, matched/missing
  keywords, and matched/missing skills
- **Rule-based tips** — concrete, always-on suggestions (no API key needed)
- **Optional AI feedback** — if `ANTHROPIC_API_KEY` is set, Claude adds a
  summary, strengths/weaknesses, bullet-point rewrites, and a fit-for-role note

## Folder structure

```
ai-resume-analyzer/
├── backend/
│   ├── routes/analyze.js       # POST /api/analyze
│   ├── utils/parseResume.js    # PDF/DOCX -> text
│   ├── utils/scoring.js        # rule-based scoring + JD matching
│   ├── utils/aiAnalysis.js     # optional Claude feedback
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.jsx
        ├── index.js / index.css
        └── components/
            ├── UploadForm.jsx
            ├── ScoreCard.jsx
            ├── MetricsGrid.jsx
            ├── JDMatch.jsx
            └── Suggestions.jsx
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Optional: paste your Anthropic API key into .env to enable AI feedback
npm start
```

Runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000` and calls the backend at `localhost:5000`
(override with a `REACT_APP_API_BASE` env var if you deploy them separately).

## How scoring works

`backend/utils/scoring.js` checks, with no external API required:

- **Sections** — contact info, summary, education, experience, skills,
  projects, certifications
- **Action verbs** — counts strong verbs like "built", "led", "optimized"
- **Quantification** — % of bullet lines containing a number or metric
- **Skills** — matches against a curated technical-skills dictionary
- **Length** — flags resumes that are too short or too long

JD matching extracts the most frequent meaningful words from the pasted job
description and checks which appear in the resume, plus a direct skills
comparison.

## Notes

- Without `ANTHROPIC_API_KEY` set, the app works fully — you just won't see
  the AI feedback section.
- Max upload size defaults to 5MB (`MAX_UPLOAD_MB` in `.env`).
- This is a starting point — feel free to extend the skills dictionary in
  `scoring.js` for your domain, or swap in a real ATS keyword list.
