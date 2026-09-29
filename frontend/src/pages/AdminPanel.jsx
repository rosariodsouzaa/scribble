import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  LogOut,
  Gamepad2,
  Info,
  UserMinus,
  UserPlus,
  Flame,
  Receipt,
} from "lucide-react";
import { AuthService } from "../services/auth/AuthService.js";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import Avatar from "../components/Avatar.jsx";
import TransactionHistory from "../components/TransactionHistory.jsx";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user: currentAdmin, logout } = useAuthWallet();

  const [activeTab, setActiveTab] = useState("users"); // overview, users, rooms, wordpacks
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Player Management (Users) Tab State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [banFilter, setBanFilter] = useState("all");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForGold, setSelectedUserForGold] = useState(null);
  const [goldAmount, setGoldAmount] = useState(1000);

  // Add Player to Game Modal State
  const [selectedPlayerForRoom, setSelectedPlayerForRoom] = useState(null);
  const [targetRoomCode, setTargetRoomCode] = useState("");

  // Remove Player Confirmation Modal State (from room)
  const [playerToRemoveFromRoom, setPlayerToRemoveFromRoom] = useState(null);

  // Delete User Account Confirmation Modal State (from database)
  const [userToDelete, setUserToDelete] = useState(null);
  const [purgingDummy, setPurgingDummy] = useState(false);

  // View Player Details Modal State
  const [viewingPlayerDetails, setViewingPlayerDetails] = useState(null);

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
    setTimeout(() => setStatusMessage({ text: "", type: "info" }), 4500);
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

  // Load registered players list
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const filters = {};
      if (userSearch) filters.search = userSearch;
      if (roleFilter !== "all") filters.role = roleFilter;
      if (banFilter !== "all") filters.isBanned = banFilter;

      const list = await AuthService.getAdminPlayers(filters);
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

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchRooms();
  }, [fetchStats, fetchRooms]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
      fetchRooms();
    }
    if (activeTab === "rooms") fetchRooms();
    if (activeTab === "wordpacks") fetchWordPacks();
    if (activeTab === "overview") fetchStats();
  }, [activeTab, fetchUsers, fetchRooms, fetchWordPacks, fetchStats]);

  // Admin Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Add Player to Game Room
  const handleAddPlayerToRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlayerForRoom) return;

    const cleanRoomCode = targetRoomCode.trim().toUpperCase();
    if (!cleanRoomCode) {
      showNotification("Please select or enter a battle chamber code.", "error");
      return;
    }

    try {
      const res = await AuthService.addPlayerToRoom(cleanRoomCode, {
        userId: selectedPlayerForRoom.id || selectedPlayerForRoom._id,
        playerName: selectedPlayerForRoom.name,
      });

      showNotification(
        res.message || `Warrior ${selectedPlayerForRoom.name} successfully deployed to Chamber ${cleanRoomCode}!`,
        "success"
      );
      setSelectedPlayerForRoom(null);
      setTargetRoomCode("");
      fetchUsers();
      fetchRooms();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to deploy player to chamber", "error");
    }
  };

  // Remove Player from Game Room (Confirmation callback)
  const handleRemovePlayerFromRoomConfirm = async () => {
    if (!playerToRemoveFromRoom) return;
    const { roomCode, player } = playerToRemoveFromRoom;

    try {
      const targetIdentifier = player.socketId || player.id || player.clientId || player.name;
      const res = await AuthService.removePlayerFromRoom(roomCode, targetIdentifier);

      showNotification(
        res.message || `Warrior removed from Chamber ${roomCode}. Player account preserved.`,
        "success"
      );
      setPlayerToRemoveFromRoom(null);
      fetchRooms();
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to remove player from chamber", "error");
    }
  };

  // Role toggle
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

  // Ban toggle
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

  // Grant gold
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

  // Delete Account from Database (Confirmation callback)
  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    try {
      const res = await AuthService.deleteUser(userToDelete.id || userToDelete._id);
      showNotification(res.message || `Account for ${userToDelete.name} permanently deleted from database.`, "success");
      setUserToDelete(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to delete account from database", "error");
    }
  };

  // Purge all dummy test accounts from database
  const handlePurgeDummyAccounts = async () => {
    if (!window.confirm("Purge all mock and automated test accounts from the database? Real player accounts will be preserved.")) return;
    try {
      setPurgingDummy(true);
      const res = await AuthService.purgeDummyAccounts();
      showNotification(res.message || "Dummy accounts successfully purged!", "success");
      fetchUsers();
      fetchStats();
    } catch (err) {
      showNotification(err.message || "Failed to purge dummy accounts", "error");
    } finally {
      setPurgingDummy(false);
    }
  };

  // Terminate chamber
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

  // Add custom word pack
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
            <h1 className="admin-title">IMPERIAL ADMIN CONTROL SANCTUARY</h1>
            <p className="admin-subtitle">
              Imperial Control Center • Logged in as <strong>{currentAdmin?.name}</strong> (Grandmaster)
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button className="dragon-btn secondary" onClick={fetchStats} title="Refresh Telemetry">
            <RefreshCw size={15} className={loadingStats ? "spin" : ""} />
            <span>Sync Telemetry</span>
          </button>
          <button className="dragon-btn secondary danger-hover" onClick={handleLogout} title="Log Out Imperial Session">
            <LogOut size={15} />
            <span>Imperial Logout</span>
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
              <span className="hud-label">Total Players</span>
              <span className="hud-value">{stats.totalPlayers ?? stats.totalWarriors}</span>
              <small className="hud-sub">{stats.adminCount} Admins in Dynasty</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap rooms">
              <Swords size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Active Rooms</span>
              <span className="hud-value">{stats.activeBattleRooms}</span>
              <small className="hud-sub">Live Chambers</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap gold">
              <Activity size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Players In Game</span>
              <span className="hud-value">{stats.playersCurrentlyPlaying ?? 0}</span>
              <small className="hud-sub">Active Battlers</small>
            </div>
          </div>

          <div className="hud-card">
            <div className="hud-icon-wrap db">
              <Coins size={20} />
            </div>
            <div className="hud-info">
              <span className="hud-label">Circulating Gold</span>
              <span className="hud-value">{(stats.totalCirculatingGold || 0).toLocaleString()}</span>
              <small className="hud-sub">{stats.totalTransactions} Transactions</small>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sub Navigation */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          <span>Player Management</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "rooms" ? "active" : ""}`}
          onClick={() => setActiveTab("rooms")}
        >
          <Swords size={16} />
          <span>Active Games / Rooms</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          <Receipt size={16} />
          <span>Overall Transactions</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Activity size={16} />
          <span>System Diagnostics</span>
        </button>
        <button
          className={`admin-nav-btn ${activeTab === "wordpacks" ? "active" : ""}`}
          onClick={() => setActiveTab("wordpacks")}
        >
          <BookOpen size={16} />
          <span>Word Pack Studio</span>
        </button>
      </div>

      {/* ======================= TAB 1: PLAYER MANAGEMENT ======================= */}
      {activeTab === "users" && (
        <div className="admin-users-section">
          {/* Filter Bar */}
          <div className="users-filter-bar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search players by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="filter-select-group">
              <Filter size={15} />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All Accounts (users & admins)</option>
                <option value="user">Warriors (users table)</option>
                <option value="admin">Admins (admins table)</option>
              </select>

              <select value={banFilter} onChange={(e) => setBanFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="false">Active Only</option>
                <option value="true">Banned Only</option>
              </select>

              <button className="dragon-btn secondary sm" onClick={fetchUsers} title="Refresh accounts list">
                <RefreshCw size={13} className={loadingUsers ? "spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                className="dragon-btn secondary danger-hover sm"
                onClick={handlePurgeDummyAccounts}
                disabled={purgingDummy}
                title="Purge all mock and automated test accounts"
              >
                <Trash2 size={13} />
                <span>{purgingDummy ? "Purging..." : "Purge Test Accounts"}</span>
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="admin-table-container">
            {loadingUsers ? (
              <div className="admin-table-loading">Scanning Player Archives in database...</div>
            ) : users.length === 0 ? (
              <div className="admin-table-empty">No accounts match your search filter.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Player / Warrior</th>
                    <th>Email</th>
                    <th>Status / Chamber</th>
                    <th>Gold Coins</th>
                    <th>Rank / Wins</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isOnline = u.status === "Online" || u.isOnline;
                    const inRoom = Boolean(u.currentRoom);
                    const isBanned = Boolean(u.isBanned);

                    return (
                      <tr key={u.id || u._id} className={isBanned ? "banned-row" : ""}>
                        <td>
                          <div className="user-cell">
                            <Avatar name={u.name} size={32} color={u.avatarColor} />
                            <div>
                              <div className="user-name-row">
                                <strong>{u.name}</strong>
                                {u.role === "admin" && <Crown size={12} color="#ffd700" title="Admin" />}
                              </div>
                              <small className="user-title-text">{u.title || "Dragon Novice"}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="email-text">{u.email}</span>
                          {u.isVerified && <span className="verified-badge" title="Verified Account"></span>}
                        </td>
                        <td>
                          {inRoom ? (
                            <span className="status-badge in-battle">
                              In Chamber #{u.currentRoom}
                            </span>
                          ) : isBanned ? (
                            <span className="status-badge banned">BANISHED</span>
                          ) : isOnline ? (
                            <span className="status-badge online">ONLINE</span>
                          ) : (
                            <span className="status-badge offline">OFFLINE</span>
                          )}
                        </td>
                        <td>
                          <strong> {(u.coins || 0).toLocaleString()}</strong>
                        </td>
                        <td>
                          <span>LVL {u.level || 1} • {u.wins || 0} Wins</span>
                        </td>
                        <td>
                        <div className="action-buttons-group">
                          {/* Add to Game Button (Players only) */}
                          {u.role !== "admin" && (
                            <button
                              className="action-btn game"
                              title="Add Player to Game/Room"
                              onClick={() => {
                                setSelectedPlayerForRoom(u);
                                setTargetRoomCode(rooms[0]?.code || "");
                              }}
                            >
                              <Gamepad2 size={15} />
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            className="action-btn info"
                            title="View Player Details"
                            onClick={() => setViewingPlayerDetails(u)}
                          >
                            <Info size={14} />
                          </button>

                          {/* Grant Gold Button */}
                          {u.role !== "admin" && (
                            <button
                              className="action-btn gold"
                              title="Grant Dragon Gold"
                              onClick={() => setSelectedUserForGold(u)}
                            >
                              <Coins size={14} />
                            </button>
                          )}

                          {/* Ban Button (Players only) */}
                          {u.role !== "admin" && (
                            <button
                              className={`action-btn ban ${u.isBanned ? "unban" : "ban"}`}
                              title={u.isBanned ? "Lift Banishment" : "Banish Player"}
                              onClick={() => handleBanToggle(u)}
                            >
                              {u.isBanned ? <UserCheck size={14} /> : <Ban size={14} />}
                            </button>
                          )}

                          {/* Delete Account Button */}
                          <button
                            className="action-btn ban danger-btn"
                            style={{ color: "#ef4444" }}
                            title="Permanently Delete Account from Database"
                            onClick={() => setUserToDelete(u)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ADD PLAYER TO GAME MODAL */}
          {selectedPlayerForRoom && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedPlayerForRoom(null)}>
              <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <Gamepad2 size={20} color="#ffd700" />
                  <span>Deploy Warrior to Battle Chamber</span>
                </h3>
                <p>
                  Adding existing player <strong>{selectedPlayerForRoom.name}</strong> ({selectedPlayerForRoom.email}) to an active multiplayer chamber.
                </p>

                <form onSubmit={handleAddPlayerToRoomSubmit}>
                  <div className="form-group">
                    <label>Select Active Chamber</label>
                    {rooms.length > 0 ? (
                      <select
                        className="dragon-select"
                        value={targetRoomCode}
                        onChange={(e) => setTargetRoomCode(e.target.value)}
                        required
                      >
                        <option value="">-- Select Active Chamber --</option>
                        {rooms.map((rm) => (
                          <option key={rm.code} value={rm.code}>
                            Chamber #{rm.code} — {rm.playerCount} player(s) [{rm.state.toUpperCase()}]
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="dragon-input"
                        placeholder="Enter 4-6 letter chamber code"
                        value={targetRoomCode}
                        onChange={(e) => setTargetRoomCode(e.target.value.toUpperCase())}
                        required
                      />
                    )}
                  </div>

                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Or Enter Custom Chamber Code</label>
                    <input
                      type="text"
                      className="dragon-input"
                      placeholder="e.g. ROYAL1, DRGN99"
                      value={targetRoomCode}
                      onChange={(e) => setTargetRoomCode(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="modal-actions-row" style={{ marginTop: "24px" }}>
                    <button
                      type="button"
                      className="dragon-btn secondary"
                      onClick={() => setSelectedPlayerForRoom(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="dragon-btn primary">
                      <UserPlus size={16} />
                      <span>Add Player to Chamber</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW PLAYER DETAILS MODAL */}
          {viewingPlayerDetails && (
            <div className="admin-modal-backdrop" onClick={() => setViewingPlayerDetails(null)}>
              <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <Info size={20} color="#ffd700" />
                  <span>Warrior Dossier: {viewingPlayerDetails.name}</span>
                </h3>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "18px 0" }}>
                  <Avatar name={viewingPlayerDetails.name} size={64} color={viewingPlayerDetails.avatarColor} />
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "18px", color: "#fff" }}>{viewingPlayerDetails.name}</h4>
                    <p style={{ margin: "0 0 4px", color: "#fbbf24", fontSize: "13px" }}>{viewingPlayerDetails.title || "Dragon Novice"}</p>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{viewingPlayerDetails.email}</span>
                  </div>
                </div>

                <div className="diagnostics-list">
                  <div className="diag-item">
                    <span>Account ID</span>
                    <code>{viewingPlayerDetails.id || viewingPlayerDetails._id}</code>
                  </div>
                  <div className="diag-item">
                    <span>Dragon Gold</span>
                    <strong style={{ color: "#ffd700" }}>{(viewingPlayerDetails.coins || 0).toLocaleString()} coins</strong>
                  </div>
                  <div className="diag-item">
                    <span>Rank & Level</span>
                    <strong>Level {viewingPlayerDetails.level || 1} ({viewingPlayerDetails.xp || 0} XP)</strong>
                  </div>
                  <div className="diag-item">
                    <span>Match Statistics</span>
                    <strong>{viewingPlayerDetails.wins || 0} Wins / {viewingPlayerDetails.matches || 0} Matches</strong>
                  </div>
                  <div className="diag-item">
                    <span>Battle Chamber Status</span>
                    <strong>{viewingPlayerDetails.currentRoom ? `In Chamber #${viewingPlayerDetails.currentRoom}` : "Idle"}</strong>
                  </div>
                  <div className="diag-item">
                    <span>Bio Scroll</span>
                    <span style={{ fontStyle: "italic", color: "#d1d5db" }}>&ldquo;{viewingPlayerDetails.bio || "Fierce dragon warrior."}&rdquo;</span>
                  </div>
                </div>

                <div className="modal-actions-row" style={{ marginTop: "24px" }}>
                  <button
                    type="button"
                    className="dragon-btn primary"
                    style={{ width: "100%" }}
                    onClick={() => setViewingPlayerDetails(null)}
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grant Gold Modal */}
          {selectedUserForGold && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedUserForGold(null)}>
              <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <Coins size={20} color="#ffd700" />
                  <span>Grant Dragon Gold</span>
                </h3>
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

          {/* CONFIRM DELETE ACCOUNT FROM DATABASE MODAL */}
          {userToDelete && (
            <div className="admin-modal-backdrop" onClick={() => setUserToDelete(null)}>
              <div className="admin-modal-card danger" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <AlertTriangle size={20} color="#ef4444" />
                  <span>Permanently Delete Account?</span>
                </h3>
                <p>
                  Are you sure you want to permanently delete account <strong>{userToDelete.name}</strong> (<code>{userToDelete.email}</code>)?
                </p>

                <div className="danger-note-box">
                  <strong>Permanent Action:</strong> This will permanently erase this warrior from the <code>{userToDelete.sourceTable || "users"}</code> table in PostgreSQL along with their stats, profile history, and records. This cannot be undone.
                </div>

                <div className="modal-actions-row" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    className="dragon-btn secondary"
                    onClick={() => setUserToDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="dragon-btn primary danger"
                    style={{ background: "#dc2626", borderColor: "#ef4444" }}
                    onClick={handleDeleteUserConfirm}
                  >
                    <Trash2 size={15} />
                    <span>Delete Account Permanently</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: LIVE BATTLE CHAMBERS ======================= */}
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
                    <span className="chamber-code">CHAMBER #{rm.code}</span>
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

                  {/* Interactive Player List with Remove Buttons */}
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#a3a3a3", textTransform: "uppercase" }}>
                      Warriors in Chamber:
                    </span>
                    <div className="chamber-players-interactive-list">
                      {rm.players?.map((p, idx) => (
                        <div key={idx} className="chamber-player-row">
                          <div className="chamber-player-meta">
                            <Avatar name={p.name || p.username} size={24} />
                            <span>{p.name || p.username}</span>
                            <span className="score-badge">({p.score || 0} pts)</span>
                            {p.isHost && <Crown size={12} color="#ffd700" title="Host" />}
                          </div>

                          <button
                            type="button"
                            className="remove-player-room-btn"
                            title={`Remove ${p.name || p.username} from chamber`}
                            onClick={() =>
                              setPlayerToRemoveFromRoom({
                                roomCode: rm.code,
                                player: p,
                              })
                            }
                          >
                            <UserMinus size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="chamber-card-bottom" style={{ marginTop: "16px" }}>
                    <button
                      className="dragon-btn secondary danger-hover sm"
                      style={{ width: "100%" }}
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

          {/* CONFIRM REMOVE PLAYER FROM ROOM MODAL */}
          {playerToRemoveFromRoom && (
            <div className="admin-modal-backdrop" onClick={() => setPlayerToRemoveFromRoom(null)}>
              <div className="admin-modal-card danger" onClick={(e) => e.stopPropagation()}>
                <h3>
                  <AlertTriangle size={20} color="#ef4444" />
                  <span>Remove Player from Chamber?</span>
                </h3>
                <p>
                  Are you sure you want to remove warrior <strong>{playerToRemoveFromRoom.player.name || playerToRemoveFromRoom.player.username}</strong> from Chamber <strong>#{playerToRemoveFromRoom.roomCode}</strong>?
                </p>

                <div className="danger-note-box">
                  <strong>Important:</strong> This will remove the warrior from the active battle chamber only. Their account in the <code>users</code> database remains active and safe.
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="dragon-btn secondary"
                    onClick={() => setPlayerToRemoveFromRoom(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="dragon-btn primary danger"
                    style={{ background: "#dc2626", borderColor: "#ef4444" }}
                    onClick={handleRemovePlayerFromRoomConfirm}
                  >
                    <UserMinus size={15} />
                    <span>Remove Player</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB: OVERALL TRANSACTIONS ======================= */}
      {activeTab === "transactions" && (
        <div className="admin-transactions-section">
          <TransactionHistory
            title="All Realm Player Transactions"
            showHeader={false}
          />
        </div>
      )}

      {/* ======================= TAB 3: SYSTEM DIAGNOSTICS ======================= */}
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
                <span>Admins Account Table</span>
                <code style={{ fontSize: "12px", color: "#fbbf24" }}>admins (PostgreSQL)</code>
              </div>
              <div className="diag-item">
                <span>Players Account Table</span>
                <code style={{ fontSize: "12px", color: "#fbbf24" }}>users (PostgreSQL)</code>
              </div>
              <div className="diag-item">
                <span>Connection Endpoint</span>
                <code style={{ fontSize: "12px", color: "#fbbf24" }}>{stats.database.uri}</code>
              </div>
              <div className="diag-item">
                <span>Database Connection State</span>
                <span className={`status-tag ${stats.database.isConnected ? "online" : "offline"}`}>
                  {stats.database.isConnected ? "Connected (Neon DB Live)" : "Fallback Mode"}
                </span>
              </div>
            </div>
          </div>
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
