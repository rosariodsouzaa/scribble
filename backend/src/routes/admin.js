import { Router } from "express";
import { UserRepository } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { roomRepository } from "../repositories/RoomRepository.js";
import { pgStatus } from "../db/postgres.js";
import { WordDictionary } from "../services/words/WordDictionary.js";

const router = Router();

// Protect all admin endpoints
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/stats
 * Telemetry and overview metrics
 */
router.get("/stats", async (_req, res) => {
  try {
    const totalUsers = await UserRepository.count();
    const adminCount = await UserRepository.count({ role: "admin" });
    const bannedCount = await UserRepository.count({ isBanned: true });

    // Aggregate circulating coins
    const allUsers = await UserRepository.find();
    const totalCoins = allUsers.reduce((sum, u) => sum + (Number(u.coins) || 0), 0);

    const activeRooms = roomRepository.size;
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      stats: {
        totalWarriors: totalUsers,
        adminCount,
        bannedCount,
        totalCirculatingGold: totalCoins,
        activeBattleRooms: activeRooms,
        serverUptimeSec: Math.floor(process.uptime()),
        database: {
          provider: pgStatus.provider,
          isConnected: pgStatus.isConnected,
          uri: pgStatus.uri,
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
 * GET /api/admin/users
 * Search & filter warriors directory
 */
router.get("/users", async (req, res) => {
  try {
    const { search = "", role, isBanned } = req.query;

    const filter = {};
    if (search) filter.search = search;
    if (role && role !== "all") filter.role = role;
    if (isBanned !== undefined && isBanned !== "all") {
      filter.isBanned = isBanned === "true";
    }

    const users = await UserRepository.find(filter);
    const sanitized = users.map((u) => (u.toPublicJSON ? u.toPublicJSON() : u));

    res.json({
      success: true,
      users: sanitized,
      count: sanitized.length,
    });
  } catch (err) {
    console.error("[Admin] users error:", err);
    res.status(500).json({ error: "Failed to fetch warriors list." });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Elevates or demotes user role
 */
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Allowed values: 'user', 'admin'." });
    }

    // Prevent self-demotion
    if ((req.user.id || req.user._id) === id && role !== "admin") {
      return res.status(400).json({ error: "Grandmaster cannot strip their own admin privileges." });
    }

    const updated = await UserRepository.updateById(id, { role });
    if (!updated) {
      return res.status(404).json({ error: "Warrior not found." });
    }

    res.json({
      success: true,
      message: `Warrior role updated to '${role}'.`,
      user: updated.toPublicJSON ? updated.toPublicJSON() : updated,
    });
  } catch (err) {
    console.error("[Admin] update role error:", err);
    res.status(500).json({ error: "Failed to update role." });
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
 * GET /api/admin/rooms
 * Inspect active battle rooms
 */
router.get("/rooms", (_req, res) => {
  try {
    const rooms = [];
    for (const [code, room] of roomRepository.rooms.entries()) {
      rooms.push({
        code,
        state: room.state,
        playerCount: room.players.size,
        currentRound: room.currentRound,
        maxRounds: room.maxRounds,
        currentDrawer: room.currentDrawer ? room.currentDrawer.name : null,
        currentWordLength: room.currentWord ? room.currentWord.length : 0,
        players: Array.from(room.players.values()).map((p) => ({
          name: p.name,
          score: p.score,
          isHost: p.isHost,
          connected: p.connected,
        })),
        createdAt: room.createdAt,
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

    roomRepository.deleteRoom(code);
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

export default router;
