import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Trophy,
  Coins,
  Flame,
  Sparkles,
  Edit3,
  Check,
  Save,
  LogOut,
  Mail,
  Calendar,
  Zap,
  Award,
  Swords,
  Crown,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Avatar from "../components/Avatar.jsx";

const COLOR_OPTIONS = [
  { name: "Imperial Gold", hex: "#f59e0b" },
  { name: "Dragon Crimson", hex: "#dc2626" },
  { name: "Jade Emerald", hex: "#10b981" },
  { name: "Void Violet", hex: "#8b5cf6" },
  { name: "Mystic Azure", hex: "#3b82f6" },
  { name: "Solar Orange", hex: "#f97316" },
];

const AVAILABLE_TITLES = [
  "Dragon Novice",
  "Flame Knight",
  "Jade Sentinel",
  "Shadow Artist",
  "Brush Master",
  "Imperial Scholar",
  "Imperial Grandmaster",
  "Dragon Emperor",
];

const ACHIEVEMENTS = [
  { id: 1, title: "First Blood", desc: "Claim victory in your first drawing battle", icon: "🗡️", unlocked: true },
  { id: 2, title: "Speed Demon", desc: "Guess the hidden word in under 5 seconds", icon: "⚡", unlocked: true },
  { id: 3, title: "Vault Tycoon", desc: "Accumulate over 5,000 Dragon Gold", icon: "🪙", unlocked: true },
  { id: 4, title: "Dynasty Master", desc: "Win 25 multiplayer tournament rounds", icon: "👑", unlocked: false },
  { id: 5, title: "Master Drafter", desc: "Have 100% of warriors guess your drawing", icon: "🎨", unlocked: true },
  { id: 6, title: "Web3 Patron", desc: "Link MetaMask Dragon Vault to your identity", icon: "🛡️", unlocked: false },
];

export default function UserProfile() {
  const { user, isAdmin, updateUserProfile, logout, wallet } = useAuthWallet();
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState("overview"); // overview, customize, achievements, security
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "Fierce dragon warrior of the realm.");
  const [title, setTitle] = useState(user.title || "Dragon Novice");
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || "#f59e0b");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    try {
      await updateUserProfile({
        name,
        bio,
        title,
        avatarColor,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate Win Rate
  const matches = Number(user.matches) || 0;
  const wins = Number(user.wins) || 0;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const currentXp = Number(user.xp) || 0;
  const nextLevelXp = (Number(user.level) || 1) * 500;
  const xpProgress = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className="user-profile-page">
      {/* Hero Header Banner */}
      <div className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-hero-avatar-wrapper">
            <Avatar name={user.name} size={90} color={user.avatarColor} />
            {isAdmin && (
              <div className="profile-admin-crown" title="Imperial Admin Authority">
                <Crown size={16} />
              </div>
            )}
          </div>

          <div className="profile-hero-details">
            <div className="profile-hero-name-row">
              <h1 className="profile-hero-name">{user.name}</h1>
              <span className={`profile-role-badge ${isAdmin ? "admin" : "warrior"}`}>
                {isAdmin ? "IMPERIAL ADMIN" : "WARRIOR"}
              </span>
              <span className="profile-title-badge">{user.title || "Dragon Novice"}</span>
            </div>
            <p className="profile-hero-bio">{user.bio || "Fierce dragon warrior of the realm."}</p>

            {/* Level XP Bar */}
            <div className="profile-xp-track">
              <div className="xp-label-row">
                <span className="xp-lvl">LEVEL {user.level || 1}</span>
                <span className="xp-text">
                  {currentXp} / {nextLevelXp} XP ({xpProgress}%)
                </span>
              </div>
              <div className="xp-bar-bg">
                <div className="xp-bar-fill" style={{ width: `${Math.max(8, xpProgress)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="profile-hero-actions">
          {isAdmin && (
            <button className="dragon-btn primary admin-portal-btn" onClick={() => navigate("/admin")}>
              <Shield size={16} />
              <span>Imperial Admin Console</span>
            </button>
          )}
          <button className="dragon-btn secondary" onClick={() => navigate("/lobby")}>
            <Swords size={16} />
            <span>Join Battle Arena</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="profile-sub-tabs">
        <button
          className={`sub-tab-btn ${activeSubTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveSubTab("overview")}
        >
          <Trophy size={16} />
          <span>Combat Overview</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "customize" ? "active" : ""}`}
          onClick={() => setActiveSubTab("customize")}
        >
          <Edit3 size={16} />
          <span>Customize Persona</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "achievements" ? "active" : ""}`}
          onClick={() => setActiveSubTab("achievements")}
        >
          <Award size={16} />
          <span>Achievements</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "security" ? "active" : ""}`}
          onClick={() => setActiveSubTab("security")}
        >
          <Shield size={16} />
          <span>Account Security</span>
        </button>
      </div>

      {/* ===================== SUBTAB 1: OVERVIEW ===================== */}
      {activeSubTab === "overview" && (
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-card-header">
              <Coins size={22} className="stat-card-icon gold" />
              <span>Dragon Gold</span>
            </div>
            <div className="stat-card-value">🪙 {(user.coins || 0).toLocaleString()}</div>
            <span className="stat-card-sub">Usable in Dragon Emporium</span>
          </div>

          <div className="profile-stat-card">
            <div className="stat-card-header">
              <Trophy size={22} className="stat-card-icon trophy" />
              <span>Arena Victories</span>
            </div>
            <div className="stat-card-value">{user.wins || 0}</div>
            <span className="stat-card-sub">Across all battle chambers</span>
          </div>

          <div className="profile-stat-card">
            <div className="stat-card-header">
              <Swords size={22} className="stat-card-icon battles" />
              <span>Total Battles</span>
            </div>
            <div className="stat-card-value">{user.matches || 0}</div>
            <span className="stat-card-sub">Multiplayer matches played</span>
          </div>

          <div className="profile-stat-card">
            <div className="stat-card-header">
              <Zap size={22} className="stat-card-icon winrate" />
              <span>Win Rate</span>
            </div>
            <div className="stat-card-value">{winRate}%</div>
            <span className="stat-card-sub">Accuracy & speed rating</span>
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 2: CUSTOMIZE ===================== */}
      {activeSubTab === "customize" && (
        <form className="profile-customizer-card" onSubmit={handleSaveProfile}>
          <div className="customizer-split">
            {/* Live Preview */}
            <div className="customizer-preview-box">
              <span className="preview-label">Live Persona Preview</span>
              <Avatar name={name || "Warrior"} size={80} color={avatarColor} />
              <div className="preview-info">
                <strong>{name || "Warrior"}</strong>
                <span>{title}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="customizer-controls">
              <div className="form-group">
                <label className="form-label">
                  <User size={15} />
                  <span>Warrior Nickname</span>
                </label>
                <input
                  type="text"
                  className="dragon-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={25}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Crown size={15} />
                  <span>Battle Title</span>
                </label>
                <select
                  className="dragon-select"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  {AVAILABLE_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Edit3 size={15} />
                  <span>Warrior Motto / Bio</span>
                </label>
                <textarea
                  className="dragon-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Sparkles size={15} />
                  <span>Avatar Aura Color</span>
                </label>
                <div className="color-swatches-grid">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      className={`color-swatch-item ${avatarColor === c.hex ? "active" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setAvatarColor(c.hex)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {saveError && <div className="auth-alert error">{saveError}</div>}
          {saveSuccess && <div className="auth-alert success">Warrior profile updated successfully!</div>}

          <div className="customizer-submit-row">
            <button type="submit" className="dragon-btn primary" disabled={saving}>
              {saving ? (
                "Engraving Scroll..."
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Persona</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===================== SUBTAB 3: ACHIEVEMENTS ===================== */}
      {activeSubTab === "achievements" && (
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((item) => (
            <div key={item.id} className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`}>
              <div className="achievement-icon">{item.icon}</div>
              <div className="achievement-details">
                <div className="achievement-title-row">
                  <span className="achievement-title">{item.title}</span>
                  {item.unlocked ? (
                    <span className="achievement-badge-unlocked">UNLOCKED</span>
                  ) : (
                    <span className="achievement-badge-locked">LOCKED</span>
                  )}
                </div>
                <p className="achievement-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================== SUBTAB 4: SECURITY ===================== */}
      {activeSubTab === "security" && (
        <div className="security-card">
          <div className="security-row">
            <div className="security-info">
              <Mail size={18} className="security-icon" />
              <div>
                <strong>Warrior Email Address</strong>
                <p>{user.email || "No email registered (Guest Mode)"}</p>
              </div>
            </div>
            {user.email && <span className="verified-pill">✓ Verified via OTP</span>}
          </div>

          <div className="security-row">
            <div className="security-info">
              <Shield size={18} className="security-icon" />
              <div>
                <strong>Authority Role</strong>
                <p>{isAdmin ? "High Imperial Admin" : "Standard Arena Warrior"}</p>
              </div>
            </div>
            <span className="role-pill">{user.role || "user"}</span>
          </div>

          <div className="security-row">
            <div className="security-info">
              <Calendar size={18} className="security-icon" />
              <div>
                <strong>Session State</strong>
                <p>{user.isAuthenticated ? "Authenticated via Secure JWT" : "Guest Temporary Session"}</p>
              </div>
            </div>
          </div>

          <div className="security-logout-row">
            <button className="dragon-btn secondary danger-hover" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Log Out Warrior Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
