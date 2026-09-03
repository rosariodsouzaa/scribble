import { query, pgStatus } from "../db/postgres.js";

// Formatter to map SQL snake_case to JavaScript camelCase
function formatSqlUser(row) {
  if (!row) return null;
  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role || "user",
    isVerified: Boolean(row.is_verified),
    coins: Number(row.coins ?? 2500),
    level: Number(row.level ?? 1),
    xp: Number(row.xp ?? 0),
    wins: Number(row.wins ?? 0),
    matches: Number(row.matches ?? 0),
    avatarColor: row.avatar_color || "#f59e0b",
    bio: row.bio || "Fierce dragon warrior of the realm.",
    title: row.title || "Dragon Novice",
    isBanned: Boolean(row.is_banned),
    banReason: row.ban_reason || "",
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  user.toPublicJSON = function () {
    const pub = { ...this };
    delete pub.passwordHash;
    return pub;
  };

  return user;
}

// In-Memory Storage Adapter for resilient fallback
class MemoryUserStore {
  constructor() {
    this.users = new Map();
    this.idCounter = 1;
  }

  _format(user) {
    if (!user) return null;
    const copy = { ...user };
    copy.id = String(copy._id || copy.id);
    copy._id = copy.id;
    copy.toPublicJSON = function () {
      const pub = { ...this };
      delete pub.passwordHash;
      return pub;
    };
    return copy;
  }

  async findByEmail(email) {
    const clean = String(email || "").toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email === clean) return this._format(u);
    }
    return null;
  }

  async findById(id) {
    const u = this.users.get(String(id));
    return u ? this._format(u) : null;
  }

  async create(data) {
    const id = `usr_${Date.now().toString(36)}_${(this.idCounter++).toString(36)}`;
    const now = new Date();
    const newUser = {
      _id: id,
      id,
      name: data.name || "Warrior",
      email: String(data.email).toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role || "user",
      isVerified: Boolean(data.isVerified),
      coins: Number(data.coins ?? 2500),
      level: Number(data.level ?? 1),
      xp: Number(data.xp ?? 0),
      wins: Number(data.wins ?? 0),
      matches: Number(data.matches ?? 0),
      avatarColor: data.avatarColor || "#f59e0b",
      bio: data.bio || "Fierce dragon warrior of the realm.",
      title: data.title || "Dragon Novice",
      isBanned: Boolean(data.isBanned),
      banReason: data.banReason || "",
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    return this._format(newUser);
  }

  async updateById(id, updates) {
    const existing = this.users.get(String(id));
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(String(id), updated);
    return this._format(updated);
  }

  async find(filter = {}) {
    let list = Array.from(this.users.values());
    if (filter.role) {
      list = list.filter((u) => u.role === filter.role);
    }
    if (filter.isBanned !== undefined) {
      list = list.filter((u) => Boolean(u.isBanned) === Boolean(filter.isBanned));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list.map((u) => this._format(u));
  }

  async count(filter = {}) {
    const matches = await this.find(filter);
    return matches.length;
  }
}

const memoryStore = new MemoryUserStore();

/**
 * Unified User Repository executing on Neon PostgreSQL with in-memory fallback
 */
export const UserRepository = {
  async findByEmail(email) {
    const clean = String(email || "").toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        const res = await query("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [clean]);
        if (res.rows.length > 0) return formatSqlUser(res.rows[0]);
        return null;
      } catch (err) {
        console.warn("[UserRepo] Postgres findByEmail failed, using memory:", err.message);
      }
    }
    return memoryStore.findByEmail(clean);
  },

  async findById(id) {
    if (pgStatus.isConnected) {
      try {
        const res = await query("SELECT * FROM users WHERE id = $1 LIMIT 1", [String(id)]);
        if (res.rows.length > 0) return formatSqlUser(res.rows[0]);
        return null;
      } catch (err) {
        console.warn("[UserRepo] Postgres findById failed, using memory:", err.message);
      }
    }
    return memoryStore.findById(id);
  },

  async create(data) {
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const cleanEmail = String(data.email).toLowerCase().trim();

    if (pgStatus.isConnected) {
      try {
        const sql = `
          INSERT INTO users (
            id, name, email, password_hash, role, is_verified, coins, level, xp, wins, matches,
            avatar_color, bio, title, is_banned, ban_reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *;
        `;
        const params = [
          id,
          data.name || "Warrior",
          cleanEmail,
          data.passwordHash,
          data.role || "user",
          Boolean(data.isVerified),
          Number(data.coins ?? 2500),
          Number(data.level ?? 1),
          Number(data.xp ?? 0),
          Number(data.wins ?? 0),
          Number(data.matches ?? 0),
          data.avatarColor || "#f59e0b",
          data.bio || "Fierce dragon warrior of the realm.",
          data.title || "Dragon Novice",
          Boolean(data.isBanned),
          data.banReason || "",
        ];

        const res = await query(sql, params);
        return formatSqlUser(res.rows[0]);
      } catch (err) {
        console.warn("[UserRepo] Postgres create failed, using memory:", err.message);
      }
    }
    return memoryStore.create(data);
  },

  async updateById(id, updates) {
    if (pgStatus.isConnected) {
      try {
        const fields = [];
        const values = [];
        let index = 1;

        if (updates.name !== undefined) {
          fields.push(`name = $${index++}`);
          values.push(updates.name);
        }
        if (updates.bio !== undefined) {
          fields.push(`bio = $${index++}`);
          values.push(updates.bio);
        }
        if (updates.title !== undefined) {
          fields.push(`title = $${index++}`);
          values.push(updates.title);
        }
        if (updates.avatarColor !== undefined) {
          fields.push(`avatar_color = $${index++}`);
          values.push(updates.avatarColor);
        }
        if (updates.coins !== undefined) {
          fields.push(`coins = $${index++}`);
          values.push(Number(updates.coins));
        }
        if (updates.level !== undefined) {
          fields.push(`level = $${index++}`);
          values.push(Number(updates.level));
        }
        if (updates.wins !== undefined) {
          fields.push(`wins = $${index++}`);
          values.push(Number(updates.wins));
        }
        if (updates.matches !== undefined) {
          fields.push(`matches = $${index++}`);
          values.push(Number(updates.matches));
        }
        if (updates.role !== undefined) {
          fields.push(`role = $${index++}`);
          values.push(updates.role);
        }
        if (updates.isBanned !== undefined) {
          fields.push(`is_banned = $${index++}`);
          values.push(Boolean(updates.isBanned));
        }
        if (updates.banReason !== undefined) {
          fields.push(`ban_reason = $${index++}`);
          values.push(updates.banReason);
        }
        if (updates.passwordHash !== undefined || updates.password_hash !== undefined) {
          fields.push(`password_hash = $${index++}`);
          values.push(updates.passwordHash || updates.password_hash);
        }
        if (updates.lastLoginAt !== undefined) {
          fields.push(`last_login_at = $${index++}`);
          values.push(new Date(updates.lastLoginAt));
        }

        fields.push(`updated_at = NOW()`);
        values.push(String(id));

        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *;`;
        const res = await query(sql, values);
        if (res.rows.length > 0) return formatSqlUser(res.rows[0]);
      } catch (err) {
        console.warn("[UserRepo] Postgres updateById failed, using memory:", err.message);
      }
    }
    return memoryStore.updateById(id, updates);
  },

  async find(filter = {}) {
    if (pgStatus.isConnected) {
      try {
        const conditions = [];
        const params = [];
        let index = 1;

        if (filter.role && filter.role !== "all") {
          conditions.push(`role = $${index++}`);
          params.push(filter.role);
        }
        if (filter.isBanned !== undefined && filter.isBanned !== "all") {
          conditions.push(`is_banned = $${index++}`);
          params.push(Boolean(filter.isBanned));
        }
        if (filter.search) {
          conditions.push(`(name ILIKE $${index} OR email ILIKE $${index})`);
          params.push(`%${filter.search}%`);
          index++;
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM users ${where} ORDER BY created_at DESC;`;

        const res = await query(sql, params);
        return res.rows.map(formatSqlUser);
      } catch (err) {
        console.warn("[UserRepo] Postgres find failed, using memory:", err.message);
      }
    }
    return memoryStore.find(filter);
  },

  async count(filter = {}) {
    if (pgStatus.isConnected) {
      try {
        const conditions = [];
        const params = [];
        let index = 1;

        if (filter.role && filter.role !== "all") {
          conditions.push(`role = $${index++}`);
          params.push(filter.role);
        }
        if (filter.isBanned !== undefined && filter.isBanned !== "all") {
          conditions.push(`is_banned = $${index++}`);
          params.push(Boolean(filter.isBanned));
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT COUNT(*) AS total FROM users ${where};`;

        const res = await query(sql, params);
        return Number(res.rows[0]?.total || 0);
      } catch (err) {
        console.warn("[UserRepo] Postgres count failed, using memory:", err.message);
      }
    }
    return memoryStore.count(filter);
  },
};

export default UserRepository;
