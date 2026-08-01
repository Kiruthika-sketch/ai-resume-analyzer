const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts raw text from an uploaded resume file buffer.
 * Supports PDF and DOCX. Throws a readable error for unsupported types.
 */
async function parseResume(buffer, mimetype, originalName = "") {
  const lowerName = originalName.toLowerCase();

  const isPdf = mimetype === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx");

  if (isPdf) {
    const data = await pdfParse(buffer);
    return cleanText(data.text);
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return cleanText(result.value);
  }

  throw new Error(
    "Unsupported file type. Please upload a .pdf or .docx resume."
  );
}

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

module.exports = { parseResume };
