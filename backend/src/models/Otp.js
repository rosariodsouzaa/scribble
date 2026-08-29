import { query, pgStatus } from "../db/postgres.js";

// In-memory OTP storage fallback
class MemoryOtpStore {
  constructor() {
    this.otps = new Map();
  }

  _getKey(email, purpose) {
    return `${String(email).toLowerCase().trim()}::${purpose}`;
  }

  async save(email, otp, purpose = "signup", ttlMinutes = 10) {
    const key = this._getKey(email, purpose);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    this.otps.set(key, {
      email: String(email).toLowerCase().trim(),
      otp: String(otp),
      purpose,
      expiresAt,
      attempts: 0,
    });
  }

  async find(email, purpose = "signup") {
    const key = this._getKey(email, purpose);
    const record = this.otps.get(key);
    if (!record) return null;
    if (new Date() > record.expiresAt) {
      this.otps.delete(key);
      return null;
    }
    return record;
  }

  async incrementAttempts(email, purpose = "signup") {
    const key = this._getKey(email, purpose);
    const record = this.otps.get(key);
    if (record) {
      record.attempts += 1;
    }
  }

  async remove(email, purpose = "signup") {
    const key = this._getKey(email, purpose);
    this.otps.delete(key);
  }
}

const memoryOtpStore = new MemoryOtpStore();

export const OtpRepository = {
  async save(email, otp, purpose = "signup", ttlMinutes = 10) {
    const cleanEmail = String(email).toLowerCase().trim();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    if (pgStatus.isConnected) {
      try {
        await query("DELETE FROM otps WHERE LOWER(email) = $1 AND purpose = $2", [cleanEmail, purpose]);
        await query(
          "INSERT INTO otps (email, otp, purpose, expires_at, attempts) VALUES ($1, $2, $3, $4, 0)",
          [cleanEmail, String(otp), purpose, expiresAt]
        );
        return;
      } catch (err) {
        console.warn("[OtpRepo] Postgres save failed, using memory:", err.message);
      }
    }

    await memoryOtpStore.save(cleanEmail, otp, purpose, ttlMinutes);
  },

  async find(email, purpose = "signup") {
    const cleanEmail = String(email).toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        const res = await query(
          "SELECT * FROM otps WHERE LOWER(email) = $1 AND purpose = $2 AND expires_at > NOW() LIMIT 1",
          [cleanEmail, purpose]
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            email: row.email,
            otp: row.otp,
            purpose: row.purpose,
            expiresAt: row.expires_at,
            attempts: Number(row.attempts || 0),
          };
        }
        return null;
      } catch (err) {
        console.warn("[OtpRepo] Postgres find failed, using memory:", err.message);
      }
    }
    return memoryOtpStore.find(cleanEmail, purpose);
  },

  async incrementAttempts(email, purpose = "signup") {
    const cleanEmail = String(email).toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        await query("UPDATE otps SET attempts = attempts + 1 WHERE LOWER(email) = $1 AND purpose = $2", [
          cleanEmail,
          purpose,
        ]);
        return;
      } catch (err) {
        console.warn("[OtpRepo] Postgres inc attempts failed:", err.message);
      }
    }
    await memoryOtpStore.incrementAttempts(cleanEmail, purpose);
  },

  async remove(email, purpose = "signup") {
    const cleanEmail = String(email).toLowerCase().trim();
    if (pgStatus.isConnected) {
      try {
        await query("DELETE FROM otps WHERE LOWER(email) = $1 AND purpose = $2", [cleanEmail, purpose]);
        return;
      } catch (err) {
        console.warn("[OtpRepo] Postgres delete failed:", err.message);
      }
    }
    await memoryOtpStore.remove(cleanEmail, purpose);
  },
};

export default OtpRepository;
