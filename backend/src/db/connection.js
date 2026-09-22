import { initPostgres, query as pgQuery, pgStatus } from "./postgres.js";

/**
 * Unified Database Connection & Status Provider
 * Directs all database operations to Neon PostgreSQL with resilient in-memory fallback.
 */
export const dbStatus = {
  get isConnected() {
    return pgStatus.isConnected;
  },
  get mode() {
    return pgStatus.isConnected ? "postgresql" : "memory";
  },
  get error() {
    return pgStatus.error;
  },
  get provider() {
    return pgStatus.provider;
  },
  get uri() {
    return pgStatus.uri;
  },
};

/**
 * Initializes the primary Neon PostgreSQL connection pool
 */
export async function initDb() {
  return initPostgres();
}

/**
 * Execute parameterized query against the database
 */
export async function query(text, params) {
  return pgQuery(text, params);
}

export default { initDb, query, dbStatus };
