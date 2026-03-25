import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import '../styles/auth-enhanced.css';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/@$!%*?&/.test(pwd)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) return "Username is required";
    if (formData.username.length < 3) return "Username must be at least 3 characters";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email format";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      return "Invalid phone number format (use format: +1234567890 or 1234567890)";
    }
    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      return "Password must contain uppercase, lowercase, number, and special character";
    }
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      console.log("Registering user:", formData.username);
      const res = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      console.log("Registration successful:", res.data);
      alert("✅ Registration successful! Logging you in...");
      
      // Auto-login after registration
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    const labels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return labels[passwordStrength] || "";
  };

  const getStrengthColor = () => {
    const colors = ["", "danger", "warning", "info", "success", "success"];
    return colors[passwordStrength] || "";
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      
      <div className="auth-content">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">🔐</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join SecureShare Today</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="auth-alert auth-alert-danger">
              <span>⚠️ {error}</span>
              <button className="alert-close" onClick={() => setError("")}>×</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="auth-form-group">
              <label className="auth-label">Username</label>
              <input
                type="text"
                className="auth-input"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose your username"
                disabled={loading}
                minLength="3"
              />
              <small className="auth-hint">Minimum 3 characters</small>
            </div>

            {/* Email */}
            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Phone Number */}
            <div className="auth-form-group">
              <label className="auth-label">📱 Phone Number (for OTP)</label>
              <input
                type="tel"
                className="auth-input"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567 or 15551234567"
                disabled={loading}
                required
              />
              <small className="auth-hint">Required for OTP verification in tactical shares</small>
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a strong password"
                disabled={loading}
              />
              <small className="auth-hint">
                At least 8 chars, mix of upper, lower, number, and special character (@$!%*?&)
              </small>
              
              {formData.password && (
                <div className="password-strength-container">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: passwordStrength <= 2 ? '#FF3B30' : passwordStrength <= 3 ? '#FFB800' : '#34C759'
                      }}
                    ></div>
                  </div>
                  <small className={`strength-label strength-${getStrengthLabel().toLowerCase()}`}>
                    Strength: {getStrengthLabel()}
                  </small>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-form-group">
              <label className="auth-label">Confirm Password</label>
              <input
                type="password"
                className="auth-input"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
              />
              {formData.confirmPassword && (
                <small className={`auth-hint ${formData.password === formData.confirmPassword ? 'text-success' : 'text-danger'}`}>
                  {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </small>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  Creating Account...
                </>
              ) : (
                <>✓ Create Account</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          {/* Login Link */}
          <Link to="/login" className="auth-link-secondary">
            Login Here
          </Link>

          {/* Footer */}
          <div className="auth-footer">
            <p>🛡️ Military-grade AES-256 encryption protects all data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
