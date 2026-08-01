const Anthropic = require("@anthropic-ai/sdk");

/**
 * Uses Claude to generate qualitative feedback that rule-based scoring can't produce:
 * tone/clarity review, rewrite suggestions for weak bullet points, and a tailored
 * summary of fit against the job description (if provided).
 *
 * Returns null if no API key is configured, so the rest of the app degrades gracefully
 * to rule-based-only mode.
 */
async function getAIFeedback(resumeText, jdText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const prompt = `You are a professional resume reviewer helping a final-year engineering student.

Resume text:
"""
${resumeText.slice(0, 6000)}
"""

${jdText ? `Target job description:\n"""\n${jdText.slice(0, 3000)}\n"""\n` : ""}

Give feedback as strict JSON only, no markdown fences, matching this shape:
{
  "summary": "2-3 sentence overall impression",
  "strengths": ["short bullet", "short bullet"],
  "weaknesses": ["short bullet", "short bullet"],
  "rewriteSuggestions": [
    {"original": "weak bullet text found in the resume", "improved": "stronger rewritten version"}
  ],
  "fitForRole": "1-2 sentences on fit against the job description, or null if no JD was given"
}
Keep each array to at most 4 items. Be specific and reference actual resume content.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) return null;

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI feedback generation failed:", err.message);
    return { error: "AI feedback unavailable right now — showing rule-based results only." };
  }
}

module.exports = { getAIFeedback };
