import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Coins,
  Wallet as WalletIcon,
  Volume2,
  VolumeX,
  Flame,
  LogOut,
  User,
  Shield,
  Trophy,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Plus,
  LogIn,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import WalletStatus from "./WalletStatus.jsx";
import Avatar from "./Avatar.jsx";

export default function Navbar() {
  const {
    user,
    wallet,
    soundEnabled,
    setSoundEnabled,
    disconnectWallet,
    logout,
  } = useAuthWallet();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/dashboard");
  };

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
        {/* Dragon Gold Coins Pill with Quick Top-Up */}
        <div className="nav-coins-pill" onClick={() => navigate("/store")} title="Your Dragon Gold earnings — Click to Top Up">
          <Coins size={16} className="coins-icon" />
          <span className="coins-amount">{user.coins.toLocaleString()}</span>
          <span className="coins-label">GOLD</span>
          <button className="coins-topup-btn" title="Purchase Gold Coins">
            <Plus size={12} />
          </button>
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

        {/* Warrior Profile with Dropdown */}
        <div className="nav-profile-wrapper" ref={dropdownRef}>
          <div
            className={`nav-profile-pill ${dropdownOpen ? "open" : ""}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Warrior Menu"
          >
            <Avatar name={user.name} size={30} color={user.avatarColor} />
            <div className="profile-info-mini">
              <span className="profile-name">{user.name}</span>
              <span className="profile-level">LVL {user.level}</span>
            </div>
            <ChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? "rotated" : ""}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <Avatar name={user.name} size={42} color={user.avatarColor} />
                <div className="dropdown-user-details">
                  <span className="dropdown-user-name">{user.name}</span>
                  <span className="dropdown-user-role">{user.role}</span>
                </div>
              </div>

              <div className="dropdown-stats-grid">
                <div className="dropdown-stat">
                  <span className="stat-num">{user.wins}</span>
                  <span className="stat-lbl">Victories</span>
                </div>
                <div className="dropdown-stat">
                  <span className="stat-num">🪙 {user.coins}</span>
                  <span className="stat-lbl">Gold</span>
                </div>
                <div className="dropdown-stat">
                  <span className="stat-num">LVL {user.level}</span>
                  <span className="stat-lbl">Rank</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-actions">
                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/store");
                  }}
                >
                  <ShoppingBag size={16} color="#fbbf24" />
                  <span>Dragon Emporium Store</span>
                </button>

                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/lobby");
                  }}
                >
                  <Flame size={16} color="#f59e0b" />
                  <span>Summon Battle Chamber</span>
                </button>

                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/wallet");
                  }}
                >
                  <WalletIcon size={16} color="#10b981" />
                  <span>Dragon Vault Wallet</span>
                </button>

                <button
                  className="dropdown-item-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/leaderboard");
                  }}
                >
                  <Trophy size={16} color="#ffd700" />
                  <span>Hall of Fame</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              <div className="dropdown-footer">
                {user.isAuthenticated ? (
                  <button className="dropdown-logout-btn" onClick={handleLogout}>
                    <LogOut size={15} />
                    <span>Log Out Warrior</span>
                  </button>
                ) : (
                  <button
                    className="dropdown-item-btn login-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/lobby");
                    }}
                  >
                    <LogIn size={15} />
                    <span>Change Nickname</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
