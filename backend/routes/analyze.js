const express = require("express");
const multer = require("multer");

const { parseResume } = require("../utils/parseResume");
const { scoreResume, matchAgainstJD } = require("../utils/scoring");
const { getAIFeedback } = require("../utils/aiAnalysis");

const router = express.Router();

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 5);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a resume file (.pdf or .docx)." });
    }

    const jobDescription = (req.body.jobDescription || "").trim();

    const resumeText = await parseResume(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!resumeText || resumeText.length < 30) {
      return res.status(422).json({
        error: "Couldn't extract readable text from that file. Try a different export of your resume.",
      });
    }

    const baseScore = scoreResume(resumeText);
    const jdMatch = jobDescription
      ? matchAgainstJD(resumeText, jobDescription)
      : null;

    // AI feedback is optional and never blocks the response if it fails.
    const aiFeedback = await getAIFeedback(resumeText, jobDescription);

    res.json({
      fileName: req.file.originalname,
      resumeWordCount: baseScore.breakdown.length.wordCount,
      score: baseScore,
      jdMatch,
      aiFeedback, // null if no API key configured
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong analyzing the resume." });
  }
});

module.exports = router;
