import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import AccessCodeModal from "./AccessCodeModal.jsx";
import '../styles/mydrive-enhanced.css';

export default function MyDrive() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load all files from server on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await api.get("/files");
        const allFiles = res.data.files || [];
        setFiles(allFiles);
        console.log("Loaded files:", allFiles);
      } catch (err) {
        console.error("Error loading files:", err);
        setError("Failed to load files: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, []);

  const handleSelectFile = (cid) => {
    setSelectedFiles((prev) =>
      prev.includes(cid) ? prev.filter((c) => c !== cid) : [...prev, cid]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.cid));
    }
  };

  const handleDownloadFile = async (file) => {
    // Check if access has already been granted in this session
    const accessGranted = sessionStorage.getItem(`accessGranted:${file.cid}`);
    
    if (!accessGranted) {
      // Show access code modal
      setSelectedFile(file);
      setShowAccessModal(true);
      return;
    }

    try {
      setDownloading(true);
      const res = await api.get(`/files/download/${file.cid}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file: " + (err.response?.data?.error || err.message));
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to download");
      return;
    }

    // Download files one by one
    for (const cid of selectedFiles) {
      const file = files.find((f) => f.cid === cid);
      if (file) {
        await handleDownloadFile(file);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setSelectedFiles([]);
    alert(`Downloaded ${selectedFiles.length} file(s) successfully!`);
  };

  const getFileIcon = (moduleType, fileName) => {
    if (moduleType === "video") return "🎬";
    if (moduleType === "document") {
      if (fileName?.endsWith(".pdf")) return "📕";
      if (fileName?.endsWith(".doc") || fileName?.endsWith(".docx")) return "📘";
      if (fileName?.endsWith(".xls") || fileName?.endsWith(".xlsx")) return "📗";
      return "📄";
    }
    return "📁";
  };

  const getModuleBadge = (moduleType) => {
    const badges = {
      file: { bg: "bg-info", text: "File" },
      document: { bg: "bg-primary", text: "Document" },
      video: { bg: "bg-danger", text: "Video" }
    };
    const badge = badges[moduleType] || badges.file;
    return badge;
  };

  if (loading) {
    return (
      <div className="mydrive-loading">
        <div className="spinner-enhanced"></div>
      </div>
    );
  }

  return (
    <div className="mydrive-container">
      {/* Header */}
      <div className="mydrive-header">
        <div className="mydrive-title-group">
          <h5>💾 My Drive</h5>
          <small>All your encrypted files in one place</small>
        </div>
        {selectedFiles.length > 0 && (
          <div className="mydrive-badge-selected">
            {selectedFiles.length} Selected
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mydrive-error">
          <span>❌ {error}</span>
          <button className="close-btn" onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 ? (
        <div className="mydrive-card">
          <div className="mydrive-card-body mydrive-empty">
            <div className="empty-icon">🛰️</div>
            <h4 className="empty-title">No files yet</h4>
            <p className="empty-text">Upload files from Documents or Videos modules</p>
          </div>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="mydrive-toolbar">
            <button
              className="toolbar-btn"
              onClick={handleSelectAll}
            >
              <span>{selectedFiles.length === files.length ? '✓' : '☐'}</span>
              {selectedFiles.length === files.length ? "Deselect All" : "Select All"}
            </button>

            {selectedFiles.length > 0 && (
              <button
                className="toolbar-btn btn-download"
                onClick={handleDownloadSelected}
                disabled={downloading}
              >
                ⬇️ Download ({selectedFiles.length})
              </button>
            )}

            <div className="toolbar-stat">
              Total: {files.length} file{files.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Files Table */}
          <div className="mydrive-card">
            <div className="mydrive-card-header">
              <h5>📋 Files ({files.length})</h5>
            </div>
            <div className="mydrive-card-body">
              <table className="mydrive-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedFiles.length === files.length && files.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.cid} className={selectedFiles.includes(file.cid) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedFiles.includes(file.cid)}
                          onChange={() => handleSelectFile(file.cid)}
                        />
                      </td>
                      <td>
                        <div className="tdfile-name-wrapper">
                          <span className="file-icon">
                            {getFileIcon(file.moduleType, file.fileName)}
                          </span>
                          <div className="file-info">
                            <p className="file-name">{file.fileName || "Unnamed File"}</p>
                            <p className="file-cid">{file.cid.substring(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge type-${file.moduleType}`}>
                          {getModuleBadge(file.moduleType).text}
                        </span>
                      </td>
                      <td className="file-size">
                        {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="file-date">
                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloading}
                          title="Download this file"
                        >
                          ⬇️ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics */}
          <div className="mydrive-stats">
            <div className="stat-item">
              <p className="stat-label">Total Files</p>
              <p className="stat-value">{files.length}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Total Size</p>
              <p className="stat-value">
                {(files.reduce((sum, f) => sum + (f.fileSize || 0), 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Documents</p>
              <p className="stat-value">{files.filter((f) => f.moduleType === "document").length}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Videos</p>
              <p className="stat-value">{files.filter((f) => f.moduleType === "video").length}</p>
            </div>
          </div>
        </>
      )}

      {/* Access Code Modal */}
      {showAccessModal && selectedFile && (
        <AccessCodeModal
          file={selectedFile}
          email=""
          onClose={() => {
            setShowAccessModal(false);
            setSelectedFile(null);
          }}
          onAccessGranted={() => {
            handleDownloadFile(selectedFile);
          }}
        />
      )}
    </div>
  );
}
