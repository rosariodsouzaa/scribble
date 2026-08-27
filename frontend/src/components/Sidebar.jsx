import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Swords,
  ShoppingBag,
  Wallet as WalletIcon,
  Trophy,
  Sparkles,
  LogOut,
  Flame,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";

export default function Sidebar() {
  const { user, logout } = useAuthWallet();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={19} />, label: "Dashboard" },
    { to: "/lobby", icon: <Swords size={19} />, label: "Play Arena", badge: "LIVE" },
    { to: "/store", icon: <ShoppingBag size={19} />, label: "Emporium", badge: "HOT" },
    { to: "/wallet", icon: <WalletIcon size={19} />, label: "Dragon Vault", badge: "WEB3" },
    { to: "/leaderboard", icon: <Trophy size={19} />, label: "Hall of Fame" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  return (
    <aside className="dragon-sidebar">
      {/* Navigation Links */}
      <nav className="sidebar-nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
            {item.badge && <span className="nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Season 4 Pass Card & Logout */}
      <div className="sidebar-bottom-cluster">
        <div className="sidebar-season-card" onClick={() => navigate("/store")} style={{ cursor: "pointer" }}>
          <div className="season-card-top">
            <Sparkles size={14} className="sparkle-icon" />
            <span>SEASON 4 LIVE</span>
          </div>
          <div className="season-card-title">Dragon Pass</div>
          <div className="season-progress-bar">
            <div className="season-progress-fill" style={{ width: "68%" }} />
          </div>
          <span className="season-level-text">Tier 14 / 20 • Upgrade VIP</span>
        </div>

        {user.isAuthenticated && (
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
