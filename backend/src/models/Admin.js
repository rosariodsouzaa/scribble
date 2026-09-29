import { query, pgStatus } from "../db/postgres.js";

// Formatter to map SQL snake_case to JavaScript camelCase
function formatSqlAdmin(row) {
  if (!row) return null;
  const admin = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: "admin",
    accountType: "admin",
    isVerified: Boolean(row.is_verified),
    avatarColor: row.avatar_color || "#ef4444",
    bio: row.bio || "Imperial Sovereign of the Dragon Dynasty.",
    title: row.title || "Imperial Grandmaster",
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  admin.toPublicJSON = function () {
    const pub = { ...this };
    delete pub.passwordHash;
    return pub;
  };

  return admin;
}

// In-Memory Storage Adapter for resilient fallback
class MemoryAdminStore {
  constructor() {
    this.admins = new Map();
    this.idCounter = 1;
  }

  _format(admin) {
    if (!admin) return null;
    const copy = { ...admin };
    copy.id = String(copy._id || copy.id);
    copy._id = copy.id;
    copy.role = "admin";
    copy.accountType = "admin";
    copy.toPublicJSON = function () {
      const pub = { ...this };
      delete pub.passwordHash;
      return pub;
    };
    return copy;
  }

  async findByEmail(email) {
    const clean = String(email || "").toLowerCase().trim();
    for (const a of this.admins.values()) {
      if (a.email === clean) return this._format(a);
    }
    return null;
  }

  async findById(id) {
    const a = this.admins.get(String(id));
    return a ? this._format(a) : null;
  }

  async create(data) {
    const id = `adm_${Date.now().toString(36)}_${(this.idCounter++).toString(36)}`;
    const now = new Date();
    const newAdmin = {
      _id: id,
      id,
      name: data.name || "Imperial Grandmaster",
      email: String(data.email).toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: "admin",
      accountType: "admin",
      isVerified: Boolean(data.isVerified !== undefined ? data.isVerified : true),
      avatarColor: data.avatarColor || "#ef4444",
      bio: data.bio || "Imperial Sovereign of the Dragon Dynasty.",
      title: data.title || "Imperial Grandmaster",
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    this.admins.set(id, newAdmin);
    return this._format(newAdmin);
  }

  async updateById(id, updates) {
    const existing = this.admins.get(String(id));
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.admins.set(String(id), updated);
    return this._format(updated);
  }

  async find(filter = {}) {
    let list = Array.from(this.admins.values());
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
    }
    return list.map((a) => this._format(a));
  }

  async deleteById(id) {
    const deleted = this.admins.delete(String(id));
    return deleted;
  }

  async count(filter = {}) {
    const matches = await this.find(filter);
    return matches.length;
  }
}

const memoryStore = new MemoryAdminStore();

/**
 * Unified Admin Repository executing on Neon PostgreSQL with in-memory fallback
 */
export const AdminRepository = {
  async findByEmail(email) {
    const clean = String(email || "").toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        const res = await query("SELECT * FROM admins WHERE LOWER(email) = $1 LIMIT 1", [clean]);
        if (res.rows.length > 0) return formatSqlAdmin(res.rows[0]);
        return null;
      } catch (err) {
        console.warn("[AdminRepo] Postgres findByEmail failed, using memory:", err.message);
      }
    }
    return memoryStore.findByEmail(clean);
  },

  async findById(id) {
    if (pgStatus.isConnected) {
      try {
        const res = await query("SELECT * FROM admins WHERE id = $1 LIMIT 1", [String(id)]);
        if (res.rows.length > 0) return formatSqlAdmin(res.rows[0]);
        return null;
      } catch (err) {
        console.warn("[AdminRepo] Postgres findById failed, using memory:", err.message);
      }
    }
    return memoryStore.findById(id);
  },

  async create(data) {
    const id = `adm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const cleanEmail = String(data.email).toLowerCase().trim();

    if (pgStatus.isConnected) {
      try {
        const sql = `
          INSERT INTO admins (
            id, name, email, password_hash, role, is_verified,
            avatar_color, bio, title
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
        const params = [
          id,
          data.name || "Imperial Grandmaster",
          cleanEmail,
          data.passwordHash,
          "admin",
          Boolean(data.isVerified !== undefined ? data.isVerified : true),
          data.avatarColor || "#ef4444",
          data.bio || "Imperial Sovereign of the Dragon Dynasty.",
          data.title || "Imperial Grandmaster",
        ];

        const res = await query(sql, params);
        return formatSqlAdmin(res.rows[0]);
      } catch (err) {
        console.warn("[AdminRepo] Postgres create failed, using memory:", err.message);
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

        const sql = `UPDATE admins SET ${fields.join(", ")} WHERE id = $${index} RETURNING *;`;
        const res = await query(sql, values);
        if (res.rows.length > 0) return formatSqlAdmin(res.rows[0]);
      } catch (err) {
        console.warn("[AdminRepo] Postgres updateById failed, using memory:", err.message);
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

        if (filter.search) {
          conditions.push(`(name ILIKE $${index} OR email ILIKE $${index})`);
          params.push(`%${filter.search}%`);
          index++;
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM admins ${where} ORDER BY created_at DESC;`;

        const res = await query(sql, params);
        return res.rows.map(formatSqlAdmin);
      } catch (err) {
        console.warn("[AdminRepo] Postgres find failed, using memory:", err.message);
      }
    }
    return memoryStore.find(filter);
  },

  async deleteById(id) {
    if (pgStatus.isConnected) {
      try {
        const res = await query("DELETE FROM admins WHERE id = $1 RETURNING *;", [String(id)]);
        return res.rowCount > 0;
      } catch (err) {
        console.warn("[AdminRepo] Postgres deleteById failed, using memory:", err.message);
      }
    }
    return memoryStore.deleteById(id);
  },

  async count(filter = {}) {
    if (pgStatus.isConnected) {
      try {
        const conditions = [];
        const params = [];
        let index = 1;

        if (filter.search) {
          conditions.push(`(name ILIKE $${index} OR email ILIKE $${index})`);
          params.push(`%${filter.search}%`);
          index++;
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT COUNT(*) AS total FROM admins ${where};`;

        const res = await query(sql, params);
        return Number(res.rows[0]?.total || 0);
      } catch (err) {
        console.warn("[AdminRepo] Postgres count failed, using memory:", err.message);
      }
    }
    return memoryStore.count(filter);
  },
};

export default AdminRepository;
