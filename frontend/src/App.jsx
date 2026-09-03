import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./socket/SocketContext.jsx";
import { GameProvider } from "./state/GameProvider.jsx";
import { AuthWalletProvider } from "./context/AuthWalletContext.jsx";
import { PaymentProvider } from "./context/PaymentContext.jsx";
import AppLayout from "./components/AppLayout.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Wallet from "./pages/Wallet.jsx";
import Lobby from "./pages/Lobby.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Store from "./pages/Store.jsx";
import Room from "./pages/Room.jsx";
import Auth from "./pages/Auth.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AuthWalletProvider>
          <PaymentProvider>
            <AppLayout>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<Auth />} />

                {/* Mandatory Authenticated Protected Game Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <AdminPanel />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wallet"
                  element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/store"
                  element={
                    <ProtectedRoute>
                      <Store />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lobby"
                  element={
                    <ProtectedRoute>
                      <Lobby />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/room/:code"
                  element={
                    <ProtectedRoute>
                      <Room />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </PaymentProvider>
        </AuthWalletProvider>
      </GameProvider>
    </SocketProvider>
  );
}
