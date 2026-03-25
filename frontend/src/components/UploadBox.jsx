import React, { useState, useRef } from "react";
import api from "../services/api.js";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const ALLOWED_TYPES = [
  "application/pdf", "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg", "image/png", "image/gif",
  "application/zip", "application/x-zip-compressed"
];

export default function UploadBox({ onFileUploaded }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    if (!f) return "No file selected";
    if (f.size > MAX_FILE_SIZE) return `File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    if (!ALLOWED_TYPES.includes(f.type)) return "File type not allowed";
    return null;
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
    } else {
      setError("");
      setFile(f);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
    } else {
      setError("");
      setFile(f);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setError("");
    setLoading(true);
    setProgress(0);

    try {
      console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      const { cid, key } = res.data;
      setUploadedFile({ cid, key, name: file.name, uploadedAt: new Date().toLocaleString() });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onFileUploaded) {
        onFileUploaded({ cid, key, name: file.name, uploadedAt: new Date().toLocaleString() });
      }

      alert(`✅ File uploaded successfully!\n\nFile: ${file.name}\nCID: ${cid}`);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setError(`Upload failed: ${errorMsg}`);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleTextUpload = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some content");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const fileName = `text-${Date.now()}.txt`;
      const res = await api.post("/files/upload", { fileName, fileContent: text });
      const { cid, key } = res.data;
      setUploadedFile({ cid, key, name: fileName, uploadedAt: new Date().toLocaleString() });
      setText("");

      if (onFileUploaded) {
        onFileUploaded({ cid, key, name: fileName, uploadedAt: new Date().toLocaleString() });
      }

      alert(`✅ Text uploaded successfully!\n\nCID: ${cid}`);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setError(`Upload failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg upload-card">
      <div className="card-header bg-gradient border-0 py-4">
        <h5 className="card-title mb-0 text-white fw-bold">
          <i className="bi bi-cloud-arrow-up me-2"></i>Upload Content
        </h5>
      </div>

      <div className="card-body p-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")}></button>
          </div>
        )}

        {/* Mode Selector */}
        <div className="btn-group w-100 mb-4" role="group">
          <input type="radio" className="btn-check" name="uploadMode" id="modeFile" value="file"
            checked={uploadMode === "file"} onChange={(e) => { setUploadMode(e.target.value); setError(""); }} />
          <label className="btn btn-outline-primary" htmlFor="modeFile">
            <i className="bi bi-file-earmark me-2"></i>Upload File
          </label>

          <input type="radio" className="btn-check" name="uploadMode" id="modeText" value="text"
            checked={uploadMode === "text"} onChange={(e) => { setUploadMode(e.target.value); setError(""); }} />
          <label className="btn btn-outline-primary" htmlFor="modeText">
            <i className="bi bi-file-text me-2"></i>Upload Text
          </label>
        </div>

        {/* File Upload Mode */}
        {uploadMode === "file" && (
          <form onSubmit={handleFileUpload}>
            <div
              className={`border-2 border-dashed rounded-3 p-5 text-center mb-4 transition-all ${dragOver ? "border-primary bg-light" : "border-secondary"}`}
              style={{ cursor: "pointer" }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: "2.5rem", color: "#667eea" }}></i>
              <p className="mt-3 mb-1 fw-bold">Drag and drop your file here</p>
              <p className="text-muted small mb-0">or click to browse (Max 25MB)</p>
            </div>

            <input ref={fileInputRef} type="file" className="d-none" onChange={handleFileSelect} />

            {file && (
              <div className="alert alert-info alert-dismissible fade show mb-4">
                <i className="bi bi-info-circle me-2"></i>
                <strong>{file.name}</strong>
                <div className="small mt-2">
                  Size: {(file.size / 1024).toFixed(2)} KB
                  <br />
                  Type: {file.type || "Unknown"}
                </div>
                <button type="button" className="btn-close" onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}></button>
              </div>
            )}

            {loading && progress > 0 && (
              <div className="mb-4">
                <div className="progress">
                  <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                    style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    {progress}%
                  </div>
                </div>
              </div>
            )}

            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-primary btn-lg fw-bold" type="submit" disabled={loading || !file}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up me-2"></i>
                    Upload File
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Text Upload Mode */}
        {uploadMode === "text" && (
          <form onSubmit={handleTextUpload}>
            <div className="mb-4">
              <label className="form-label fw-semibold">Text Content</label>
              <textarea
                className="form-control form-control-lg"
                rows="8"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your text content here..."
                style={{ resize: "vertical", fontFamily: "monospace" }}
              />
              <small className="text-muted d-block mt-2">
                {text.length} characters • Encrypted with AES-256-GCM
              </small>
            </div>

            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-primary btn-lg fw-bold" type="submit" disabled={loading || !text.trim()}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up me-2"></i>
                    Upload Text
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="alert alert-info alert-dismissible fade show mb-0" role="alert">
          <i className="bi bi-shield-check me-2"></i>
          <strong>End-to-End Encrypted:</strong> Files are encrypted locally before upload. Only you hold the decryption key.
        </div>
      </div>

      {uploadedFile && (
        <div className="card-footer bg-light border-top">
          <div className="alert alert-success mb-0">
            <h6 className="alert-heading mb-3">
              <i className="bi bi-check-circle me-2"></i>File Uploaded Successfully!
            </h6>
            <div className="row">
              <div className="col-md-6 mb-3 mb-md-0">
                <small className="text-muted d-block">File Name</small>
                <code className="text-dark small" style={{ wordBreak: "break-all" }}>
                  {uploadedFile.name}
                </code>
              </div>
              <div className="col-md-6 mb-3 mb-md-0">
                <small className="text-muted d-block">CID (IPFS Hash)</small>
                <code className="text-dark small" style={{ wordBreak: "break-all" }}>
                  {uploadedFile.cid.substring(0, 20)}...
                </code>
                <button className="btn btn-sm btn-outline-success ms-2" onClick={() => {
                  navigator.clipboard.writeText(uploadedFile.cid);
                  alert("CID copied!");
                }} type="button">
                  Copy
                </button>
              </div>
              <div className="col-md-6">
                <small className="text-muted d-block">Encryption Key</small>
                <code className="text-dark small" style={{ wordBreak: "break-all" }}>
                  {uploadedFile.key.substring(0, 20)}...
                </code>
                <button className="btn btn-sm btn-outline-success ms-2" onClick={() => {
                  navigator.clipboard.writeText(uploadedFile.key);
                  alert("Key copied!");
                }} type="button">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

