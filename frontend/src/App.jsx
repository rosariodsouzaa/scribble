import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SocketProvider } from "./socket/SocketContext.jsx";
import { GameProvider } from "./state/GameProvider.jsx";
import { AuthWalletProvider } from "./context/AuthWalletContext.jsx";
import { PaymentProvider } from "./context/PaymentContext.jsx";
import AppLayout from "./components/AppLayout.jsx";
import DragonLoader from "./components/DragonLoader.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Lazy-loaded pages for optimal performance & code-splitting
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Wallet = lazy(() => import("./pages/Wallet.jsx"));
const Lobby = lazy(() => import("./pages/Lobby.jsx"));
const Store = lazy(() => import("./pages/Store.jsx"));
const Room = lazy(() => import("./pages/Room.jsx"));
const Auth = lazy(() => import("./pages/Auth.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const AdminPanel = lazy(() => import("./pages/AdminPanel.jsx"));
const Practice = lazy(() => import("./pages/Practice.jsx"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage.jsx"));

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AuthWalletProvider>
          <PaymentProvider>
            <AppLayout>
              <Suspense
                fallback={
                  <div className="page-suspense-fallback">
                    <DragonLoader size="lg" message="Summoning Realm…" />
                  </div>
                }
              >
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
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <TransactionsPage />
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
                  path="/practice"
                  element={
                    <ProtectedRoute>
                      <Practice />
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
            </Suspense>
          </AppLayout>
          </PaymentProvider>
        </AuthWalletProvider>
      </GameProvider>
    </SocketProvider>
  );
}
