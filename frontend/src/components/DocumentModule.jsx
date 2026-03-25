import React, { useState, useRef, useEffect } from "react";
import api from "../services/api.js";
import '../styles/document-enhanced.css';

export default function DocumentModule({ userId, apiKey }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Load documents from server on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await api.get("/files");
        const docs = (res.data.files || []).filter(f => f.moduleType === "document");
        setDocuments(docs);
      } catch (err) {
        console.error("Error loading documents:", err);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain"
  ];

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for documents

  const validateDocument = (file) => {
    if (!file) return "No file selected";
    if (!DOCUMENT_TYPES.includes(file.type)) {
      return "Only PDF, Word, Excel, and text files are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 50MB limit`;
    }
    return null;
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
    const err = validateDocument(f);
    if (err) {
      setError(err);
    } else {
      handleUpload(f);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setError("");
    setLoading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("moduleType", "document");

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      console.log("Document uploaded:", res.data);
      setDocuments([
        ...documents,
        {
          fileName: file.name,
          cid: res.data.cid,
          fileSize: file.size,
          uploadedAt: new Date().toLocaleString(),
          encryptionKey: res.data.key
        }
      ]);

      alert("✅ Document encrypted and uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = async (doc) => {
    try {
      setLoading(true);
      const res = await api.get(`/files/download/${doc.cid}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download document: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-container">
      {/* Header */}
      <div className="document-header">
        <div className="document-title-group">
          <h5>📄 Document Module</h5>
          <small>Secure PDF, Word, Excel uploads with encryption</small>
        </div>
      </div>

      <div className="document-body">
        {/* Error Alert */}
        {error && (
          <div className="document-error">
            <span>❌ {error}</span>
            <button className="document-error-close" onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`document-upload-zone ${dragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="document-file-input"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <p className="document-upload-icon">📁</p>
          <p className="document-upload-text">Drag documents here or click to select</p>
          <p className="document-upload-subtext">PDF, Word, Excel, Text • Max 50MB</p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="document-progress">
            <div className="progress-container">
              <div
                className="progress-bar-enhanced"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">{progress}% Uploading...</p>
          </div>
        )}

        {/* Documents List */}
        <h6 className="document-section-title">📚 Your Documents ({documents.length})</h6>

        {documents.length === 0 ? (
          <div className="document-card">
            <div className="document-card-body document-empty">
              <div className="document-empty-icon">📄</div>
              <h4 className="document-empty-title">No documents yet</h4>
              <p className="document-empty-text">Upload documents to get started</p>
            </div>
          </div>
        ) : (
          <div className="document-table-responsive">
            <table className="document-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={idx}>
                    <td className="document-file-name">{doc.fileName}</td>
                    <td className="document-file-size">{(doc.fileSize / 1024).toFixed(2)} KB</td>
                    <td className="document-file-date">{doc.uploadedAt}</td>
                    <td>
                      <button
                        className="document-btn document-btn-download"
                        onClick={() => handleDownload(doc)}
                        disabled={loading}
                      >
                        ⬇️ Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
