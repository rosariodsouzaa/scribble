import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HelpCircle, Trophy, Wallet, Sparkles, Flame, Users, Palette, Award } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import WalletStatus from '../components/WalletStatus';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, wallet } = useGame();

  const handlePlayNow = () => {
    if (!wallet.isConnected) {
      navigate('/wallet');
    } else {
      navigate('/game');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Greeting & Status */}
      <div className="dashboard-top-row">
        <div className="dashboard-greeting">
          <h1>
            <span>Hi, {user?.name || 'Bhakti'}</span>
            <span style={{ fontSize: '1.5rem' }}>👋</span>
          </h1>
          <p>Welcome back to Scribble Royale. Jump into the arena or join a private room.</p>
        </div>

        <WalletStatus isConnected={wallet.isConnected} address={wallet.address} />
      </div>

      {/* Main Mandatory Wallet Gating Card */}
      <div className="wallet-gate-card">
        <div className="wallet-gate-content">
          <div className="wallet-gate-title">Ready to play?</div>
          <p className="wallet-gate-desc">
            {wallet.isConnected
              ? 'Your wallet is connected! You are all set to create or join multiplayer games.'
              : 'Connect your wallet to start playing.'}
          </p>
          <div className="wallet-gate-status">
            <WalletStatus isConnected={wallet.isConnected} address={wallet.address} />
          </div>
        </div>

        <div>
          {wallet.isConnected ? (
            <Button
              variant="emerald"
              size="lg"
              onClick={() => navigate('/game')}
              icon={<Play size={20} />}
            >
              Enter Game Home
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/wallet')}
              icon={<Wallet size={20} />}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Hero Banner Section (Matching Reference Design) */}
      <div className="hero-banner-card">
        <div className="hero-left">
          <div className="season-badge">
            <Sparkles size={14} />
            <span>SEASON 4 NOW LIVE!</span>
          </div>

          <div className="hero-main-heading">
            <div className="word-draw">DRAW.</div>
            <div className="word-guess">GUESS.</div>
            <div className="word-conquer">CONQUER.</div>
          </div>

          <p className="hero-subtitle">
            Join the ultimate multiplayer drawing battle. Compete with artists worldwide in real-time, earn rewards, and climb the global leaderboards in Scribble Royale.
          </p>

          <div className="hero-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlayNow}
              icon={<Play size={20} />}
            >
              Play Now
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/join-room')}
              icon={<HelpCircle size={20} />}
            >
              How to Play
            </Button>
          </div>

          {/* Stats Row */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-value">125K+</span>
              <span className="stat-label">Active Players</span>
            </div>

            <div className="hero-stat-item">
              <span className="stat-value">1.2M</span>
              <span className="stat-label">Drawings Created</span>
            </div>

            <div className="avatar-stack-card">
              <div className="avatar-stack">
                <img src="/hero-art.jpg" alt="Player 1" className="stacked-avatar" />
                <div className="stacked-avatar" style={{ background: '#8b5cf6' }} />
                <div className="stacked-avatar" style={{ background: '#ec4899' }} />
              </div>
              <span className="avatar-stack-text">+1k Online</span>
            </div>
          </div>
        </div>

        {/* Hero Right Banner Art */}
        <div className="hero-right">
          <div className="top-scorer-badge">
            <div className="top-scorer-icon">
              <Trophy size={18} />
            </div>
            <div className="top-scorer-info">
              <span className="top-scorer-label">TOP SCORER</span>
              <span className="top-scorer-name">AlexSketch</span>
            </div>
          </div>

          <div className="hero-art-frame">
            <img
              src="/hero-art.jpg"
              alt="Scribble Royale Arena Artwork"
              className="hero-art-img"
            />
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="features-grid">
        <div className="card feature-card">
          <div className="feature-icon-box feature-icon-purple">
            <Palette size={24} />
          </div>
          <div className="feature-text">
            <h3>Real-Time Canvas</h3>
            <p>Smooth responsive digital drawing tools with instant synchronized strokes.</p>
          </div>
        </div>

        <div className="card feature-card">
          <div className="feature-icon-box feature-icon-gold">
            <Award size={24} />
          </div>
          <div className="feature-text">
            <h3>Royale Leaderboards</h3>
            <p>Earn score multipliers for lightning-fast correct guesses and win seasonal rewards.</p>
          </div>
        </div>

        <div className="card feature-card">
          <div className="feature-icon-box feature-icon-cyan">
            <Users size={24} />
          </div>
          <div className="feature-text">
            <h3>Instant Rooms</h3>
            <p>Generate one-click room codes to challenge friends across desktop and mobile.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
