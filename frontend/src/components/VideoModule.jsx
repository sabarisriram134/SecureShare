import React, { useState, useRef, useEffect } from "react";
import api from "../services/api.js";
import '../styles/video-enhanced.css';

export default function VideoModule({ userId, apiKey }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Load videos from server on mount
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await api.get("/files");
        const vids = (res.data.files || []).filter(f => f.moduleType === "video");
        setVideos(vids);
      } catch (err) {
        console.error("Error loading videos:", err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  const VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo"
  ];

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB for videos

  const validateVideo = (file) => {
    if (!file) return "No file selected";
    if (!VIDEO_TYPES.includes(file.type)) {
      return "Only MP4, WebM, OGG, MOV, and AVI formats are allowed";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 500MB limit`;
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
    const err = validateVideo(f);
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
      formData.append("moduleType", "video");

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      console.log("Video uploaded:", res.data);
      setVideos([
        ...videos,
        {
          fileName: file.name,
          cid: res.data.cid,
          fileSize: file.size,
          uploadedAt: new Date().toLocaleString(),
          encryptionKey: res.data.key
        }
      ]);

      alert("✅ Video encrypted and uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = async (video) => {
    try {
      setLoading(true);
      const res = await api.get(`/files/download/${video.cid}`, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", video.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download video: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVideoType = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    return ext;
  };

  return (
    <div className="video-container">
      {/* Header */}
      <div className="video-header">
        <div className="video-title-group">
          <h5>🎬 Video Module</h5>
          <small>Secure video uploads with encryption and streaming</small>
        </div>
      </div>

      <div className="video-body">
        {/* Error Alert */}
        {error && (
          <div className="video-error">
            <span>❌ {error}</span>
            <button className="video-error-close" onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`video-upload-zone ${dragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="video-file-input"
            accept="video/*"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
          <p className="video-upload-icon">🎥</p>
          <p className="video-upload-text">Drag videos here or click to select</p>
          <p className="video-upload-subtext">MP4, WebM, OGG, MOV, AVI • Max 500MB</p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="video-progress">
            <div className="video-progress-container">
              <div
                className="video-progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="video-progress-text">{progress}% Uploading...</p>
          </div>
        )}

        {/* Videos Grid */}
        <h6 className="video-section-title">🎬 Your Videos ({videos.length})</h6>

        {videos.length === 0 ? (
          <div className="video-empty">
            <div className="video-empty-icon">🎬</div>
            <h4 className="video-empty-title">No videos yet</h4>
            <p className="video-empty-text">Upload videos to get started</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((video, idx) => (
              <div key={idx} className="video-card">
                <div className="video-card-thumbnail">
                  🎬
                </div>
                <div className="video-card-body">
                  <h6 className="video-card-title" title={video.fileName}>
                    {video.fileName}
                  </h6>
                  <p className="video-card-info">
                    <strong>{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</strong>
                    {video.uploadedAt}
                  </p>
                  <div className="video-card-footer">
                    <button
                      className="video-btn video-btn-download"
                      onClick={() => handleDownload(video)}
                      disabled={loading}
                    >
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
