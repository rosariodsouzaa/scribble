import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coins, Wallet as WalletIcon, Volume2, VolumeX, Flame, Shield, Trophy } from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import WalletStatus from "./WalletStatus.jsx";
import Avatar from "./Avatar.jsx";

export default function Navbar() {
  const { user, wallet, soundEnabled, setSoundEnabled, disconnectWallet } = useAuthWallet();
  const navigate = useNavigate();

  return (
    <header className="dragon-navbar">
      {/* Brand */}
      <Link to="/dashboard" className="nav-brand">
        <div className="nav-logo-icon">
          <Flame size={20} className="flame-icon-glow" />
        </div>
        <div className="nav-brand-text">
          <span className="brand-title">SCRIBBLE ROYALE</span>
          <span className="brand-subtitle">DRAGON DYNASTY</span>
        </div>
      </Link>

      {/* Right widgets */}
      <div className="nav-right-cluster">
        {/* Dragon Gold Coins */}
        <div className="nav-coins-pill" title="Your Dragon Gold earnings">
          <Coins size={16} className="coins-icon" />
          <span className="coins-amount">{user.coins.toLocaleString()}</span>
          <span className="coins-label">GOLD</span>
        </div>

        {/* Web3 Wallet Pill */}
        {wallet.isConnected ? (
          <WalletStatus
            isConnected={true}
            address={wallet.address}
            balance={wallet.balance}
            network={wallet.network}
            onDisconnect={disconnectWallet}
          />
        ) : (
          <button
            className="nav-connect-wallet-btn"
            onClick={() => navigate("/wallet")}
            title="Connect MetaMask Wallet"
          >
            <WalletIcon size={15} />
            <span>Connect Wallet</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          className="nav-icon-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute Game SFX" : "Unmute Game SFX"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Warrior Profile */}
        <div className="nav-profile-pill" onClick={() => navigate("/dashboard")} title="Warrior Profile">
          <Avatar name={user.name} size={30} color={user.avatarColor} />
          <div className="profile-info-mini">
            <span className="profile-name">{user.name}</span>
            <span className="profile-level">LVL {user.level}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
