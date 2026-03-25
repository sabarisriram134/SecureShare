import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import AIChatBox from "./components/AIChatBot.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TacticalFileSharing from "./pages/TacticalFileSharing.jsx";
import TacticalShareAccess from "./pages/TacticalShareAccess.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tactical"
              element={
                <ProtectedRoute>
                  <TacticalFileSharing />
                </ProtectedRoute>
              }
            />
            <Route path="/tactical-store/:cid" element={<TacticalShareAccess />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <AIChatBox />
      </ErrorBoundary>
    </AuthProvider>
  );
}



