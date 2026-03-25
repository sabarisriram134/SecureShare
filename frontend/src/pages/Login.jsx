import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import gsap from "gsap";

// ====== 3D PARTICLE BACKGROUND ======
function ThreeBackgroundLogin() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 300,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: Math.random() * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(13, 13, 13, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z -= p.vz;

        if (p.z <= 0) p.z = 300;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const scale = 300 / (300 + p.z);
        const x = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
        const y = canvas.height / 2 + (p.y - canvas.height / 2) * scale;

        ctx.fillStyle = `rgba(255, 59, 48, ${p.opacity * scale * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
        background: "linear-gradient(135deg, #0D0D0D 0%, #1a1a2e 100%)"
      }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username,
        password
      });

      console.log("✓ Login successful:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Login failed";
      setError(errorMsg + (err.code ? ` (${err.code})` : ""));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setUsername("demo");
    setPassword("Demo@123456");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username: "demo",
        password: "Demo@123456"
      });

      console.log("✓ Demo login successful:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Demo login failed:", err);

      // If demo user doesn't exist, try to create it first
      if (err.response?.status === 401 || err.response?.status === 400) {
        try {
          console.log("Demo user doesn't exist, creating...");
          const registerRes = await api.post("/auth/register", {
            username: "demo",
            email: "demo@secureshare.com",
            password: "Demo@123456",
            phoneNumber: "5551234567"
          });

          console.log("✓ Demo user created, logging in...");
          localStorage.setItem("token", registerRes.data.token);
          login(registerRes.data.user);
          navigate("/dashboard");
        } catch (regErr) {
          const errorMsg = regErr.response?.data?.message || regErr.message || "Demo login failed";
          setError(errorMsg);
        }
      } else {
        const errorMsg = err.response?.data?.message || err.message || "Demo login failed";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0D0D0D 0%, #1a1a2e 100%)",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}
    >
      <ThreeBackgroundLogin />

      {/* Navigation */}
      <nav
        style={{
          background: "rgba(13, 13, 13, 0.95)",
          borderBottom: "2px solid #FF3B30",
          padding: "1.5rem 2rem",
          position: "relative",
          zIndex: 10,
          backdropFilter: "blur(20px)"
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            color: "#FF3B30",
            textDecoration: "none",
            fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: "-0.5px",
            textTransform: "uppercase"
          }}
        >
          🔒 SecureShare
        </Link>
      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 2rem",
          position: "relative",
          zIndex: 5
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: "100%",
            maxWidth: "480px",
            background: "rgba(13, 13, 13, 0.95)",
            backdropFilter: "blur(30px)",
            border: "2px solid #FF3B30",
            borderRadius: 0,
            boxShadow: "0 30px 60px rgba(255, 59, 48, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
            animation: "tactical-float 3s ease-in-out infinite"
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(90deg, rgba(255, 59, 48, 0.15) 0%, transparent 100%)",
              padding: "2.5rem 2rem",
              borderBottom: "1px solid rgba(255, 59, 48, 0.3)",
              position: "relative"
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 900,
                color: "#FF3B30",
                margin: 0,
                marginBottom: "0.5rem",
                fontFamily: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: "-0.5px",
                textTransform: "uppercase"
              }}
            >
              access_
            </h1>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.5)",
                margin: 0,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.5px",
                textTransform: "uppercase"
              }}
            >
              Secure Authentication Protocol
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "2.5rem 2rem" }}>
            {/* Error Alert */}
            {error && (
              <div
                style={{
                  background: "rgba(255, 59, 48, 0.1)",
                  border: "1px solid #FF3B30",
                  borderRadius: 0,
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  color: "#FF3B30",
                  fontSize: "12px",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  animation: "pulse 2s ease-in-out infinite"
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
              {/* Username Field */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.85)",
                    marginBottom: "0.75rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}
                >
                  username
                </label>
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid rgba(255, 59, 48, 0.3)",
                    borderRadius: 0,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    backdropFilter: "blur(10px)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF3B30";
                    e.target.style.background = "rgba(255, 59, 48, 0.05)";
                    e.target.style.boxShadow = "0 0 15px rgba(255, 59, 48, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 59, 48, 0.3)";
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: "2rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.85)",
                    marginBottom: "0.75rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase"
                  }}
                >
                  password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid rgba(255, 59, 48, 0.3)",
                    borderRadius: 0,
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: "border-box",
                    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    backdropFilter: "blur(10px)"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF3B30";
                    e.target.style.background = "rgba(255, 59, 48, 0.05)";
                    e.target.style.boxShadow = "0 0 15px rgba(255, 59, 48, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 59, 48, 0.3)";
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  background: loading ? "rgba(255, 59, 48, 0.5)" : "rgba(255, 59, 48, 0.2)",
                  border: "1px solid #FF3B30",
                  borderRadius: 0,
                  color: "#FF3B30",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onClick={(e) => {
                  if (!loading) {
                    const btn = e.currentTarget;
                    btn.style.transform = "scale(0.98)";
                    btn.style.boxShadow = "0 0 20px rgba(255, 59, 48, 0.4)";
                    setTimeout(() => {
                      btn.style.transform = "scale(1)";
                      btn.style.boxShadow = "none";
                    }, 150);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "rgba(255, 59, 48, 0.3)";
                    e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 59, 48, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 59, 48, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {loading ? "◌ Authenticating..." : "→ Login"}
              </button>
            </form>

            {/* Demo Login Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoLogin}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 0,
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginBottom: "1.5rem"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
              }}
            >
              ▶ Demo Mode
            </button>

            {/* Links */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.5)",
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <Link
                to="/"
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  borderBottom: "1px solid transparent",
                  paddingBottom: "0.25rem",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF3B30";
                  e.currentTarget.style.borderBottomColor = "#FF3B30";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                ← Back to Home
              </Link>
              <Link
                to="/register"
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  borderBottom: "1px solid transparent",
                  paddingBottom: "0.25rem",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FF3B30";
                  e.currentTarget.style.borderBottomColor = "#FF3B30";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "rgba(13, 13, 13, 0.95)",
          borderTop: "1px solid rgba(255, 59, 48, 0.2)",
          padding: "1rem",
          textAlign: "center",
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.4)",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.3px",
          position: "relative",
          zIndex: 10
        }}
      >
        © 2025 SecureShare • Secure Access Protocol | Version 2.0_TACTICAL
      </footer>

      <style>{`
        @keyframes tactical-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
