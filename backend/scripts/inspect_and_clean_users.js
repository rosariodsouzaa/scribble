import pg from "pg";
import { config } from "../src/config.js";

const { Pool } = pg;

async function run() {
  let connectionString = config.databaseUrl;
  if (!connectionString) {
    console.log("No DATABASE_URL found.");
    process.exit(0);
  }

  if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat")) {
    connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL.");

    const res = await client.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC;");
    console.log(`Found ${res.rows.length} users in users table:`);
    console.table(res.rows);

    const adminRes = await client.query("SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC;");
    console.log(`Found ${adminRes.rows.length} admins in admins table:`);
    console.table(adminRes.rows);

    client.release();
  } catch (err) {
    console.error("Error inspecting database:", err.message);
  } finally {
    await pool.end();
  }
}

run();
