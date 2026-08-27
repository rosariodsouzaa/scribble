import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, PlusCircle, ShoppingBag, Wallet, ShieldCheck, LogOut } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useGame();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <aside className="sidebar">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/join-room"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <Gamepad2 size={20} />
        <span>Join Room</span>
      </NavLink>

      <NavLink
        to="/create-room"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <PlusCircle size={20} />
        <span>Create Room</span>
      </NavLink>

      <NavLink
        to="/wallet"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <Wallet size={20} />
        <span>Wallet</span>
      </NavLink>

      <NavLink
        to="/game/play"
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
      >
        <ShoppingBag size={20} />
        <span>Game Arena</span>
      </NavLink>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <NavLink
          to="/login"
          onClick={logout}
          className="sidebar-nav-item"
          style={{ color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
