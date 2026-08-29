import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  Swords,
  Coins,
  Activity,
  Database,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Crown,
  Ban,
  UserCheck,
  Sparkles,
  BookOpen,
  Server,
  Zap,
} from "lucide-react";
import { AuthService } from "../services/auth/AuthService.js";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Avatar from "../components/Avatar.jsx";

export default function AdminPanel() {
  const { user: currentAdmin } = useAuthWallet();

  const [activeTab, setActiveTab] = useState("overview"); // overview, users, rooms, wordpacks
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Tab State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [banFilter, setBanFilter] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForGold, setSelectedUserForGold] = useState(null);
  const [goldAmount, setGoldAmount] = useState(1000);

  // Rooms Tab State
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Wordpacks Tab State
  const [wordPacks, setWordPacks] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newWordsInput, setNewWordsInput] = useState("");
  const [loadingWordPacks, setLoadingWordPacks] = useState(false);

  // Notifications
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "info" });

  const showNotification = (text, type = "info") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: "", type: "info" }), 4000);
  };

  // Load telemetry stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await AuthService.getAdminStats();
      setStats(data);
    } catch (err) {
      showNotification(err.message || "Failed to load telemetry stats", "error");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load users list
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const filters = {};
      if (userSearch) filters.search = userSearch;
      if (roleFilter !== "all") filters.role = roleFilter;
      if (banFilter !== "all") filters.isBanned = banFilter;

      const list = await AuthService.getAdminUsers(filters);
      setUsers(list || []);
    } catch (err) {
      showNotification(err.message || "Failed to load warriors directory", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch, roleFilter, banFilter]);

  // Load active rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const list = await AuthService.getAdminRooms();
      setRooms(list || []);
    } catch (err) {
      showNotification(err.message || "Failed to load battle chambers", "error");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  // Load word packs
  const fetchWordPacks = useCallback(async () => {
    try {
      setLoadingWordPacks(true);
      const packs = await AuthService.getWordPacks();
      setWordPacks(packs || []);
    } catch (err) {
      showNotification(err.message || "Failed to load word packs", "error");
    } finally {
      setLoadingWordPacks(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "rooms") fetchRooms();
    if (activeTab === "wordpacks") fetchWordPacks();
  }, [activeTab, fetchUsers, fetchRooms, fetchWordPacks]);

  // Handle role change
  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await AuthService.updateUserRole(user.id || user._id, newRole);
      showNotification(`Updated ${user.name}'s role to ${newRole.toUpperCase()}`, "success");
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to update role", "error");
    }
  };

  // Handle ban toggle
  const handleBanToggle = async (user) => {
    const nextBanState = !user.isBanned;
    try {
      await AuthService.toggleUserBan(
        user.id || user._id,
        nextBanState,
        nextBanState ? "Banished by Imperial Grandmaster." : ""
      );
      showNotification(
        nextBanState ? `Banished ${user.name} from dynasty.` : `Banishment lifted for ${user.name}.`,
        "success"
      );
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to update ban status", "error");
    }
  };

  // Handle grant gold
  const handleGrantGoldSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForGold) return;

    try {
      await AuthService.grantUserGold(selectedUserForGold.id || selectedUserForGold._id, goldAmount);
      showNotification(`Granted ${goldAmount} Gold to ${selectedUserForGold.name}!`, "success");
      setSelectedUserForGold(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to grant gold", "error");
    }
  };

  // Handle terminate chamber
  const handleTerminateRoom = async (roomCode) => {
    if (!window.confirm(`Are you sure you want to terminate battle chamber ${roomCode}?`)) return;
    try {
      await AuthService.terminateRoom(roomCode);
      showNotification(`Chamber ${roomCode} terminated successfully.`, "success");
      fetchRooms();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to terminate chamber", "error");
    }
  };

  // Handle add custom word pack
  const handleAddWordPack = async (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !newWordsInput.trim()) {
      showNotification("Please provide a category name and words list", "error");
      return;
    }

    const words = newWordsInput
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1);

    if (words.length === 0) {
      showNotification("Please provide at least one valid word", "error");
      return;
    }

    try {
      await AuthService.addWordPack(newCategory, words);
      showNotification(`Added ${words.length} words to category '${newCategory}'!`, "success");
      setNewCategory("");
      setNewWordsInput("");
      fetchWordPacks();
    } catch (err) {
      showNotification(err.message || "Failed to register word pack", "error");
    }
  };

  return (
    <div className="admin-panel-page">
      {/* Admin Title Header */}
      <div className="admin-header-card">
        <div className="admin-header-title-block">
          <div className="admin-crown-badge">
            <Crown size={28} />
          </div>
          <div>
            <h1 className="admin-title">IMPERIAL ADMIN CONSOLE</h1>
            <p className="admin-subtitle">
              Grandmaster Command Deck • Logged in as <strong>{currentAdmin?.name}</strong>
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button className="dragon-btn secondary" onClick={fetchStats} title="Refresh Telemetry">
            <RefreshCw size={15} className={loadingStats ? "spin" : ""} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage.text && (
        <div className={`auth-alert ${statusMessage.type === "error" ? "error" : "success"}`}>
          {statusMessage.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Telemetry Metrics HUD */}
      {stats && (
        <div className="admin-metrics-hud">
          <div className="hud-card">
            <div className="hud-icon-wrap warriors">
              <Users size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Registered Warriors</span>
              <span className="hud-value">{stats.totalWarriors}</span>
              <small className="hud-sub">{stats.adminCount} Grandmasters</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap rooms">
              <Swords size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Live Chambers</span>
              <span className="hud-value">{stats.activeBattleRooms}</span>
              <small className="hud-sub">Active rooms</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap gold">
              <Coins size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Circulating Gold</span>
              <span className="hud-value">🪙 {stats.totalCirculatingGold.toLocaleString()}</span>
              <small className="hud-sub">Across all players</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap db">
              <Database size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Database Provider</span>
              <span className="hud-value" style={{ fontSize: "17px" }}>
                {stats.database.isConnected ? "Neon PostgreSQL ⚡" : "In-Memory Vault ⚡"}
              </span>
              <small className="hud-sub">
                {stats.database.isConnected ? "AWS us-east-2 (Live)" : "Local Fast-Cache"}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sub Navigation */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={16} />
          <span>Overview & Health</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          <span>Warrior Directory</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          <Swords size={16} />
          <span>Live Chambers</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "wordpacks" ? "active" : ""}`}
          onClick={() => setActiveTab("wordpacks")}
        >
          <BookOpen size={16} />
          <span>Word Pack Studio</span>
        </button>
      </div>

      {/* ======================= TAB 1: OVERVIEW ======================= */}
      {activeTab === "overview" && stats && (
        <div className="admin-overview-grid">
          <div className="overview-card">
            <h3>
              <Server size={18} />
              <span>Server Diagnostics</span>
            </h3>
            <div className="diagnostics-list">
              <div className="diag-item">
                <span>Server Uptime</span>
                <strong>{Math.floor(stats.serverUptimeSec / 60)} minutes ({stats.serverUptimeSec}s)</strong>
              </div>
              <div className="diag-item">
                <span>Node.js Memory Heap</span>
                <strong>{stats.memory?.heapUsedMB || 0} MB used</strong>
              </div>
              <div className="diag-item">
                <span>Resident Set Size (RSS)</span>
                <strong>{stats.memory?.rssMB || 0} MB</strong>
              </div>
              <div className="diag-item">
                <span>Banned Accounts</span>
                <strong style={{ color: stats.bannedCount > 0 ? "#ef4444" : "#10b981" }}>
                  {stats.bannedCount} warriors
                </strong>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h3>
              <Database size={18} />
              <span>Database Architecture</span>
            </h3>
            <div className="diagnostics-list">
              <div className="diag-item">
                <span>Storage Engine</span>
                <strong>{stats.database.provider || "Neon Serverless PostgreSQL"}</strong>
              </div>
              <div className="diag-item">
                <span>Connection Endpoint</span>
                <code style={{ fontSize: "12px", color: "#fbbf24" }}>{stats.database.uri}</code>
              </div>
              <div className="diag-item">
                <span>PostgreSQL Connection State</span>
                <span className={`status-tag ${stats.database.isConnected ? "online" : "offline"}`}>
                  {stats.database.isConnected ? "Connected (Neon DB Live)" : "Fallback Mode"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: WARRIORS DIRECTORY ======================= */}
      {activeTab === "users" && (
        <div className="admin-users-section">
          {/* Filter Bar */}
          <div className="users-filter-bar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search warriors by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="filter-select-group">
              <Filter size={15} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="user">Warriors</option>
                <option value="admin">Imperial Admins</option>
              </select>

              <select value={banFilter} onChange={(e) => setBanFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="false">Active Only</option>
                <option value="true">Banned Only</option>
              </select>

              <button className="dragon-btn secondary sm" onClick={fetchUsers}>
                Refresh
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-container">
            {loadingUsers ? (
              <div className="admin-table-loading">Scanning Dynasty archives...</div>
            ) : users.length === 0 ? (
              <div className="admin-table-empty">No warriors match your search filter.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Warrior</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Gold Coins</th>
                    <th>Rank / Wins</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id || u._id} className={u.isBanned ? "banned-row" : ""}>
                      <td>
                        <div className="user-cell">
                          <Avatar name={u.name} size={32} color={u.avatarColor} />
                          <div>
                            <div className="user-name-row">
                              <strong>{u.name}</strong>
                              {u.role === "admin" && <Crown size={12} color="#ffd700" />}
                            </div>
                            <small className="user-title-text">{u.title || "Dragon Novice"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="email-text">{u.email}</span>
                        {u.isVerified && <span className="verified-badge">✓</span>}
                      </td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <strong>🪙 {(u.coins || 0).toLocaleString()}</strong>
                      </td>
                      <td>
                        <span>LVL {u.level || 1} • {u.wins || 0} Wins</span>
                      </td>
                      <td>
                        {u.isBanned ? (
                          <span className="status-badge banned">BANISHED</span>
                        ) : (
                          <span className="status-badge active">ACTIVE</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button
                            className="action-btn gold"
                            title="Grant Dragon Gold"
                            onClick={() => setSelectedUserForGold(u)}
                          >
                            <Coins size={14} />
                          </button>

                          <button
                            className={`action-btn role ${u.role === "admin" ? "demote" : "promote"}`}
                            title={u.role === "admin" ? "Demote to Warrior" : "Promote to Admin"}
                            onClick={() => handleRoleToggle(u)}
                          >
                            <Crown size={14} />
                          </button>

                          <button
                            className={`action-btn ban ${u.isBanned ? "unban" : "ban"}`}
                            title={u.isBanned ? "Lift Banishment" : "Banish Warrior"}
                            onClick={() => handleBanToggle(u)}
                          >
                            {u.isBanned ? <UserCheck size={14} /> : <Ban size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Grant Gold Modal */}
          {selectedUserForGold && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedUserForGold(null)}>
              <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>Grant Dragon Gold</h3>
                <p>
                  Bestowing imperial treasury coins to <strong>{selectedUserForGold.name}</strong>.
                </p>
                <form onSubmit={handleGrantGoldSubmit}>
                  <div className="form-group">
                    <label>Gold Amount</label>
                    <input
                      type="number"
                      className="dragon-input"
                      value={goldAmount}
                      onChange={(e) => setGoldAmount(Number(e.target.value))}
                      min={100}
                      step={100}
                      required
                    />
                  </div>

                  <div className="quick-gold-chips">
                    {[1000, 5000, 10000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className="quick-chip"
                        onClick={() => setGoldAmount(amt)}
                      >
                        +{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="modal-actions-row">
                    <button
                      type="button"
                      className="dragon-btn secondary"
                      onClick={() => setSelectedUserForGold(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="dragon-btn primary">
                      Bestow Gold
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: LIVE BATTLE CHAMBERS ======================= */}
      {activeTab === "rooms" && (
        <div className="admin-rooms-section">
          <div className="rooms-header-row">
            <h3>Active Multiplayer Battle Chambers ({rooms.length})</h3>
            <button className="dragon-btn secondary sm" onClick={fetchRooms}>
              <RefreshCw size={14} className={loadingRooms ? "spin" : ""} />
              <span>Refresh Chambers</span>
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="admin-table-empty">No active battle chambers at the moment.</div>
          ) : (
            <div className="chambers-grid">
              {rooms.map((rm) => (
                <div key={rm.code} className="chamber-card">
                  <div className="chamber-card-top">
                    <span className="chamber-code">CHAMBER {rm.code}</span>
                    <span className={`chamber-state-pill ${rm.state}`}>{rm.state.toUpperCase()}</span>
                  </div>

                  <div className="chamber-details">
                    <div>
                      <span>Warriors:</span> <strong>{rm.playerCount}</strong>
                    </div>
                    <div>
                      <span>Round:</span> <strong>{rm.currentRound} / {rm.maxRounds}</strong>
                    </div>
                    <div>
                      <span>Drawer:</span> <strong>{rm.currentDrawer || "None"}</strong>
                    </div>
                  </div>

                  <div className="chamber-players-list">
                    {rm.players?.map((p, idx) => (
                      <span key={idx} className="player-tag">
                        {p.name} ({p.score} pts) {p.isHost ? "👑" : ""}
                      </span>
                    ))}
                  </div>

                  <div className="chamber-card-bottom">
                    <button
                      className="dragon-btn secondary danger-hover sm"
                      onClick={() => handleTerminateRoom(rm.code)}
                    >
                      <Trash2 size={14} />
                      <span>Terminate Chamber</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 4: WORD PACK STUDIO ======================= */}
      {activeTab === "wordpacks" && (
        <div className="admin-wordpacks-section">
          {/* Add Word Pack Form */}
          <form className="add-pack-card" onSubmit={handleAddWordPack}>
            <h3>
              <Plus size={18} />
              <span>Register New Secret Word Pack</span>
            </h3>

            <div className="form-group">
              <label>Category Theme Name</label>
              <input
                type="text"
                className="dragon-input"
                placeholder="e.g. Mythological Weapons, Marvel, Cyberpunk"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Words List (Comma or newline separated)</label>
              <textarea
                className="dragon-textarea"
                placeholder="dragon, katana, excalibur, mjolnir, trident, valkyrie"
                value={newWordsInput}
                onChange={(e) => setNewWordsInput(e.target.value)}
                rows={3}
                required
              />
            </div>

            <button type="submit" className="dragon-btn primary">
              <Sparkles size={16} />
              <span>Register Word Pack into Engine</span>
            </button>
          </form>

          {/* Active Word Packs Grid */}
          <div className="wordpacks-grid">
            {wordPacks.map((pack) => (
              <div key={pack.category} className="wordpack-card">
                <div className="wordpack-top">
                  <span className="pack-category">{pack.category.toUpperCase()}</span>
                  <span className="pack-count">{pack.count} Words</span>
                </div>
                <div className="pack-samples">
                  {pack.sampleWords?.map((w, idx) => (
                    <span key={idx} className="sample-word-pill">
                      {w}
                    </span>
                  ))}
                  {pack.count > 10 && <span className="sample-word-more">+{pack.count - 10} more</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
