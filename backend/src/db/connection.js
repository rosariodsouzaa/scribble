import mongoose from "mongoose";
import { config } from "../config.js";

let isConnected = false;
let connectionMode = "memory"; // "mongodb" or "memory"
let lastError = null;

export const dbStatus = {
  get isConnected() {
    return isConnected;
  },
  get mode() {
    return connectionMode;
  },
  get error() {
    return lastError;
  },
  get uri() {
    // Mask password if present in URI
    return config.mongoUri.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
  },
};

/**
 * Initializes MongoDB connection or activates graceful in-memory storage fallback
 */
export async function initDb() {
  console.log(`[Database] Connecting to MongoDB at ${dbStatus.uri}...`);

  try {
    mongoose.set("strictQuery", false);

    // Set a fast server selection timeout so dev startup isn't delayed if MongoDB is not running locally
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isConnected = true;
    connectionMode = "mongodb";
    lastError = null;
    console.log("[Database] 🐉 MongoDB connection established successfully!");
  } catch (err) {
    isConnected = false;
    connectionMode = "memory";
    lastError = err.message;
    console.warn(`[Database] ⚠️  MongoDB not available (${err.message}). Activating In-Memory Dragon Vault adapter.`);
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    connectionMode = "memory";
    console.warn("[Database] MongoDB disconnected. Falling back to in-memory store.");
  });

  mongoose.connection.on("reconnected", () => {
    isConnected = true;
    connectionMode = "mongodb";
    lastError = null;
    console.log("[Database] MongoDB reconnected!");
  });
}

export default { initDb, dbStatus };
