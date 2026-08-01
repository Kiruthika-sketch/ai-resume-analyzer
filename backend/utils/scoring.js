const STOPWORDS = new Set(
  (
    "a about above after again against all am an and any are aren't as at be " +
    "because been before being below between both but by can't cannot could " +
    "couldn't did didn't do does doesn't doing don't down during each few for " +
    "from further had hadn't has hasn't have haven't having he he'd he'll he's " +
    "her here here's hers herself him himself his how how's i i'd i'll i'm i've " +
    "if in into is isn't it it's its itself let's me more most mustn't my " +
    "myself no nor not of off on once only or other ought our ours ourselves " +
    "out over own same shan't she she'd she'll she's should shouldn't so some " +
    "such than that that's the their theirs them themselves then there there's " +
    "these they they'd they'll they're they've this those through to too under " +
    "until up very was wasn't we we'd we'll we're we've were weren't what what's " +
    "when when's where where's which while who who's whom why why's with won't " +
    "would wouldn't you you'd you'll you're you've your yours yourself yourselves " +
    "will using use used able etc via per within"
  ).split(" ")
);

const SECTION_PATTERNS = {
  contact: /(email|phone|mobile|linkedin|github|@)/i,
  summary: /(summary|objective|profile)\b/i,
  education: /(education|academic|university|college|b\.?tech|degree)/i,
  experience: /(experience|internship|employment|work history)/i,
  skills: /(skills|technical skills|technologies|tech stack)/i,
  projects: /(projects?)\b/i,
  certifications: /(certifications?|certificates?|achievements|awards)/i,
};

const ACTION_VERBS = [
  "achieved", "administered", "analyzed", "architected", "automated", "built",
  "collaborated", "created", "delivered", "designed", "developed", "engineered",
  "established", "executed", "implemented", "improved", "increased", "initiated",
  "integrated", "launched", "led", "managed", "mentored", "optimized",
  "orchestrated", "organized", "planned", "presented", "reduced", "researched",
  "resolved", "spearheaded", "streamlined", "supervised", "trained", "transformed",
];

// Common technical / employability skills used to detect a candidate's skill footprint
// even when the JD isn't provided.
const SKILL_DICTIONARY = [
  "python", "java", "c++", "c", "javascript", "typescript", "react", "node.js",
  "node", "express", "django", "flask", "sql", "mysql", "postgresql", "mongodb",
  "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "linux",
  "machine learning", "deep learning", "nlp", "computer vision", "opencv",
  "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
  "data analysis", "data structures", "algorithms", "html", "css", "rest api",
  "arduino", "nodemcu", "iot", "yolo", "power bi", "tableau", "excel", "figma",
];

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9+.#-]{1,}/g) || []).filter(
    (w) => !STOPWORDS.has(w) && w.length > 1
  );
}

function countOccurrences(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "gi");
  return (text.match(re) || []).length;
}

function detectSections(text) {
  const found = {};
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    found[section] = pattern.test(text);
  }
  return found;
}

function detectSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_DICTIONARY.filter((skill) => lower.includes(skill));
}

function countActionVerbs(text) {
  let total = 0;
  const matched = new Set();
  for (const verb of ACTION_VERBS) {
    const c = countOccurrences(text, verb);
    if (c > 0) {
      total += c;
      matched.add(verb);
    }
  }
  return { total, uniqueVerbsUsed: [...matched] };
}

function countQuantifiedBullets(text) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const quantified = lines.filter((l) => /\d+(\.\d+)?%?/.test(l));
  return { quantifiedLines: quantified.length, totalLines: lines.length };
}

/**
 * Scores the resume on its own merits (no JD required).
 * Returns a 0-100 score plus a breakdown of each contributing factor.
 */
function scoreResume(resumeText) {
  const sections = detectSections(resumeText);
  const skills = detectSkills(resumeText);
  const { total: actionVerbCount, uniqueVerbsUsed } = countActionVerbs(resumeText);
  const { quantifiedLines, totalLines } = countQuantifiedBullets(resumeText);
  const wordCount = tokenize(resumeText).length;

  const sectionKeys = Object.keys(sections);
  const sectionsPresent = sectionKeys.filter((k) => sections[k]).length;
  const sectionScore = (sectionsPresent / sectionKeys.length) * 100;

  const verbScore = Math.min(100, (actionVerbCount / 10) * 100);

  const quantifyRatio = totalLines > 0 ? quantifiedLines / totalLines : 0;
  const quantifyScore = Math.min(100, quantifyRatio * 300); // ~1/3 of lines quantified = full score

  const skillScore = Math.min(100, (skills.length / 8) * 100);

  let lengthScore;
  if (wordCount < 150) lengthScore = 40;
  else if (wordCount < 250) lengthScore = 70;
  else if (wordCount <= 900) lengthScore = 100;
  else if (wordCount <= 1200) lengthScore = 75;
  else lengthScore = 50;

  const weights = {
    sections: 0.3,
    verbs: 0.2,
    quantify: 0.2,
    skills: 0.2,
    length: 0.1,
  };

  const overallScore = Math.round(
    sectionScore * weights.sections +
      verbScore * weights.verbs +
      quantifyScore * weights.quantify +
      skillScore * weights.skills +
      lengthScore * weights.length
  );

  const tips = [];
  if (!sections.summary) tips.push("Add a short professional summary at the top.");
  if (!sections.projects) tips.push("Include a Projects section — recruiters weigh this heavily for students.");
  if (!sections.contact) tips.push("Make sure your email, phone, and LinkedIn/GitHub links are clearly visible.");
  if (actionVerbCount < 6) tips.push("Start more bullet points with strong action verbs (built, led, optimized, automated).");
  if (quantifyRatio < 0.2) tips.push("Quantify your impact — add numbers, percentages, or metrics to bullet points.");
  if (skills.length < 5) tips.push("List more relevant technical skills explicitly, so ATS keyword scans pick them up.");
  if (wordCount < 150) tips.push("Your resume looks too short — add more detail on projects and experience.");
  if (wordCount > 1200) tips.push("Your resume may be too long — tighten it to 1 page (or 2 for experienced candidates).");

  return {
    overallScore,
    breakdown: {
      sections: { score: Math.round(sectionScore), present: sections },
      actionVerbs: { score: Math.round(verbScore), count: actionVerbCount, examples: uniqueVerbsUsed.slice(0, 8) },
      quantification: { score: Math.round(quantifyScore), quantifiedLines, totalLines },
      skillsDetected: { score: Math.round(skillScore), skills },
      length: { score: lengthScore, wordCount },
    },
    tips,
  };
}

/**
 * Matches resume text against a job description.
 * Returns match percentage plus matched / missing keywords.
 */
function matchAgainstJD(resumeText, jdText) {
  const jdTokens = tokenize(jdText);
  const freq = {};
  for (const t of jdTokens) freq[t] = (freq[t] || 0) + 1;

  // Rank JD keywords by frequency, keep the top ~40 as "important" keywords
  const rankedJDKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);

  const resumeLower = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const keyword of rankedJDKeywords) {
    if (resumeLower.includes(keyword)) matched.push(keyword);
    else missing.push(keyword);
  }

  // Also compare curated skill list mentioned in the JD specifically
  const jdSkills = detectSkills(jdText);
  const resumeSkills = detectSkills(resumeText);
  const matchedSkills = jdSkills.filter((s) => resumeSkills.includes(s));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));

  const matchPercentage =
    rankedJDKeywords.length > 0
      ? Math.round((matched.length / rankedJDKeywords.length) * 100)
      : 0;

  return {
    matchPercentage,
    matchedKeywords: matched.slice(0, 25),
    missingKeywords: missing.slice(0, 25),
    matchedSkills,
    missingSkills,
  };
}

module.exports = { scoreResume, matchAgainstJD, tokenize };
