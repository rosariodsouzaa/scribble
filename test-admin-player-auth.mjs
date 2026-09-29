import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const PORT = 3001;
const BASE = `http://127.0.0.1:${PORT}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log("🐉 Starting Scribble Royale Admin & Player Separation Test Suite...\n");

let backend = null;

async function runTests() {
  try {
    // Wait for server to listen or connect to running instance
    let connected = false;
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) connected = true;
    } catch {}

    if (!connected) {
      backend = spawn(process.execPath, ["src/index.js"], {
        cwd: "./backend",
        stdio: "pipe",
      });

      backend.stdout.on("data", (d) => {
        const str = d.toString();
        if (str.includes("listening") || str.includes("Error") || str.includes("failed")) {
          process.stdout.write(`  [server] ${str.trim()}\n`);
        }
      });

      backend.stderr.on("data", (d) => {
        process.stderr.write(`  [server-err] ${d.toString()}`);
      });

      for (let i = 0; i < 20; i++) {
        try {
          const res = await fetch(`${BASE}/api/health`);
          if (res.ok) {
            connected = true;
            break;
          }
        } catch {}
        await wait(500);
      }
    }

    if (!connected) {
      throw new Error("Failed to connect to backend on port " + PORT);
    }
    console.log("✓ Backend is up and listening on port " + PORT);

    // Test 1: Seed Demo Accounts
    console.log("\n--- TEST 1: Seed Demo Accounts (Admin in admins table, Warrior in users table) ---");
    const seedRes = await fetch(`${BASE}/api/auth/seed-demo`, { method: "POST" });
    const seedData = await seedRes.json();
    if (!seedData.success || !seedData.demoAccounts?.admin || !seedData.demoAccounts?.user) {
      throw new Error("Seed demo accounts failed: " + JSON.stringify(seedData));
    }
    console.log("✓ Demo accounts seeded successfully: Admin & Warrior");

    // Test 2: Player Login with Player Option -> users table
    console.log("\n--- TEST 2: Player Login (PLAYER + warrior credentials) ---");
    const playerLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "warrior@scribbleroyale.io",
        password: "warrior123",
        accountType: "player",
      }),
    });
    const playerLoginData = await playerLoginRes.json();
    if (!playerLoginData.token || playerLoginData.user.role !== "user" || playerLoginData.user.accountType !== "player") {
      throw new Error("Player login failed: " + JSON.stringify(playerLoginData));
    }
    console.log(`✓ Player logged in successfully: ${playerLoginData.user.name} [AccountType: ${playerLoginData.user.accountType}]`);
    const playerToken = playerLoginData.token;

    // Test 3: Player Credentials with ADMIN Option -> MUST FAIL
    console.log("\n--- TEST 3: Player Credentials with ADMIN option (Must query admins table & FAIL) ---");
    const playerAsAdminRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "warrior@scribbleroyale.io",
        password: "warrior123",
        accountType: "admin",
      }),
    });
    if (playerAsAdminRes.status !== 401) {
      throw new Error(`Expected 401 for player credentials on admin login, got ${playerAsAdminRes.status}`);
    }
    console.log("✓ Correctly rejected player credentials in Admin login (Status 401)");

    // Test 4: Admin Login with Admin Option -> admins table
    console.log("\n--- TEST 4: Admin Login (ADMIN + admin credentials) ---");
    const adminLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@scribbleroyale.io",
        password: "admin123",
        accountType: "admin",
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.token || adminLoginData.user.role !== "admin" || adminLoginData.user.accountType !== "admin") {
      throw new Error("Admin login failed: " + JSON.stringify(adminLoginData));
    }
    console.log(`✓ Admin logged in successfully: ${adminLoginData.user.name} [Role: ${adminLoginData.user.role}, AccountType: ${adminLoginData.user.accountType}]`);
    const adminToken = adminLoginData.token;

    // Test 5: Admin Credentials with PLAYER Option -> MUST FAIL
    console.log("\n--- TEST 5: Admin Credentials with PLAYER option (Must query users table & FAIL) ---");
    const adminAsPlayerRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@scribbleroyale.io",
        password: "admin123",
        accountType: "player",
      }),
    });
    if (adminAsPlayerRes.status !== 401) {
      throw new Error(`Expected 401 for admin credentials on player login, got ${adminAsPlayerRes.status}`);
    }
    console.log("✓ Correctly rejected admin credentials in Player login (Status 401)");

    // Test 6: Player Signup with OTP -> users table
    console.log("\n--- TEST 6: Player Signup (PLAYER + OTP verification) ---");
    const newPlayerEmail = `player_${Date.now()}@dynasty.io`;
    const otpPlayerRes = await fetch(`${BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newPlayerEmail, purpose: "signup", accountType: "player" }),
    });
    const otpPlayerData = await otpPlayerRes.json();
    const playerOtp = otpPlayerData.simulatedOtp || "123456";

    const signupPlayerRes = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Rohan Salkar",
        email: newPlayerEmail,
        password: "passcode123",
        otp: playerOtp,
        accountType: "player",
      }),
    });
    const signupPlayerData = await signupPlayerRes.json();
    if (!signupPlayerData.success || signupPlayerData.user.accountType !== "player") {
      throw new Error("Player signup failed: " + JSON.stringify(signupPlayerData));
    }
    console.log(`✓ Player account created in users table: ${signupPlayerData.user.name} (${newPlayerEmail})`);
    const newPlayerId = signupPlayerData.user.id || signupPlayerData.user._id;

    // Test 7: Admin Signup with OTP -> admins table
    console.log("\n--- TEST 7: Admin Signup (ADMIN + OTP verification) ---");
    const newAdminEmail = `admin_${Date.now()}@dynasty.io`;
    const otpAdminRes = await fetch(`${BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail, purpose: "signup", accountType: "admin" }),
    });
    const otpAdminData = await otpAdminRes.json();
    const adminOtp = otpAdminData.simulatedOtp || "123456";

    const signupAdminRes = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "High Chancellor",
        email: newAdminEmail,
        password: "adminpasscode123",
        otp: adminOtp,
        accountType: "admin",
      }),
    });
    const signupAdminData = await signupAdminRes.json();
    if (!signupAdminData.success || signupAdminData.user.accountType !== "admin") {
      throw new Error("Admin signup failed: " + JSON.stringify(signupAdminData));
    }
    console.log(`✓ Admin account created in admins table: ${signupAdminData.user.name} (${newAdminEmail})`);

    // Test 8: Authorization Protection: Player calling Admin API -> MUST BE FORBIDDEN (403)
    console.log("\n--- TEST 8: Authorization Check (Player accessing GET /api/admin/players) ---");
    const unauthorizedRes = await fetch(`${BASE}/api/admin/players`, {
      headers: { Authorization: `Bearer ${playerToken}` },
    });
    if (unauthorizedRes.status !== 403) {
      throw new Error(`Expected 403 for player accessing admin API, got ${unauthorizedRes.status}`);
    }
    console.log("✓ Player correctly denied access to Admin APIs (Status 403)");

    // Test 9: Admin calling GET /api/admin/players -> SUCCEEDS (200)
    console.log("\n--- TEST 9: Admin Player Management (GET /api/admin/players) ---");
    const adminPlayersRes = await fetch(`${BASE}/api/admin/players`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminPlayersData = await adminPlayersRes.json();
    if (!adminPlayersData.success || !Array.isArray(adminPlayersData.players)) {
      throw new Error("Admin fetch players failed: " + JSON.stringify(adminPlayersData));
    }
    console.log(`✓ Admin fetched players list (${adminPlayersData.players.length} players found in users table)`);
    // Ensure passwords are not exposed
    if (adminPlayersData.players[0].passwordHash || adminPlayersData.players[0].password_hash) {
      throw new Error("Security violation: Player passwords exposed in Admin Panel!");
    }
    console.log("✓ Verified player passwords are never exposed in Admin Panel");

    // Test 10: Create Room and Add Player to Game Room via Admin API
    console.log("\n--- TEST 10: Admin Add Player to Game Room (POST /api/admin/rooms/:roomId/players) ---");
    const roomRes = await fetch(`${BASE}/api/rooms`, { method: "POST" });
    const roomData = await roomRes.json();
    const roomId = roomData.code;
    console.log(`  Created active chamber: #${roomId}`);

    const addPlayerRes = await fetch(`${BASE}/api/admin/rooms/${roomId}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: newPlayerId,
        playerName: "Rohan Salkar",
      }),
    });
    const addPlayerData = await addPlayerRes.json();
    if (!addPlayerData.success || addPlayerData.room.playerCount < 1) {
      throw new Error("Add player to room failed: " + JSON.stringify(addPlayerData));
    }
    console.log(`✓ Admin successfully added player "${signupPlayerData.user.name}" to room #${roomId}`);

    // Test 11: Prevent Duplicate Player in Same Room
    console.log("\n--- TEST 11: Prevent Duplicate Player Addition ---");
    const dupAddRes = await fetch(`${BASE}/api/admin/rooms/${roomId}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: newPlayerId,
        playerName: "Rohan Salkar",
      }),
    });
    if (dupAddRes.status !== 400) {
      throw new Error(`Expected 400 for duplicate player add, got ${dupAddRes.status}`);
    }
    const dupAddData = await dupAddRes.json();
    console.log(`✓ Duplicate player prevented: "${dupAddData.error}"`);

    // Test 12: Admin Remove Player from Room -> Room state updated only
    console.log("\n--- TEST 12: Admin Remove Player from Game Room (DELETE /api/admin/rooms/:roomId/players/:playerId) ---");
    const removeRes = await fetch(`${BASE}/api/admin/rooms/${roomId}/players/Rohan Salkar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const removeData = await removeRes.json();
    if (!removeData.success) {
      throw new Error("Remove player from room failed: " + JSON.stringify(removeData));
    }
    console.log(`✓ Player removed from room: ${removeData.message}`);

    // Test 13: CRITICAL CHECK: Player account in users table MUST STILL EXIST
    console.log("\n--- TEST 13: CRITICAL DATABASE SAFETY CHECK ---");
    const playerCheckRes = await fetch(`${BASE}/api/admin/players/${newPlayerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const playerCheckData = await playerCheckRes.json();
    if (!playerCheckData.success || !playerCheckData.player) {
      throw new Error("CRITICAL FAILURE: Player account was deleted from users table when removed from room!");
    }
    console.log(`✓ CONFIRMED: Player account "${playerCheckData.player.name}" (${playerCheckData.player.email}) remains active in users table!`);

    console.log("\n🎉 ALL 13 TEST SUITES PASSED FLAWLESSLY WITH COMPLETE DATABASE SEPARATION & INTEGRATION!");
  } catch (err) {
    console.error("\n❌ TEST SUITE FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (backend) {
      backend.kill();
    }
    process.exit();
  }
}

runTests();
