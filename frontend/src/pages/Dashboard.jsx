import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import FileCard from "../components/FileCard.jsx";
import UploadBox from "../components/UploadBox.jsx";
import DocumentModule from "../components/DocumentModule.jsx";
import VideoModule from "../components/VideoModule.jsx";
import MyDrive from "../components/MyDrive.jsx";
import ReportManager from "../components/ReportManager.jsx";
import UserReportRequest from "../components/UserReportRequest.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("mydrive");

  const loadFiles = async () => {
    try {
      const res = await api.get("/files");
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Error loading files:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load files");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUploaded = (file) => {
    setFiles([file, ...files]);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="alert alert-danger" style={{ maxWidth: 680 }}>
          <h5 className="mb-2">Failed to load files</h5>
          <div className="mb-2">{error}</div>
          <div className="mb-0 small text-muted">Try reloading the page or check the backend server.</div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Redirect to admin dashboard if user is admin
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="dashboard py-5">
      <div className="container-lg">
        {/* Header with Logout */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Dashboard</h2>
          <div>
            <button
              className="btn btn-danger px-4 py-2"
              style={{ width: "auto", minWidth: "120px" }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>


        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="display-4 fw-bold mb-3">
              <i className="bi bi-cloud-upload text-primary"></i> Secure File Sharing
            </h1>
            <p className="lead" style={{ color: "red" }}>
              Upload, encrypt, and share your files with end-to-end encryption and blockchain-based access control.
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "mydrive" ? "active" : ""}`}
              onClick={() => setActiveTab("mydrive")}
              type="button"
            >
              💾 My Drive
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "files" ? "active" : ""}`}
              onClick={() => setActiveTab("files")}
              type="button"
            >
              📁 Files
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
              type="button"
            >
              📄 Documents
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => setActiveTab("videos")}
              type="button"
            >
              🎬 Videos
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
              type="button"
            >
              📋 Request Report
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              onClick={() => navigate("/tactical")}
              type="button"
              style={{ color: "#FF3B30", fontWeight: "600" }}
            >
              ⚡ Tactical Store
            </button>
          </li>
        </ul>

        {/* My Drive Tab */}
        {activeTab === "mydrive" && (
          <MyDrive />
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div>
            <div className="mb-4">
              <UploadBox onFileUploaded={handleFileUploaded} />
            </div>

            {files.length > 0 && (
              <div>
                <h3 className="fw-bold mb-4">Your Files</h3>
                <div className="row">
                  {files.map((file, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-4">
                      <FileCard file={file} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length === 0 && (
              <div className="alert alert-info text-center py-5">
                <h4>No files uploaded yet</h4>
                <p className="mb-0">Upload a file to get started with secure file sharing.</p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <DocumentModule userId={user?.userId} apiKey={user?.apiKey} />
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <VideoModule userId={user?.userId} apiKey={user?.apiKey} />
        )}

        {/* Request Report Tab - for regular users only */}
        {activeTab === "reports" && (
          <UserReportRequest />
        )}
      </div>
    </div>
  );
}
