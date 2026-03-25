import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AccessCodeModal({ file, onClose, onAccessGranted }) {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");

  // Auto-populate with user's email from auth context
  useEffect(() => {
    if (user?.email) {
      setRequestEmail(user.email);
    }
  }, [user]);

  const handleRequestCode = async () => {
    if (!requestEmail) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post(`/access/request-code/${file.cid}`, { email: requestEmail });
      setCodeRequested(true);
      // Store email for verification
      localStorage.setItem(`accessEmail:${file.cid}`, requestEmail);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError("Please enter the access code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const storedEmail = localStorage.getItem(`accessEmail:${file.cid}`) || requestEmail;
      const res = await api.post(`/access/verify-code/${file.cid}`, {
        code,
        email: storedEmail
      });

      if (res.data.accessGranted) {
        // Mark file as access granted in session
        sessionStorage.setItem(`accessGranted:${file.cid}`, "true");
        onAccessGranted();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show"
      style={{
        display: "block",
        background: "rgba(0, 0, 0, 0.7)"
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header border-0 text-white"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <h5 className="modal-title">
              <i className="bi bi-shield-check me-2"></i>
              Verify Access
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-3 p-3 bg-light rounded">
              <small className="text-muted">File:</small>
              <div className="fw-bold text-truncate">{file.fileName}</div>
            </div>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError("")}></button>
              </div>
            )}

            {!codeRequested ? (
              <>
                <p className="text-muted small mb-3">
                  Enter your email to receive a 6-digit access code. The code will be sent via email
                  and expires in 15 minutes.
                </p>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleRequestCode}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope me-2"></i>
                      Send Access Code
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-muted small mb-3">
                  We've sent a 6-digit code to your email. Enter it below to access the file.
                </p>

                <div className="mb-3">
                  <label className="form-label">6-Digit Access Code</label>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength="6"
                    disabled={loading}
                    style={{ fontSize: "24px", letterSpacing: "10px", fontFamily: "monospace" }}
                  />
                  <small className="text-muted">
                    Code expires in 15 minutes • {5 - (code ? 0 : 5)} attempts remaining
                  </small>
                </div>

                <button
                  className="btn btn-success w-100 mb-2"
                  onClick={handleVerifyCode}
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Verify Code
                    </>
                  )}
                </button>

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setCodeRequested(false);
                    setCode("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Send Code Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
