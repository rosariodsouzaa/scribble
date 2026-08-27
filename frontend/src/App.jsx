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

export default function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AuthWalletProvider>
          <PaymentProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/store" element={<Store />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/room/:code" element={<Room />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </PaymentProvider>
        </AuthWalletProvider>
      </GameProvider>
    </SocketProvider>
  );
}
