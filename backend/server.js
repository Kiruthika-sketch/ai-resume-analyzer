require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRoute = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(process.env.ANTHROPIC_API_KEY),
  });
});

app.use("/api", analyzeRoute);

// Generic error handler (e.g. multer file-too-large errors)
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || "Upload error." });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`AI Resume Analyzer backend running on http://localhost:${PORT}`);
  console.log(
    process.env.ANTHROPIC_API_KEY
      ? "AI feedback: ENABLED"
      : "AI feedback: DISABLED (set ANTHROPIC_API_KEY in .env to enable)"
  );
});
