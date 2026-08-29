import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

let pool = null;
let isConnected = false;
let lastError = null;

export const pgStatus = {
  get isConnected() {
    return isConnected;
  },
  get error() {
    return lastError;
  },
  get provider() {
    return "Neon PostgreSQL (AWS us-east-2)";
  },
  get uri() {
    return config.databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
  },
};

/**
 * Initializes Neon PostgreSQL connection pool and ensures database schema tables exist
 */
export async function initPostgres() {
  if (!config.databaseUrl) {
    console.warn("[PostgreSQL] No DATABASE_URL provided. Running in memory fallback.");
    return false;
  }

  console.log(`[PostgreSQL] Connecting to Neon DB at ${pgStatus.uri}...`);

  try {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection with ping
    const client = await pool.connect();
    console.log("[PostgreSQL] 🐉 Neon PostgreSQL connection established successfully!");
    isConnected = true;
    lastError = null;

    // Run Auto-Schema Migration
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT false,
        coins INTEGER DEFAULT 2500,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        matches INTEGER DEFAULT 0,
        avatar_color VARCHAR(30) DEFAULT '#f59e0b',
        bio VARCHAR(255) DEFAULT 'Fierce dragon warrior of the realm.',
        title VARCHAR(60) DEFAULT 'Dragon Novice',
        is_banned BOOLEAN DEFAULT false,
        ban_reason VARCHAR(255) DEFAULT '',
        last_login_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        purpose VARCHAR(50) DEFAULT 'signup',
        expires_at TIMESTAMP NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_otps_email_purpose ON otps(email, purpose);
    `);

    client.release();
    console.log("[PostgreSQL] 📜 Database schema verified (users & otps tables ready).");
    return true;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[PostgreSQL] ⚠️ Connection failed (${err.message}). Using resilient memory adapter.`);
    return false;
  }
}

/**
 * Execute a parameterized query against PostgreSQL
 */
export async function query(text, params) {
  if (!pool || !isConnected) {
    throw new Error("PostgreSQL pool not connected");
  }
  return pool.query(text, params);
}

export default { initPostgres, query, pgStatus };
