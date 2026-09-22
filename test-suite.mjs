import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const PORT = 3001;
const BASE = `http://127.0.0.1:${PORT}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((res) => s.once(ev, res));

console.log("🐉 Starting Scribble Royale Comprehensive Test Suite...\n");

// 1. Start backend process
const backend = spawn(process.execPath, ["src/index.js"], {
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

async function runTests() {
  try {
    // Wait for server to listen
    let connected = false;
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

    if (!connected) {
      throw new Error("Failed to connect to backend on port " + PORT);
    }
    console.log("✓ Backend is up and listening on port " + PORT);

    // Test 1: Health & Database Provider Check
    console.log("\n--- TEST 1: Health & Database Telemetry ---");
    const healthRes = await fetch(`${BASE}/api/health`);
    const health = await healthRes.json();
    console.log(`  Health status: ok=${health.ok}, db provider=${health.db?.provider}`);
    if (!health.ok || !health.db?.provider) {
      throw new Error("Health check failed");
    }
    console.log("✓ Health & DB provider verified");

    // Test 2: Seed Demo Accounts
    console.log("\n--- TEST 2: Seed Demo Accounts ---");
    const seedRes = await fetch(`${BASE}/api/auth/seed-demo`, { method: "POST" });
    const seedData = await seedRes.json();
    if (!seedData.success || !seedData.demoAccounts?.admin) {
      throw new Error("Seed demo accounts failed: " + JSON.stringify(seedData));
    }
    console.log("✓ Demo accounts seeded successfully:", Object.keys(seedData.demoAccounts));

    // Test 3: Authenticate Warrior & Admin
    console.log("\n--- TEST 3: Login & JWT Authentication ---");
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "warrior@scribbleroyale.io", password: "warrior123" }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token || !loginData.user) {
      throw new Error("Login failed: " + JSON.stringify(loginData));
    }
    console.log(`✓ Warrior logged in: ${loginData.user.name} (Role: ${loginData.user.role})`);
    const token = loginData.token;

    // Test 4: Auth Session (GET /api/auth/me)
    console.log("\n--- TEST 4: Verified Session Check ---");
    const meRes = await fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    if (!meData.user || meData.user.email !== "warrior@scribbleroyale.io") {
      throw new Error("Session check failed");
    }
    console.log(`✓ Session validated for ${meData.user.email}`);

    // Test 5: Change Password Security Endpoint
    console.log("\n--- TEST 5: Change Battle Passcode Feature ---");
    // Subtest 5a: Wrong current passcode should fail
    const wrongPwRes = await fetch(`${BASE}/api/auth/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: "WRONG_PASSWORD", newPassword: "newwarriorpass123" }),
    });
    if (wrongPwRes.status !== 400) {
      throw new Error("Expected 400 for incorrect current password, got: " + wrongPwRes.status);
    }
    console.log("✓ Incorrect current passcode properly rejected (400)");

    // Subtest 5b: Short password should fail
    const shortPwRes = await fetch(`${BASE}/api/auth/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: "warrior123", newPassword: "123" }),
    });
    if (shortPwRes.status !== 400) {
      throw new Error("Expected 400 for short passcode, got: " + shortPwRes.status);
    }
    console.log("✓ Short passcode (<6 chars) properly rejected (400)");

    // Subtest 5c: Successful passcode change
    const validChangeRes = await fetch(`${BASE}/api/auth/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: "warrior123", newPassword: "newwarriorpass123" }),
    });
    const validChangeData = await validChangeRes.json();
    if (!validChangeData.success) {
      throw new Error("Passcode update failed: " + JSON.stringify(validChangeData));
    }
    console.log("✓ Passcode successfully changed: " + validChangeData.message);

    // Subtest 5d: Verify login with new passcode
    const reLoginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "warrior@scribbleroyale.io", password: "newwarriorpass123" }),
    });
    const reLoginData = await reLoginRes.json();
    if (!reLoginData.token) {
      throw new Error("Login with new passcode failed");
    }
    console.log("✓ Login with newly updated passcode succeeded!");

    // Revert passcode back to warrior123 for demo consistency
    await fetch(`${BASE}/api/auth/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${reLoginData.token}`,
      },
      body: JSON.stringify({ currentPassword: "newwarriorpass123", newPassword: "warrior123" }),
    });
    console.log("✓ Passcode cleanly reset back to default demo value");

    // Test 6: Room Creation & Socket Multiplayer Flow
    console.log("\n--- TEST 6: Room Summoning & Draw-Sync Protocol ---");
    const roomRes = await fetch(`${BASE}/api/rooms`, { method: "POST" });
    const { code } = await roomRes.json();
    console.log(`  Chamber created: ${code}`);

    const mkSocket = (username) => {
      const s = io(BASE, { transports: ["websocket"], reconnection: false });
      s._name = username;
      return s;
    };

    const A = mkSocket("Alice");
    const B = mkSocket("Bob");
    await Promise.all([once(A, "connect"), once(B, "connect")]);
    console.log("  Socket clients connected to chamber gateway");

    const updates = { A: [], B: [] };
    A.on("draw-update", (d) => updates.A.push(d));
    B.on("draw-update", (d) => updates.B.push(d));

    A.emit("join-room", { code, username: "Alice", clientId: "alice-c1" });
    await once(A, "room-state");
    B.emit("join-room", { code, username: "Bob", clientId: "bob-c1" });
    await once(B, "room-state");
    console.log("  Alice and Bob joined chamber successfully");

    // Ready up
    A.emit("player-ready", { ready: true });
    B.emit("player-ready", { ready: true });
    await wait(300);

    // Start game
    A.emit("start-game");
    const roundP = await once(A, "round-start");
    console.log(`  Round 1 started! Drawer=${roundP.drawerName} (len=${roundP.wordLength})`);

    const drawerSock = A.id === roundP.drawerId ? A : B;
    const guesserSock = drawerSock === A ? B : A;

    // Send drawer stroke
    drawerSock.emit("draw-start", { x: 0.15, y: 0.25, color: "#f59e0b", size: 7 });
    drawerSock.emit("draw-move", { points: [{ x: 0.3, y: 0.4 }] });
    await wait(400);

    const guesserUpdates = drawerSock === A ? updates.B : updates.A;
    const receivedStroke = guesserUpdates.find((u) => u.type === "start" && u.color === "#f59e0b");
    if (!receivedStroke) {
      throw new Error("Drawer stroke was not relayed to guesser");
    }
    console.log("✓ Draw-relay synchronized correctly to other warriors!");

    // Non-drawer anti-grief gating check
    updates.A = [];
    updates.B = [];
    guesserSock.emit("draw-start", { x: 0.88, y: 0.88, color: "#000000", size: 10 });
    await wait(400);
    const leakedStroke = (drawerSock === A ? updates.A : updates.B).find((u) => u.type === "start");
    if (leakedStroke) {
      throw new Error("Illegal non-drawer stroke leaked through server!");
    }
    console.log("✓ Anti-grief protection verified: non-drawer stroke rejected by server");

    A.close();
    B.close();

    console.log("\n==========================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (6/6)");
    console.log("==========================================\n");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    backend.kill();
    process.exit(process.exitCode || 0);
  }
}

runTests();
