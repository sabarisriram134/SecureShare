import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
  };

  const validateNewPassword = (pwd) => {
    const errors = [];
    if (pwd.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters required`);
    }
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(pwd)) {
      errors.push("At least one uppercase letter required");
    }
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(pwd)) {
      errors.push("At least one lowercase letter required");
    }
    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(pwd)) {
      errors.push("At least one number required");
    }
    if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*]/.test(pwd)) {
      errors.push("At least one special character (!@#$%^&*) required");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password");
      return;
    }

    const passwordErrors = validateNewPassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(", "));
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setSuccess("✓ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to change password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg">
            <div
              className="card-header text-white py-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }}
            >
              <h4 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Change Password
              </h4>
            </div>

            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccess("")}
                  ></button>
                </div>
              )}

              <p className="text-muted mb-4">
                <small>Update your password to keep your account secure</small>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Current Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">New Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Enter a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                  <small className="text-muted d-block mt-2">
                    Requirements:
                    <ul className="mb-0 mt-2">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                      <li>One special character (!@#$%^&*)</li>
                    </ul>
                  </small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm New Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Change Password
                    </>
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                <small>
                  Your password is encrypted and stored securely. Never share your password with anyone.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
