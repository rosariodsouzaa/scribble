import { Router } from "express";
import { UserRepository } from "../models/User.js";
import { AdminRepository } from "../models/Admin.js";
import { TransactionRepository } from "../models/Transaction.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { roomRepository } from "../repositories/RoomRepository.js";
import { pgStatus } from "../db/postgres.js";
import { WordDictionary } from "../services/words/WordDictionary.js";
import { Player } from "../models/Player.js";

const router = Router();

// Protect all admin endpoints with authentication & admin authority
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/stats
 * Telemetry and overview metrics
 */
router.get("/stats", async (_req, res) => {
  try {
    const totalUsers = await UserRepository.count();
    const adminCount = await AdminRepository.count();
    const bannedCount = await UserRepository.count({ isBanned: true });
    const totalTransactions = await TransactionRepository.count();

    // Aggregate circulating coins among players
    const allUsers = await UserRepository.find();
    const totalCoins = allUsers.reduce((sum, u) => sum + (Number(u.coins) || 0), 0);

    const activeRooms = roomRepository.size;
    let totalPlayersInRooms = 0;
    for (const r of roomRepository.rooms.values()) {
      totalPlayersInRooms += r.players.size;
    }

    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      stats: {
        totalWarriors: totalUsers,
        totalPlayers: totalUsers,
        adminCount,
        bannedCount,
        totalCirculatingGold: totalCoins,
        totalTransactions,
        activeBattleRooms: activeRooms,
        playersCurrentlyPlaying: totalPlayersInRooms,
        serverUptimeSec: Math.floor(process.uptime()),
        database: {
          provider: pgStatus.provider,
          isConnected: pgStatus.isConnected,
          error: pgStatus.error,
        },
        memory: {
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      },
    });
  } catch (err) {
    console.error("[Admin] stats error:", err);
    res.status(500).json({ error: "Failed to fetch admin telemetry." });
  }
});

/**
 * GET /api/admin/players & /api/admin/users
 * Search & filter registered warriors directory with active chamber status
 */
router.get(["/players", "/users"], async (req, res) => {
  try {
    const { search = "", role = "all", isBanned } = req.query;

    const filter = {};
    if (search) filter.search = search;
    if (role && role !== "all") filter.role = role;
    if (isBanned !== undefined && isBanned !== "all") {
      filter.isBanned = isBanned === "true";
    }

    let combined = [];

    // Fetch players from users table
    if (role === "all" || role === "user") {
      const userFilter = { ...filter };
      delete userFilter.role;
      const users = await UserRepository.find(userFilter);
      users.forEach((u) => {
        const pub = u.toPublicJSON ? u.toPublicJSON() : { ...u };
        delete pub.passwordHash;
        delete pub.password_hash;
        combined.push({
          ...pub,
          role: "user",
          sourceTable: "users",
        });
      });
    }

    // Fetch admins from admins table
    if (role === "all" || role === "admin") {
      const adminFilter = {};
      if (search) adminFilter.search = search;
      const admins = await AdminRepository.find(adminFilter);
      admins.forEach((a) => {
        const pub = a.toPublicJSON ? a.toPublicJSON() : { ...a };
        delete pub.passwordHash;
        delete pub.password_hash;
        combined.push({
          ...pub,
          role: "admin",
          coins: pub.coins || 999999,
          level: pub.level || 99,
          wins: pub.wins || 99,
          sourceTable: "admins",
        });
      });
    }

    // Map active rooms to detect players in active chambers
    const activeRoomsMap = new Map();
    for (const [code, r] of roomRepository.rooms.entries()) {
      for (const p of r.players.values()) {
        if (p.username) {
          activeRoomsMap.set(p.username.toLowerCase(), code);
        }
        if (p.clientId) {
          activeRoomsMap.set(p.clientId, code);
        }
      }
    }

    const currentCallerId = String(req.user?.id || req.user?._id || "");
    const currentCallerEmail = String(req.user?.email || "").toLowerCase().trim();

    const sanitized = combined.map((u) => {
      const uId = String(u.id || u._id || "");
      const uName = String(u.name || "").toLowerCase().trim();
      const uEmail = String(u.email || "").toLowerCase().trim();

      const currentRoom = activeRoomsMap.get(uId) || activeRoomsMap.get(uName) || null;
      const isCurrentAdminSession = (currentCallerId && currentCallerId === uId) || (currentCallerEmail && currentCallerEmail === uEmail);
      const isOnline = Boolean(currentRoom || isCurrentAdminSession);

      let status = "Offline";
      if (u.isBanned) {
        status = "Banished";
      } else if (currentRoom) {
        status = "In Battle";
      } else if (isOnline) {
        status = "Online";
      } else {
        status = "Offline";
      }

      return {
        ...u,
        currentRoom,
        isOnline,
        status,
      };
    });

    res.json({
      success: true,
      players: sanitized,
      users: sanitized,
      count: sanitized.length,
    });
  } catch (err) {
    console.error("[Admin] players error:", err);
    res.status(500).json({ error: "Failed to fetch warriors list." });
  }
});

/**
 * GET /api/admin/players/:id
 * Retrieve specific player details
 */
router.get("/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Warrior not found in dynasty archives." });
    }

    const pub = user.toPublicJSON ? user.toPublicJSON() : { ...user };
    delete pub.passwordHash;
    delete pub.password_hash;

    // Check active chamber
    let currentRoom = null;
    for (const [code, r] of roomRepository.rooms.entries()) {
      for (const p of r.players.values()) {
        if (p.clientId === user.id || p.username.toLowerCase() === user.name.toLowerCase()) {
          currentRoom = code;
          break;
        }
      }
      if (currentRoom) break;
    }

    res.json({
      success: true,
      player: {
        ...pub,
        currentRoom,
        status: currentRoom ? "In Battle" : (user.isBanned ? "Banished" : "Online"),
      },
    });
  } catch (err) {
    console.error("[Admin] get player by id error:", err);
    res.status(500).json({ error: "Failed to fetch player details." });
  }
});

/**
 * GET /api/admin/rooms
 * Inspect active multiplayer battle chambers
 */
router.get("/rooms", (_req, res) => {
  try {
    const rooms = [];
    for (const [code, room] of roomRepository.rooms.entries()) {
      rooms.push({
        code,
        roomId: code,
        state: room.state,
        playerCount: room.players.size,
        currentRound: room.currentRound,
        maxRounds: room.maxRounds,
        currentDrawer: room.currentDrawer ? room.currentDrawer.name : null,
        currentWordLength: room.currentWord ? room.currentWord.length : 0,
        players: Array.from(room.players.values()).map((p) => ({
          id: p.id,
          socketId: p.id,
          clientId: p.clientId,
          name: p.username || p.name,
          username: p.username || p.name,
          score: p.score,
          isHost: p.isHost,
          isReady: p.isReady,
          connected: p.connected,
        })),
        createdAt: room.createdAt || new Date(),
      });
    }

    res.json({
      success: true,
      rooms,
      count: rooms.length,
    });
  } catch (err) {
    console.error("[Admin] get rooms error:", err);
    res.status(500).json({ error: "Failed to fetch live rooms." });
  }
});

/**
 * POST /api/admin/rooms/:roomId/players
 * Adds an existing player from users table to an active game room
 */
router.post("/rooms/:roomId/players", async (req, res) => {
  try {
    const roomId = String(req.params.roomId || "").toUpperCase().trim();
    const { userId, playerName, name } = req.body;

    const room = roomRepository.get(roomId);
    if (!room) {
      return res.status(404).json({ error: `Battle chamber ${roomId} was not found.` });
    }

    // Lookup existing user from users table
    let user = null;
    if (userId) {
      user = await UserRepository.findById(userId);
    }
    if (!user && (playerName || name)) {
      const searchName = playerName || name;
      const allUsers = await UserRepository.find({ search: searchName });
      user = allUsers.find((u) => u.name.toLowerCase() === searchName.toLowerCase()) || allUsers[0];
    }

    if (!user) {
      return res.status(404).json({ error: "Warrior account not found in dynasty archives." });
    }

    // Prevent duplicate player joining the same room
    for (const p of room.players.values()) {
      if (
        (user.id && (p.clientId === user.id || p.id === user.id)) ||
        p.username.toLowerCase() === user.name.toLowerCase()
      ) {
        return res.status(400).json({ error: `Player "${user.name}" is already in this chamber.` });
      }
    }

    // Add player to room state
    const virtualSocketId = `adm_usr_${user.id || Date.now().toString(36)}`;
    const isHost = room.players.size === 0;
    const newPlayer = new Player(virtualSocketId, user.name, user.id, isHost);
    newPlayer.setReady(true);
    room.players.set(virtualSocketId, newPlayer);

    if (isHost) {
      room.hostId = virtualSocketId;
    }
    room.emptySince = null;

    // Broadcast room update via Socket.IO
    room.broadcast("player-joined", {
      player: newPlayer.serialize(),
      players: room.serializePlayers(),
      hostId: room.hostId,
    });

    room.broadcast("player-updated", {
      playerId: virtualSocketId,
      isReady: true,
      players: room.serializePlayers(),
    });

    console.log(`[Admin] Added warrior "${user.name}" to room ${room.code}`);

    res.json({
      success: true,
      message: `Warrior ${user.name} deployed to Chamber ${room.code}.`,
      player: newPlayer.serialize(),
      room: {
        code: room.code,
        playerCount: room.players.size,
      },
    });
  } catch (err) {
    console.error("[Admin] add player to room error:", err);
    res.status(500).json({ error: "Failed to add player to chamber." });
  }
});

/**
 * DELETE /api/admin/rooms/:roomId/players/:playerId
 * Removes a player from an active game room without deleting the player account
 */
router.delete("/rooms/:roomId/players/:playerId", (req, res) => {
  try {
    const roomId = String(req.params.roomId || "").toUpperCase().trim();
    const playerId = String(req.params.playerId || "").trim();

    const room = roomRepository.get(roomId);
    if (!room) {
      return res.status(404).json({ error: `Battle chamber ${roomId} was not found.` });
    }

    // Locate the player's socketId in the room
    let targetSocketId = null;
    let targetPlayer = null;

    for (const [sId, p] of room.players.entries()) {
      if (
        sId === playerId ||
        p.clientId === playerId ||
        p.username.toLowerCase() === playerId.toLowerCase() ||
        p.id === playerId
      ) {
        targetSocketId = sId;
        targetPlayer = p;
        break;
      }
    }

    if (!targetSocketId || !targetPlayer) {
      return res.status(404).json({ error: "Player not found in this battle chamber." });
    }

    const removedName = targetPlayer.username || "Warrior";

    // Remove from room state ONLY (users table is completely untouched)
    room.removePlayer(targetSocketId, "admin_removed");

    console.log(`[Admin] Removed warrior "${removedName}" from room ${room.code}. Account preserved.`);

    res.json({
      success: true,
      message: `Warrior ${removedName} removed from Chamber ${room.code}. Account remains active.`,
      roomId: room.code,
      removedPlayer: removedName,
    });
  } catch (err) {
    console.error("[Admin] remove player from room error:", err);
    res.status(500).json({ error: "Failed to remove player from chamber." });
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban warrior
 */
router.patch("/users/:id/ban", async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned, banReason = "Banished by Imperial Grandmaster." } = req.body;

    if ((req.user.id || req.user._id) === id && isBanned) {
      return res.status(400).json({ error: "Grandmaster cannot ban oneself." });
    }

    const updated = await UserRepository.updateById(id, {
      isBanned: Boolean(isBanned),
      banReason: isBanned ? banReason : "",
    });

    if (!updated) {
      return res.status(404).json({ error: "Warrior not found." });
    }

    res.json({
      success: true,
      message: isBanned ? "Warrior banished from dynasty." : "Warrior banishment lifted.",
      user: updated.toPublicJSON ? updated.toPublicJSON() : updated,
    });
  } catch (err) {
    console.error("[Admin] ban error:", err);
    res.status(500).json({ error: "Failed to update ban status." });
  }
});

/**
 * POST /api/admin/users/:id/grant-gold
 * Grants dragon gold or modifies stats
 */
router.post("/users/:id/grant-gold", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount = 1000 } = req.body;

    const user = await UserRepository.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Warrior not found." });
    }

    const newCoins = Math.max(0, (Number(user.coins) || 0) + Number(amount));
    const updated = await UserRepository.updateById(id, { coins: newCoins });

    res.json({
      success: true,
      message: `Granted ${amount} Gold to ${user.name}.`,
      user: updated.toPublicJSON ? updated.toPublicJSON() : updated,
    });
  } catch (err) {
    console.error("[Admin] grant gold error:", err);
    res.status(500).json({ error: "Failed to grant gold." });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Permanently deletes a player account from users table or admin account from admins table
 */
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if ((req.user?.id || req.user?._id) === id) {
      return res.status(400).json({ error: "Cannot delete your own active imperial admin session." });
    }

    // Try deleting from users table first
    let deleted = await UserRepository.deleteById(id);
    let table = "users";

    // If not found in users, try admins table
    if (!deleted) {
      deleted = await AdminRepository.deleteById(id);
      table = "admins";
    }

    if (!deleted) {
      return res.status(404).json({ error: "Account was not found in dynasty archives." });
    }

    res.json({
      success: true,
      message: `Account successfully purged from ${table} table.`,
      id,
    });
  } catch (err) {
    console.error("[Admin] delete user error:", err);
    res.status(500).json({ error: "Failed to delete account." });
  }
});

/**
 * POST /api/admin/purge-dummy-accounts
 * Purges all mock/dummy test accounts from users and admins tables
 */
router.post("/purge-dummy-accounts", async (_req, res) => {
  try {
    let deletedUserCount = 0;
    let deletedAdminCount = 0;

    if (pgStatus.isConnected) {
      const deleteUsersQuery = `
        DELETE FROM users
        WHERE email LIKE '%@example.com'
           OR email LIKE 'player_17906%'
           OR email LIKE 'warrior_17906%'
           OR email LIKE 'longpass_%'
           OR email LIKE 'emojipass_%'
           OR email LIKE 'xss_%'
           OR email LIKE 'sqli_%'
           OR email LIKE 'num_%'
           OR email LIKE 'warrior_%@gmail.com'
           OR email LIKE 'dash_tester_%'
           OR email LIKE 'session_user_%'
           OR name IN ('alert(''XSS'')', '<script>alert(''XSS'')</script>', ''' OR ''1''=''1', 'LobbyTester', 'CategoryHero', 'ArenaMaster', 'DashboardMaster', 'SessionTester', 'LoginWarrior', 'LongPassWarrior', 'EmojiWarrior')
        RETURNING id;
      `;
      const resUsers = await query(deleteUsersQuery);
      deletedUserCount = resUsers.rowCount || 0;

      const deleteAdminsQuery = `
        DELETE FROM admins
        WHERE email LIKE 'admin_17906%'
           OR email LIKE '%@example.com'
        RETURNING id;
      `;
      const resAdmins = await query(deleteAdminsQuery);
      deletedAdminCount = resAdmins.rowCount || 0;
    }

    res.json({
      success: true,
      message: `Purged ${deletedUserCount} test accounts from 'users' table and ${deletedAdminCount} from 'admins' table.`,
      deletedUserCount,
      deletedAdminCount,
    });
  } catch (err) {
    console.error("[Admin] purge-dummy-accounts error:", err);
    res.status(500).json({ error: "Failed to purge dummy accounts." });
  }
});

/**
 * DELETE /api/admin/rooms/:code
 * Force-terminates a game room
 */
router.delete("/rooms/:code", (req, res) => {
  try {
    const code = String(req.params.code || "").toUpperCase();
    const room = roomRepository.get(code);

    if (!room) {
      return res.status(404).json({ error: "Battle chamber not found." });
    }

    roomRepository.delete(code);
    res.json({ success: true, message: `Chamber ${code} terminated.` });
  } catch (err) {
    console.error("[Admin] terminate room error:", err);
    res.status(500).json({ error: "Failed to terminate room." });
  }
});

/**
 * GET /api/admin/wordpacks
 * Lists word packs available in registry
 */
router.get("/wordpacks", (_req, res) => {
  try {
    const packs = Object.entries(WordDictionary.THEME_PACKS || {}).map(([category, words]) => ({
      category,
      count: words.length,
      sampleWords: words.slice(0, 10),
    }));
    res.json({ success: true, packs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch word packs." });
  }
});

/**
 * POST /api/admin/wordpacks
 * Adds custom words to registry
 */
router.post("/wordpacks", (req, res) => {
  try {
    const { category, words } = req.body;
    if (!category || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: "Category name and word list required." });
    }

    const cleanCategory = String(category).toLowerCase().trim();
    const cleanWords = words.map((w) => String(w).toLowerCase().trim()).filter(Boolean);

    if (!WordDictionary.THEME_PACKS[cleanCategory]) {
      WordDictionary.THEME_PACKS[cleanCategory] = [];
    }

    WordDictionary.THEME_PACKS[cleanCategory] = Array.from(
      new Set([...WordDictionary.THEME_PACKS[cleanCategory], ...cleanWords])
    );

    res.json({
      success: true,
      message: `Registered ${cleanWords.length} words to category '${cleanCategory}'.`,
      totalCount: WordDictionary.THEME_PACKS[cleanCategory].length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to register word pack." });
  }
});

/**
 * GET /api/admin/transactions
 * Lists all system-wide transactions for auditing
 */
router.get("/transactions", async (req, res) => {
  try {
    const { search = "", category = "all" } = req.query;
    const filter = {};
    if (search) filter.search = search;
    if (category && category !== "all") filter.category = category;

    const transactions = await TransactionRepository.find(filter);
    const count = transactions.length;

    res.json({
      success: true,
      transactions,
      count,
    });
  } catch (err) {
    console.error("[Admin] transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

export default router;
