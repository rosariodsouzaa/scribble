import pg from "pg";
import { config } from "../src/config.js";

const { Client } = pg;

async function purgeWithRetry() {
  let connectionString = config.databaseUrl;
  if (!connectionString) {
    console.error("No DATABASE_URL configured.");
    process.exit(1);
  }

  if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat")) {
    connectionString = connectionString.replace("sslmode=require", "sslmode=verify-full");
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`[Purge] Attempt ${attempt} to connect to Neon PostgreSQL...`);
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });

    try {
      await client.connect();
      console.log("[Purge]  Connected to Neon database successfully!");

      // Delete dummy test accounts matching automated test patterns
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
        RETURNING id, name, email;
      `;

      const deletedUsers = await client.query(deleteUsersQuery);
      console.log(`[Purge] Successfully removed ${deletedUsers.rowCount} dummy accounts from 'users' table.`);

      // Delete dummy admins matching test patterns
      const deleteAdminsQuery = `
        DELETE FROM admins
        WHERE email LIKE 'admin_17906%'
           OR email LIKE '%@example.com'
        RETURNING id, name, email;
      `;

      const deletedAdmins = await client.query(deleteAdminsQuery);
      console.log(`[Purge] Successfully removed ${deletedAdmins.rowCount} dummy accounts from 'admins' table.`);

      // Show final remaining users in users table
      const finalUsers = await client.query("SELECT id, name, email, role, coins, level, wins, created_at FROM users ORDER BY created_at DESC;");
      console.log(`\n=== REMAINING REAL PLAYERS IN 'users' TABLE (${finalUsers.rowCount}) ===`);
      console.table(finalUsers.rows);

      // Show final remaining admins in admins table
      const finalAdmins = await client.query("SELECT id, name, email, role, title, created_at FROM admins ORDER BY created_at DESC;");
      console.log(`\n=== REMAINING REAL ADMINS IN 'admins' TABLE (${finalAdmins.rowCount}) ===`);
      console.table(finalAdmins.rows);

      await client.end();
      console.log("[Purge] Complete!");
      return;
    } catch (err) {
      console.warn(`[Purge] Attempt ${attempt} failed:`, err.message);
      try { await client.end(); } catch (_) {}
      if (attempt < 4) {
        console.log("Waiting 2 seconds before retrying...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
}

purgeWithRetry();
