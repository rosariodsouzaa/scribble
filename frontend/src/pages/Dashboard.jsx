import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Sparkles,
  Flame,
  Wallet as WalletIcon,
  Users,
  Trophy,
  Swords,
  Coins,
  Shield,
  ArrowRight,
  PlusCircle,
  Hash,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import { createRoom } from "../api/rooms.js";
import FireDragonLogo from "../components/FireDragonLogo.jsx";
import WalletStatus from "../components/WalletStatus.jsx";
import Button from "../components/Button.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, wallet, connectMetaMask, setWarriorName } = useAuthWallet();
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleQuickPlay = async () => {
    setBusy(true);
    setError("");
    try {
      const { code } = await createRoom();
      navigate(`/room/${code}`);
    } catch {
      setError("Unable to connect to game server. Please ensure backend is running.");
      setBusy(false);
    }
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      setError("Please enter a valid 4-character chamber code.");
      return;
    }
    navigate(`/room/${clean}`);
  };

  return (
    <div className="dashboard-page">
      {/* Top Greeting Row */}
      <div className="dashboard-header-row">
        <div className="dashboard-greeting">
          <div className="greeting-pill">
            <Flame size={14} className="flame-spark" />
            <span>DRAGON DYNASTY ARENA</span>
          </div>
          <h1>
            Welcome back, <span className="gold-gradient-text">{user.name}</span> ⚔️
          </h1>
          <p>Sharpen your brush. Jump into the live arena, create a clan chamber, or claim your rewards.</p>
        </div>

        <div className="dashboard-top-actions">
          <WalletStatus
            isConnected={wallet.isConnected}
            address={wallet.address}
            balance={wallet.balance}
            network={wallet.network}
          />
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="dashboard-hero-banner">
        <div className="hero-ornament tl" />
        <div className="hero-ornament tr" />
        <div className="hero-ornament bl" />
        <div className="hero-ornament br" />

        <div className="hero-left-content">
          <div className="hero-season-tag">
            <Sparkles size={14} />
            <span>SEASON 4 LIVE TOURNAMENT</span>
          </div>

          <h2 className="hero-slogan">
            <span className="word-1">DRAW.</span>
            <span className="word-2"> GUESS.</span>
            <span className="word-3"> CONQUER.</span>
          </h2>

          <p className="hero-desc">
            Compete in real-time multiplayer drawing battles. Decipher secret runes, score lightning-fast speed bonuses, and claim Dragon Gold.
          </p>

          <div className="hero-button-cluster">
            <Button
              variant="flame"
              size="lg"
              onClick={handleQuickPlay}
              disabled={busy}
              icon={<Play size={18} fill="#111" />}
            >
              {busy ? "Summoning Chamber…" : "⚡ Quick Play"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/lobby")}
              icon={<PlusCircle size={18} />}
            >
              Create Chamber
            </Button>
          </div>
        </div>

        <div className="hero-right-logo">
          <FireDragonLogo size="md" showFireRing={true} />
        </div>
      </div>

      {/* 3-Column Action & Stats Grid */}
      <div className="dashboard-card-grid">
        {/* Card 1: Instant Chamber Summon & Code Entry */}
        <div className="dash-card chamber-card">
          <div className="dash-card-header">
            <div className="dash-card-icon">
              <Swords size={20} />
            </div>
            <div>
              <h3>Clan Chamber</h3>
              <p className="dash-card-sub">Join a private room with friends</p>
            </div>
          </div>

          <form onSubmit={handleJoinByCode} className="dash-join-form">
            <div className="dash-input-wrap">
              <Hash size={16} className="dash-input-icon" />
              <input
                className="input dash-code-input"
                placeholder="ENTER CODE (e.g. AB12)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            <Button type="submit" variant="primary" disabled={joinCode.trim().length < 4}>
              Join ⛩️
            </Button>
          </form>

          {error && <p className="dash-error-text">{error}</p>}
        </div>

        {/* Card 2: Web3 Dragon Vault Card */}
        <div className="dash-card wallet-gate-dash-card">
          <div className="dash-card-header">
            <div className="dash-card-icon wallet-icon-bg">
              <WalletIcon size={20} />
            </div>
            <div>
              <h3>Dragon Vault</h3>
              <p className="dash-card-sub">Web3 MetaMask Authentication</p>
            </div>
          </div>

          <p className="wallet-gate-text">
            {wallet.isConnected
              ? `Connected to ${wallet.network}. Win matches to claim tournament coins.`
              : "Connect your MetaMask wallet or access instant test mode for tournament rewards."}
          </p>

          <div className="dash-card-footer">
            {wallet.isConnected ? (
              <Button variant="emerald" size="md" onClick={() => navigate("/wallet")}>
                View Vault ( {wallet.balance} )
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={connectMetaMask}>
                Connect MetaMask 🦊
              </Button>
            )}
          </div>
        </div>

        {/* Card 3: Warrior Stats & Rank Card */}
        <div className="dash-card stats-card">
          <div className="dash-card-header">
            <div className="dash-card-icon trophy-icon-bg">
              <Trophy size={20} />
            </div>
            <div>
              <h3>Warrior Record</h3>
              <p className="dash-card-sub">Dynasty Hall of Fame Rank</p>
            </div>
          </div>

          <div className="warrior-stats-list">
            <div className="stat-item">
              <span className="stat-label">Total Gold</span>
              <span className="stat-value gold">🪙 {user.coins.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Victories</span>
              <span className="stat-value">{user.wins} Wins</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">
                {user.matches > 0 ? Math.round((user.wins / user.matches) * 100) : 75}%
              </span>
            </div>
          </div>

          <div className="dash-card-footer">
            <Button variant="secondary" size="sm" onClick={() => navigate("/leaderboard")}>
              View Global Leaderboard <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
