import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Coins } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, wallet } = useGame();
  const location = useLocation();

  // Determine current page breadcrumb
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard > Overview';
      case '/wallet':
        return 'Dashboard > Connect Wallet';
      case '/game':
        return 'Dashboard > Game Home';
      case '/create-room':
        return 'Dashboard > Create Room';
      case '/join-room':
        return 'Dashboard > Join Room';
      case '/lobby':
        return 'Dashboard > Game Lobby';
      case '/game/play':
        return 'Dashboard > Active Game';
      default:
        return 'Scribble Royale';
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) return null;

  return (
    <header className="navbar">
      <Link to="/dashboard" className="nav-brand">
        <div className="brand-icon-box">
          <img src="/logo-icon.svg" alt="Scribble Royale" className="brand-icon-img" />
        </div>
        <span>Scribble Royale</span>
      </Link>

      <div className="nav-center">
        <div className="nav-breadcrumb">
          <span>{getBreadcrumb()}</span>
        </div>

        <div className="nav-search">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search games, players..." aria-label="Search" />
        </div>
      </div>

      <div className="nav-right">
        {/* Coin Balance */}
        <div className="coin-badge" title="Royale Coins">
          <Coins size={16} />
          <span>{user?.coins?.toLocaleString() || '2,450'}</span>
        </div>

        {/* Notifications */}
        <button type="button" className="notif-btn" title="Notifications">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>

        {/* User Profile */}
        <Link to="/dashboard" className="user-profile-pill">
          <Avatar
            name={user?.name || 'Bhakti'}
            size={32}
            color="#8b5cf6"
          />
          <div className="user-profile-info">
            <span className="user-profile-name">{user?.name || 'Bhakti'}</span>
            <span className="user-profile-role">{user?.role || 'Pro Player'}</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
