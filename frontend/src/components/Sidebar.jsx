import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Swords,
  Users,
  Wallet as WalletIcon,
  Trophy,
  Sparkles,
  HelpCircle,
  Flame,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={19} />, label: "Dashboard" },
    { to: "/lobby", icon: <Swords size={19} />, label: "Play Arena", badge: "LIVE" },
    { to: "/wallet", icon: <WalletIcon size={19} />, label: "Dragon Vault", badge: "WEB3" },
    { to: "/leaderboard", icon: <Trophy size={19} />, label: "Hall of Fame" },
  ];

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

      {/* Season 4 Pass Card */}
      <div className="sidebar-season-card">
        <div className="season-card-top">
          <Sparkles size={14} className="sparkle-icon" />
          <span>SEASON 4 LIVE</span>
        </div>
        <div className="season-card-title">Dragon Pass</div>
        <div className="season-progress-bar">
          <div className="season-progress-fill" style={{ width: "68%" }} />
        </div>
        <span className="season-level-text">Tier 14 / 20 Completed</span>
      </div>
    </aside>
  );
}
