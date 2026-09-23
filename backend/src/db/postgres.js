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
    if (!config.databaseUrl) return "in-memory";
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

  console.log("[PostgreSQL] Connecting to Neon DB...");

  try {
    let connectionString = config.databaseUrl;
    if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat")) {
      connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection with ping
    const client = await pool.connect();
    console.log("[PostgreSQL]  Neon PostgreSQL connection established successfully!");
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

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        email VARCHAR(255),
        user_name VARCHAR(100),
        item_id VARCHAR(100),
        item_name VARCHAR(150) NOT NULL,
        item_category VARCHAR(50) DEFAULT 'general',
        amount VARCHAR(100) NOT NULL,
        gold_amount INTEGER DEFAULT 0,
        payment_method VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'COMPLETED',
        wallet_address VARCHAR(255),
        tx_hash VARCHAR(255),
        network VARCHAR(100),
        initial_balance VARCHAR(100),
        remaining_balance VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_email ON transactions(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
    `);

    client.release();
    console.log("[PostgreSQL]  Database schema verified (users, otps & transactions tables ready).");
    return true;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[PostgreSQL]  Connection failed (${err.message}). Using resilient memory adapter.`);
    return false;
  }
}

/**
 * Execute a parameterized query against PostgreSQL
 */
export async function query(text, params) {
  if (!pool ||!isConnected) {
    throw new Error("PostgreSQL pool not connected");
  }
  return pool.query(text, params);
}

export default { initPostgres, query, pgStatus };
