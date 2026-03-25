import React, { useState } from "react";
import api from "../services/api.js";

export default function FileCard({ file }) {
  const { cid, name, key, fileName, uploadedAt } = file;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/files/download/${cid}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || name || "file");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 file-card transition-hover">
      <div className="card-body">
        {/* File Header */}
        <div className="d-flex align-items-start mb-3">
          <div className="flex-shrink-0">
            <div className="file-icon">
              <i className="bi bi-file-earmark text-primary" style={{ fontSize: "1.5rem" }}></i>
            </div>
          </div>
          <div className="flex-grow-1 ms-3">
            <h6 className="card-title mb-1 text-truncate" title={name || "Unnamed File"}>
              {name || "Unnamed File"}
            </h6>
            <small className="text-muted d-block">
              {uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "Recently uploaded"}
            </small>
          </div>
        </div>

        {/* CID Section */}
        <div className="mb-3 p-3 bg-light rounded">
          <small className="text-muted d-block mb-1">IPFS Hash (CID)</small>
          <code className="text-dark small" style={{ wordBreak: "break-all", display: "block" }}>
            {cid?.substring(0, 20)}...
          </code>
        </div>

        {/* Actions */}
        <div className="btn-group-vertical w-100" role="group">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(cid).then(() => {
                    alert("CID copied to clipboard!");
                  }).catch(() => {
                    // Fallback for clipboard API blocking
                    const textarea = document.createElement("textarea");
                    textarea.value = cid;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    alert("CID copied to clipboard!");
                  });
                } else {
                  throw new Error("Clipboard API not available");
                }
              } catch (err) {
                // Fallback method
                const textarea = document.createElement("textarea");
                textarea.value = cid;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                alert("CID copied to clipboard!");
              }
            }}
          >
            <i className="bi bi-files me-2"></i>Copy CID
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => {
              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(key).then(() => {
                    alert("Key copied to clipboard!");
                  }).catch(() => {
                    // Fallback for clipboard API blocking
                    const textarea = document.createElement("textarea");
                    textarea.value = key;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                    alert("Key copied to clipboard!");
                  });
                } else {
                  throw new Error("Clipboard API not available");
                }
              } catch (err) {
                // Fallback method
                const textarea = document.createElement("textarea");
                textarea.value = key;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                alert("Key copied to clipboard!");
              }
            }}
          >
            <i className="bi bi-key me-2"></i>Copy Key
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-download me-2"></i>Download
          </button>
        </div>
      </div>

      {/* Card Footer with Badge */}
      <div className="card-footer bg-light border-top">
        <div className="d-flex justify-content-between align-items-center">
          <small className="badge bg-success">
            <i className="bi bi-shield-check me-1"></i>Encrypted
          </small>
          <small className="text-muted">
            <i className="bi bi-cloud-check me-1"></i>Stored
          </small>
        </div>
      </div>
    </div>
  );
}

