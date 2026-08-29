import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";

export default function AdminRoute({ children }) {
  const { user, isAdmin, authLoading } = useAuthWallet();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="dragon-loading-overlay">
        <div className="loading-flame-spinner" />
        <p>Verifying Imperial Authority...</p>
      </div>
    );
  }

  // Not authenticated at all
  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" state={{ from: "/admin" }} replace />;
  }

  // Authenticated, but not admin
  if (!isAdmin) {
    return (
      <div className="admin-unauthorized-container">
        <div className="unauthorized-card">
          <div className="unauthorized-icon-wrap">
            <ShieldAlert size={56} className="unauthorized-shield-glow" />
          </div>
          <h2 className="unauthorized-title">IMPERIAL ACCESS FORBIDDEN</h2>
          <p className="unauthorized-subtitle">
            The High Emperor&apos;s Sanctuary requires Grandmaster credentials. Warrior{" "}
            <strong>{user.name}</strong> holds the title of <em>{user.title || user.role}</em>.
          </p>
          <div className="unauthorized-actions">
            <button className="dragon-btn secondary" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} />
              <span>Return to Arena</span>
            </button>
            <button className="dragon-btn primary" onClick={() => navigate("/login")}>
              <LogIn size={16} />
              <span>Switch to Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
