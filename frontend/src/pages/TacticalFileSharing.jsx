import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import gsap from 'gsap';
import '../styles/enhanced-ui.css';
import '../styles/TacticalFileSharing.css';
import api from '../services/api.js';

export default function TacticalFileSharing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState('private');
  const [ownerOTP, setOwnerOTP] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const containerRef = useRef(null);
  const fileCardsRef = useRef([]);

  // Initialize logs on mount
  useEffect(() => {
    addLog('🔐 System Initialized - Secure Protocol Active');
    addLog('📡 Handshake Complete - AES-256 Encryption Enabled');
    addLog('🛡️ Firewall Rules Applied - Access Control Enabled');
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = fileCardsRef.current.filter(el => el !== null);
      if (elements.length > 0) {
        gsap.from(elements, {
          duration: 0.6,
          opacity: 0,
          y: 20,
          stagger: 0.1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }, containerRef); // Scope the animation to the container

    return () => ctx.revert();
  }, [files]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const hexId = '0x' + Math.random().toString(16).substr(2, 4).toUpperCase();
    setLogs(prev => [{ id: hexId, message, time: timestamp }, ...prev].slice(0, 10));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = async (newFiles) => {
    for (const file of newFiles) {
      try {
        console.log(`[Upload] Starting upload for ${file.name} (${file.size} bytes)`);
        addLog(`Initiating secure transfer for: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("moduleType", "tactical");
        formData.append("accessLevel", selectedAccess);

        // Enhanced upload with longer timeout for large files
        const fileSize = file.size;
        const estimatedSeconds = Math.ceil(fileSize / (1024 * 1024)); // estimate 1MB/sec
        const timeout = Math.max(30000, estimatedSeconds * 2000); // at least 30s, or 2s per MB

        console.log(`[Upload] File size: ${fileSize} bytes, timeout: ${timeout}ms`);

        const res = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: timeout
        });

        if (!res.data || !res.data.cid) {
          throw new Error("Invalid response from server - no CID returned");
        }

        console.log(`[Upload] Success! CID: ${res.data.cid}`);

        const fileObj = {
          id: res.data.cid, // using CID as ID
          name: file.name,
          size: (file.size / 1024).toFixed(2),
          type: file.type,
          access: selectedAccess,
          encryption: 'AES-256',
          createdAt: new Date(),
          selfDestructTime: 3600, // seconds
          status: 'ACTIVE'
        };

        setFiles(prev => [fileObj, ...prev]);
        addLog(`📁 File uploaded: ${file.name} [${fileObj.id.substring(0, 8)}...]`);
        addLog(`🔒 Encryption status: ${fileObj.encryption} ACTIVE`);
        addLog(`🎯 Access level: ${selectedAccess.toUpperCase()}`);
      } catch (err) {
        console.error(`[Upload] Error for ${file.name}:`, err);

        let errorMsg = "Unknown error";
        if (err.code === 'ECONNABORTED') {
          errorMsg = "Upload timeout - file too large or connection too slow";
        } else if (err.response?.status === 401) {
          errorMsg = "Authentication failed - please login again";
        } else if (err.response?.status === 413) {
          errorMsg = "File too large (max 200MB)";
        } else if (err.response?.status === 500) {
          errorMsg = "Server error - please try again";
        } else if (err.message) {
          errorMsg = err.message;
        }

        addLog(`❌ Transfer Failed: ${file.name} - ${errorMsg}`);
        console.error(`[Upload] Full error context:`, {
          status: err.response?.status,
          message: err.message,
          data: err.response?.data
        });
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Self-destruct countdown - DISABLED
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setFiles(prev => prev.map(file => ({
  //       ...file,
  //       selfDestructTime: Math.max(0, file.selfDestructTime - 1)
  //     })).filter(file => file.selfDestructTime > 0));
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // File statistics
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + parseFloat(f.size), 0).toFixed(2),
    encryptedCount: files.filter(f => f.encryption === 'AES-256').length,
    accessLevels: {
      public: files.filter(f => f.access === 'public').length,
      private: files.filter(f => f.access === 'private').length,
      restricted: files.filter(f => f.access === 'restricted').length
    }
  };

  const deleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    addLog(`🗑️ File deleted: ${fileId}`);
  };

  const downloadFile = async (cid, fileName) => {
    try {
      console.log(`[Download] Starting download for CID: ${cid}`);
      addLog(`📥 Initiating download: ${fileName}...`);

      const response = await api.get(`/files/download/${cid}`, {
        responseType: 'blob',
        timeout: 60000 // 60s timeout for download
      });

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log(`[Download] Received ${response.data.size} bytes`);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);

      console.log(`[Download] Triggering browser download`);
      link.click();

      // Clean up without causing logout
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);

      addLog(`✅ Download complete: ${fileName}`);
      console.log(`[Download] Success!`);
    } catch (err) {
      console.error(`[Download] Error for ${cid}:`, err);

      let errorMsg = "Unknown error";
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Download timeout";
      } else if (err.response?.status === 401) {
        errorMsg = "Not authenticated";
      } else if (err.response?.status === 404) {
        errorMsg = "File not found";
      } else if (err.message) {
        errorMsg = err.message;
      }

      addLog(`❌ Download Failed: ${fileName} - ${errorMsg}`);
      console.error(`[Download] Full error context:`, {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data
      });
    }
  };

  const handleDownloadClick = (file) => {
    if (file.access === 'public') {
      downloadFile(file.id, file.name);
    } else {
      addLog(`🕵️ Redirecting to verification portal for: ${file.name}`);
      navigate(`/tactical-store/${file.id}`);
    }
  };

  const shareFile = (fileName, fileId) => {
    const url = `${window.location.origin}/#/tactical-store/${fileId}`;
    navigator.clipboard.writeText(url);
    addLog(`📤 Share link copied for: ${fileId.substring(0, 8)}...`);
    alert(`Secure link copied to clipboard!\n${url}`);
  };

  const getAccessIcon = (access) => {
    switch (access) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      case 'restricted': return '🚨';
      default: return '❓';
    }
  };

  return (
    <div className="tactical-container">
      {/* Main Grid Background */}
      <div className="tactical-grid"></div>

      <div className="tactical-content">
        {/* Header */}
        <div className="tactical-header">
          <div className="header-title">
            <h1 className="tactical-title">
              <span className="glow-text">⚡</span> TACTICAL STORE PROTOCOL
            </h1>
            <p className="tactical-subtitle">Military-Grade File Encryption & Distribution</p>
          </div>
          <div className="header-status">
            <div className="status-indicator">
              <span className="status-pulse"></span>
              System Online
            </div>
            <div className="user-badge">
              <span className="badge-icon">👤</span>
              {user?.username || 'Operative'}
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {files.length > 0 && (
          <div className="statistics-panel">
            <div className="stat-item">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <p className="stat-label">TOTAL FILES</p>
                <p className="stat-value">{stats.totalFiles}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <p className="stat-label">TOTAL SIZE</p>
                <p className="stat-value">{stats.totalSize} KB</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔐</div>
              <div className="stat-content">
                <p className="stat-label">ENCRYPTED</p>
                <p className="stat-value">{stats.encryptedCount}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <p className="stat-label">ACCESS CONTROL</p>
                <p className="stat-value">3-LEVEL</p>
              </div>
            </div>
          </div>
        )}

        <div className="tactical-body">
          {/* Left Sidebar - Protocol Dashboard */}
          <div className="protocol-sidebar">
            <div className="protocol-card">
              <h3 className="protocol-title">🔬 SYSTEM PROTOCOL</h3>
              <div className="protocol-logs">
                {logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-id">{log.id}:</span>
                    <span className="log-message">{log.message}</span>
                    <span className="log-time">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="main-content">
            {/* Access Control Panel */}
            <div className="access-control-panel">
              <h3 className="panel-title">🎯 ACCESS LEVEL</h3>
              <div className="access-toggles">
                {['public', 'private', 'restricted'].map(access => (
                  <button
                    key={access}
                    className={`access-toggle ${selectedAccess === access ? 'active' : ''}`}
                    onClick={() => setSelectedAccess(access)}
                  >
                    <span className="toggle-icon">{getAccessIcon(access)}</span>
                    <span className="toggle-label">{access.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              {/* Credential Configuration Section */}
              {selectedAccess !== 'public' && (
                <div className="credential-section" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--tactical-border)' }}>
                  <h3 className="panel-title" style={{ fontSize: '12px', marginBottom: '15px' }}>
                    🔐 CREDENTIAL SETUP
                  </h3>

                  {/* Email OTP for Private and Restricted */}
                  {(selectedAccess === 'private' || selectedAccess === 'restricted') && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--tactical-red)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📧 EMAIL OTP (will be sent to file owner)
                      </label>
                      <input
                        type="text"
                        placeholder="OTP will be sent to owner's email"
                        disabled
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--tactical-border)',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.3)',
                          color: '#888',
                          fontSize: '12px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  )}

                  {/* SMS OTP for Restricted Only */}
                  {selectedAccess === 'restricted' && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--tactical-red)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📱 SMS OTP (will be sent to owner's phone)
                      </label>
                      <input
                        type="text"
                        placeholder="OTP will be sent to owner's phone"
                        disabled
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--tactical-border)',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.3)',
                          color: '#888',
                          fontSize: '12px',
                          cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  )}

                  {/* Profile Password */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--tactical-red)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🔑 FILE OWNER PASSWORD (will be required)
                    </label>
                    <input
                      type="password"
                      placeholder="User must enter this password to access"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--tactical-border)',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#FFF',
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    />
                    <small style={{ display: 'block', marginTop: '5px', color: '#888', fontSize: '10px' }}>
                      Recipient must provide this password (typically owner's account password)
                    </small>
                  </div>

                  {/* Status Info */}
                  <div style={{
                    padding: '12px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#00F0FF'
                  }}>
                    <strong>Security Protocol:</strong> {selectedAccess === 'private' ? 'Email OTP + Password' : 'Email OTP + SMS OTP + Password'}
                  </div>
                </div>
              )}

              {selectedAccess === 'public' && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(100, 200, 100, 0.1)',
                  border: '1px solid rgba(100, 200, 100, 0.3)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#00FF9F'
                }}>
                  <strong>💚 Public Access</strong> - No authentication required, accessible to logged-in users only
                </div>
              )}
            </div>

            {/* Drop Zone */}
            <div
              ref={containerRef}
              className={`tactical-dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="dropzone-laser"></div>
              <div className="dropzone-content">
                <div className="dropzone-icon">📡</div>
                <h2 className="dropzone-title">INITIALIZE FILE TRANSFER</h2>
                <p className="dropzone-subtitle">Drag files here or click to select</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="dropzone-button">
                  🔍 BROWSE FILES
                </label>
              </div>
            </div>

            {/* File Cards Grid */}
            {files.length > 0 && (
              <div className="files-grid">
                <h3 className="grid-title">📦 ACTIVE TRANSFERS ({files.length})</h3>
                <div className="cards-container">
                  {files.map((file, idx) => (
                    <div
                      key={file.id}
                      ref={el => { fileCardsRef.current[idx] = el; }}
                      className="encrypted-file-card glassmorphism card-enhanced"
                    >
                      <div className="card-header">
                        <div className="card-id-hex">{file.id}</div>
                        <div className="card-status">
                          <span className={`status-badge ${file.status.toLowerCase()}`}>
                            {file.status}
                          </span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="file-info">
                          <p className="file-name">{file.name}</p>
                          <div className="file-meta">
                            <span className="meta-item">
                              <span className="meta-label">SIZE:</span>
                              <span className="meta-value">{file.size} KB</span>
                            </span>
                            <span className="meta-item">
                              <span className="meta-label">TYPE:</span>
                              <span className="meta-value">{file.type || 'N/A'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="encryption-section">
                          <div className="encryption-badge">
                            <span className="encrypt-icon">🔐</span>
                            <span className="encrypt-text">{file.encryption} ACTIVE</span>
                          </div>
                          <div className="access-badge">
                            <span className="access-icon">{getAccessIcon(file.access)}</span>
                            <span className="access-text">{file.access.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Self-destruct removed */}
                      </div>

                      <div className="card-footer">
                        <button
                          className="action-btn download-btn"
                          onClick={() => handleDownloadClick(file)}
                        >
                          ⬇️ DOWNLOAD
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteFile(file.id)}
                        >
                          🗑️ DELETE
                        </button>
                        <button
                          className="action-btn share-btn"
                          onClick={() => shareFile(file.name, file.id)}
                        >
                          🔗 STORE LINK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🛰️</div>
                <p className="empty-text">NO ACTIVE TRANSFERS</p>
                <p className="empty-subtext">Initialize file transfer to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scanning Line Animation */}
      {dragActive && <div className="scanning-overlay"></div>}
    </div>
  );
}
