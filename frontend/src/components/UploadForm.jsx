import React, { useState, useRef } from "react";

export default function UploadForm({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    if (fileList && fileList[0]) setFile(fileList[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    onSubmit({ file, jobDescription });
  }

  return (
    <form onSubmit={handleSubmit}>
      <span className="field-label">Resume file</span>
      <div
        className={`dropzone${dragActive ? " drag-active" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current.click()}
      >
        <p>Drag & drop your resume here, or click to browse</p>
        <p style={{ fontSize: 12 }}>PDF or DOCX, up to 5MB</p>
        {file && <div className="filename">{file.name}</div>}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <span className="field-label">Job description (optional)</span>
      <textarea
        className="jd-input"
        placeholder="Paste the target job description here to get a match score and missing-keyword breakdown..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <button className="btn-primary" type="submit" disabled={!file || loading}>
        {loading ? "Analyzing..." : "Analyze resume"}
      </button>
    </form>
  );
}
