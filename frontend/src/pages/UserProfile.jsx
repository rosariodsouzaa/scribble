import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import { AuthService } from "../services/auth/AuthService.js";
import Avatar from "../components/Avatar.jsx";
import TransactionHistory from "../components/TransactionHistory.jsx";

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


export default function UserProfile() {
  const { user, isAdmin, updateUserProfile, logout, wallet } = useAuthWallet();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const [activeSubTab, setActiveSubTab] = useState(
    ["overview", "customize", "achievements", "transactions", "security"].includes(tabParam)
      ? tabParam
      : "overview"
  );

  useEffect(() => {
    if (tabParam && ["overview", "customize", "achievements", "transactions", "security"].includes(tabParam)) {
      setActiveSubTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveSubTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "Fierce dragon warrior of the realm.");
  const [title, setTitle] = useState(user.title || "Dragon Novice");
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || "#f59e0b");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError("");

    const cleanName = String(name || "").trim();
    if (!cleanName || cleanName.length < 2) {
      setSaveError("Warrior nickname must be at least 2 valid characters.");
      setSaving(false);
      return;
    }
    if (cleanName.length > 25) {
      setSaveError("Warrior nickname cannot exceed 25 characters.");
      setSaving(false);
      return;
    }

    try {
      await updateUserProfile({
        name: cleanName,
        bio: String(bio || "").trim(),
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwSuccess("");
    setPwError("");

    if (!currentPassword) {
      setPwError("Please enter your current passcode.");
      setPwSaving(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPwError("New passcode must be at least 6 characters long.");
      setPwSaving(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwError("New passcodes do not match. Please verify.");
      setPwSaving(false);
      return;
    }

    try {
      const res = await AuthService.changePassword({ currentPassword, newPassword });
      setPwSuccess(res.message || "Passcode changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to change passcode.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate Win Rate
  const matches = Number(user.matches) || 0;
  const wins = Number(user.wins) || 0;
  const winRate = matches > 0? Math.round((wins / matches) * 100): 0;
  const currentXp = Number(user.xp) || 0;
  const nextLevelXp = (Number(user.level) || 1) * 500;
  const xpProgress = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  const dynamicAchievements = [
    {
      id: "first_blood",
      title: "First Blood",
      desc: "Claim victory in your first drawing battle",
      icon: "🗡️",
      current: wins,
      target: 1,
      unlocked: wins >= 1,
      label: `${Math.min(wins, 1)} / 1 Win`,
    },
    {
      id: "speed_striker",
      title: "Speed Striker",
      desc: "Score 5 arena battle victories across chambers",
      icon: "⚡",
      current: wins,
      target: 5,
      unlocked: wins >= 5,
      label: `${Math.min(wins, 5)} / 5 Wins`,
    },
    {
      id: "vault_tycoon",
      title: "Vault Tycoon",
      desc: "Accumulate over 5,000 Dragon Gold in treasury",
      icon: "🪙",
      current: Number(user.coins) || 0,
      target: 5000,
      unlocked: (Number(user.coins) || 0) >= 5000,
      label: `${(Number(user.coins) || 0).toLocaleString()} / 5,000 Gold`,
    },
    {
      id: "dynasty_champion",
      title: "Dynasty Champion",
      desc: "Win 25 multiplayer tournament matches",
      icon: "👑",
      current: wins,
      target: 25,
      unlocked: wins >= 25,
      label: `${Math.min(wins, 25)} / 25 Wins`,
    },
    {
      id: "battle_veteran",
      title: "Battle Hardened",
      desc: "Complete 10 multiplayer arena battles",
      icon: "🛡️",
      current: matches,
      target: 10,
      unlocked: matches >= 10,
      label: `${Math.min(matches, 10)} / 10 Battles`,
    },
    {
      id: "web3_patron",
      title: "Web3 Patron",
      desc: "Link MetaMask Dragon Vault to your identity",
      icon: "🦊",
      current: wallet?.isConnected ? 1 : 0,
      target: 1,
      unlocked: Boolean(wallet?.isConnected),
      label: wallet?.isConnected ? "Vault Linked" : "Not Linked",
    },
    {
      id: "imperial_scholar",
      title: "Imperial Scholar",
      desc: "Advance to Level 5 or higher in the dynasty",
      icon: "📜",
      current: Number(user.level) || 1,
      target: 5,
      unlocked: (Number(user.level) || 1) >= 5,
      label: `Level ${user.level || 1} / 5`,
    },
    {
      id: "grandmaster_authority",
      title: "High Grandmaster",
      desc: "Attain Imperial Admin Authority over the realm",
      icon: "⭐",
      current: isAdmin ? 1 : 0,
      target: 1,
      unlocked: Boolean(isAdmin),
      label: isAdmin ? "Imperial Authority" : "Warrior Rank",
    },
  ];

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
              <span className={`profile-role-badge ${isAdmin? "admin": "warrior"}`}>
                {isAdmin? "IMPERIAL ADMIN": "WARRIOR"}
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
          onClick={() => handleTabChange("overview")}
        >
          <Trophy size={16} />
          <span>Combat Overview</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "customize" ? "active" : ""}`}
          onClick={() => handleTabChange("customize")}
        >
          <Edit3 size={16} />
          <span>Customize Persona</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "achievements" ? "active" : ""}`}
          onClick={() => handleTabChange("achievements")}
        >
          <Award size={16} />
          <span>Achievements</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "transactions" ? "active" : ""}`}
          onClick={() => handleTabChange("transactions")}
        >
          <Receipt size={16} />
          <span>Transaction History</span>
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "security" ? "active" : ""}`}
          onClick={() => handleTabChange("security")}
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
            <div className="stat-card-value"> {(user.coins || 0).toLocaleString()}</div>
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
                      aria-label={`Select ${c.name} aura color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="auth-alert error animate-fade-in" role="alert">
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}
          {saveSuccess && (
            <div className="auth-alert success animate-fade-in" role="alert">
              <CheckCircle2 size={16} />
              <span>Warrior profile updated successfully!</span>
            </div>
          )}

          <div className="customizer-submit-row">
            <button type="submit" className="dragon-btn primary" disabled={saving}>
              {saving? (
                "Engraving Scroll..."
              ): (
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
        <div className="achievements-section">
          <div className="achievements-header-summary">
            <div className="achievements-count-badge">
              <Award size={18} color="#f59e0b" />
              <span>
                <strong>{dynamicAchievements.filter((a) => a.unlocked).length}</strong> / {dynamicAchievements.length} UNLOCKED
              </span>
            </div>
            <p className="achievements-sub">Conquer challenges in the multiplayer arena to unlock dynasty badges.</p>
          </div>

          <div className="achievements-grid">
            {dynamicAchievements.map((item) => {
              const progressPct = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 100;

              return (
                <div key={item.id} className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">{item.icon}</div>
                  <div className="achievement-details">
                    <div className="achievement-title-row">
                      <span className="achievement-title">{item.title}</span>
                      {item.unlocked ? (
                        <span className="achievement-badge-unlocked">✓ UNLOCKED</span>
                      ) : (
                        <span className="achievement-badge-locked">LOCKED</span>
                      )}
                    </div>
                    <p className="achievement-desc">{item.desc}</p>

                    {/* Live Progress Meter */}
                    <div className="achievement-progress-wrap">
                      <div className="achievement-progress-track">
                        <div
                          className={`achievement-progress-fill ${item.unlocked ? "completed" : ""}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="achievement-progress-text">{item.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 4: SECURITY ===================== */}
      {activeSubTab === "security" && (
        <div className="security-section-container">
          <div className="security-card">
            <h3 className="security-card-title">
              <Shield size={18} />
              <span>Warrior Account Credentials</span>
            </h3>

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
          </div>

          {/* Change Battle Passcode Card */}
          {user.isAuthenticated && user.email && (
            <form className="security-card change-password-card" onSubmit={handleChangePassword}>
              <h3 className="security-card-title">
                <KeyRound size={18} />
                <span>Change Battle Passcode</span>
              </h3>
              <p className="change-pw-sub">
                Re-forge your secret battle key. Requires your existing passcode for verification.
              </p>

              {pwError && (
                <div className="auth-alert error">
                  <AlertCircle size={16} />
                  <span>{pwError}</span>
                </div>
              )}
              {pwSuccess && (
                <div className="auth-alert success">
                  <CheckCircle2 size={16} />
                  <span>{pwSuccess}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} />
                  <span>Current Passcode</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="dragon-input"
                    placeholder="Enter current passcode"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} />
                  <span>New Battle Passcode</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="dragon-input"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} />
                  <span>Confirm New Passcode</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    className="dragon-input"
                    placeholder="Re-enter new passcode"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  >
                    {showConfirmNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="change-pw-action-row">
                <button
                  type="submit"
                  className="dragon-btn primary"
                  disabled={pwSaving || (confirmNewPassword && newPassword !== confirmNewPassword)}
                >
                  {pwSaving ? "Re-forging Key..." : "Update Battle Passcode"}
                </button>
              </div>
            </form>
          )}

          <div className="security-card logout-card">
            <div className="security-logout-row">
              <button className="dragon-btn secondary danger-hover" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Log Out Warrior Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 5: TRANSACTIONS ===================== */}
      {activeSubTab === "transactions" && (
        <div className="profile-tx-tab-wrap animate-fade-in" style={{ marginTop: "8px" }}>
          <TransactionHistory
            title="Warrior Treasury & Purchase History"
            showHeader={true}
          />
        </div>
      )}
    </div>
  );
}
