import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";

/**
 * ProtectedRoute Guard
 * Blocks access to game rooms, lobby, dashboard, store, and profile unless authenticated.
 */
export default function ProtectedRoute({ children }) {
  const { user, token, authLoading } = useAuthWallet();
  const location = useLocation();

  // Show sleek loading state while verifying JWT token on app startup
  if (authLoading) {
    return (
      <div className="auth-guard-loading-screen">
        <div className="dragon-spinner-ring" />
        <div className="guard-loading-text">
          <span className="gold-shimmer-text">🐉 Verifying Dynasty Access...</span>
        </div>
      </div>
    );
  }

  // If there is no token or user is not authenticated, redirect to /login
  const isAuthenticated = Boolean(token && user && user.isAuthenticated && user.email);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
