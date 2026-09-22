import { io } from "socket.io-client";

const BASE = "http://127.0.0.1:3001";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((res) => s.once(ev, res));

async function runTest1Round() {
  console.log("\n=== TEST 1: 1 Round Selected with 2 Players (Alice & Bob) ===");
  // Create room with maxRounds = 1
  const res = await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxRounds: 1, roundDurationSec: 5 }),
  });
  const { code } = await res.json();
  console.log(`Created Chamber: ${code} with maxRounds = 1`);

  const A = io(BASE, { transports: ["websocket"] });
  const B = io(BASE, { transports: ["websocket"] });

  await Promise.all([once(A, "connect"), once(B, "connect")]);

  const turnsRecorded = [];
  const onRoundStart = (cName) => (payload) => {
    if (cName === "Alice") {
      turnsRecorded.push({
        roundNum: payload.number,
        maxRounds: payload.maxRounds,
        drawerId: payload.drawerId,
        drawerName: payload.drawerName,
        turnNumber: payload.turnNumber,
        totalTurnsInRound: payload.totalTurnsInRound,
      });
      console.log(`  [Turn ${turnsRecorded.length}] Round ${payload.number}/${payload.maxRounds} (Turn ${payload.turnNumber}/${payload.totalTurnsInRound}): ${payload.drawerName} is drawing!`);
    }
  };

  A.on("round-start", onRoundStart("Alice"));
  B.on("round-start", onRoundStart("Bob"));

  // Word auto-guess to speed up turn transitions
  A.on("new-word", ({ word }) => {
    // A is drawer, B guesses
    setTimeout(() => B.emit("submit-guess", { text: word }), 200);
  });
  B.on("new-word", ({ word }) => {
    // B is drawer, A guesses
    setTimeout(() => A.emit("submit-guess", { text: word }), 200);
  });

  const gameEndP = once(A, "game-end");

  // Join & ready
  A.emit("join-room", { code, username: "Alice", clientId: "c-alice-1" });
  await once(A, "room-state");
  B.emit("join-room", { code, username: "Bob", clientId: "c-bob-1" });
  await once(B, "room-state");

  A.emit("player-ready", { ready: true });
  B.emit("player-ready", { ready: true });
  await wait(300);

  // Alice starts game
  A.emit("start-game");

  const gameEndResult = await Promise.race([
    gameEndP,
    wait(20000).then(() => { throw new Error("Timeout waiting for 1-round game-end"); }),
  ]);

  console.log(`✓ Game ended successfully! Total turns recorded: ${turnsRecorded.length}`);
  console.log("Standings:", gameEndResult.standings.map(p => `${p.username}: ${p.score}`));

  // Assertions:
  if (turnsRecorded.length !== 2) {
    throw new Error(`Expected exactly 2 turns (1 for Alice, 1 for Bob), but got ${turnsRecorded.length}`);
  }

  const drawerNames = turnsRecorded.map(t => t.drawerName);
  if (!drawerNames.includes("Alice") || !drawerNames.includes("Bob")) {
    throw new Error(`Both Alice and Bob must have drawn, but got: ${drawerNames.join(", ")}`);
  }

  console.log("✓ TEST 1 PASSED: 1 Round = Each player got exactly 1 chance to draw!\n");
  A.close();
  B.close();
}

async function runTest2Rounds() {
  console.log("\n=== TEST 2: 2 Rounds Selected with 2 Players (Alice & Bob) ===");
  // Create room with maxRounds = 2
  const res = await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxRounds: 2, roundDurationSec: 5 }),
  });
  const { code } = await res.json();
  console.log(`Created Chamber: ${code} with maxRounds = 2`);

  const A = io(BASE, { transports: ["websocket"] });
  const B = io(BASE, { transports: ["websocket"] });

  await Promise.all([once(A, "connect"), once(B, "connect")]);

  const turnsRecorded = [];
  const onRoundStart = (cName) => (payload) => {
    if (cName === "Alice") {
      turnsRecorded.push({
        roundNum: payload.number,
        maxRounds: payload.maxRounds,
        drawerId: payload.drawerId,
        drawerName: payload.drawerName,
        turnNumber: payload.turnNumber,
        totalTurnsInRound: payload.totalTurnsInRound,
      });
      console.log(`  [Turn ${turnsRecorded.length}] Round ${payload.number}/${payload.maxRounds} (Turn ${payload.turnNumber}/${payload.totalTurnsInRound}): ${payload.drawerName} is drawing!`);
    }
  };

  A.on("round-start", onRoundStart("Alice"));
  B.on("round-start", onRoundStart("Bob"));

  // Word auto-guess to speed up turn transitions
  A.on("new-word", ({ word }) => {
    setTimeout(() => B.emit("submit-guess", { text: word }), 200);
  });
  B.on("new-word", ({ word }) => {
    setTimeout(() => A.emit("submit-guess", { text: word }), 200);
  });

  const gameEndP = once(A, "game-end");

  // Join & ready
  A.emit("join-room", { code, username: "Alice", clientId: "c-alice-2" });
  await once(A, "room-state");
  B.emit("join-room", { code, username: "Bob", clientId: "c-bob-2" });
  await once(B, "room-state");

  A.emit("player-ready", { ready: true });
  B.emit("player-ready", { ready: true });
  await wait(300);

  // Alice starts game
  A.emit("start-game");

  const gameEndResult = await Promise.race([
    gameEndP,
    wait(35000).then(() => { throw new Error("Timeout waiting for 2-round game-end"); }),
  ]);

  console.log(`✓ Game ended successfully! Total turns recorded: ${turnsRecorded.length}`);
  console.log("Standings:", gameEndResult.standings.map(p => `${p.username}: ${p.score}`));

  // Assertions:
  if (turnsRecorded.length !== 4) {
    throw new Error(`Expected exactly 4 turns (2 for Alice, 2 for Bob), but got ${turnsRecorded.length}`);
  }

  const aliceDrawCount = turnsRecorded.filter(t => t.drawerName === "Alice").length;
  const bobDrawCount = turnsRecorded.filter(t => t.drawerName === "Bob").length;

  if (aliceDrawCount !== 2 || bobDrawCount !== 2) {
    throw new Error(`Expected Alice=2 and Bob=2 drawing turns, but got Alice=${aliceDrawCount}, Bob=${bobDrawCount}`);
  }

  const round1Turns = turnsRecorded.filter(t => t.roundNum === 1);
  const round2Turns = turnsRecorded.filter(t => t.roundNum === 2);

  if (round1Turns.length !== 2 || round2Turns.length !== 2) {
    throw new Error(`Expected 2 turns in Round 1 and 2 turns in Round 2, but got R1=${round1Turns.length}, R2=${round2Turns.length}`);
  }

  console.log("✓ TEST 2 PASSED: 2 Rounds = Each player got exactly 2 chances to draw (4 total turns across 2 rounds)!\n");
  A.close();
  B.close();
}

async function runTest3Players1Round() {
  console.log("\n=== TEST 3: 1 Round Selected with 3 Players (Alice, Bob, Charlie) ===");
  const res = await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxRounds: 1, roundDurationSec: 5 }),
  });
  const { code } = await res.json();
  console.log(`Created Chamber: ${code} with maxRounds = 1`);

  const A = io(BASE, { transports: ["websocket"] });
  const B = io(BASE, { transports: ["websocket"] });
  const C = io(BASE, { transports: ["websocket"] });

  await Promise.all([once(A, "connect"), once(B, "connect"), once(C, "connect")]);

  const turnsRecorded = [];
  A.on("round-start", (payload) => {
    turnsRecorded.push({
      roundNum: payload.number,
      drawerName: payload.drawerName,
      turnNumber: payload.turnNumber,
      totalTurnsInRound: payload.totalTurnsInRound,
    });
    console.log(`  [Turn ${turnsRecorded.length}] Round ${payload.number}/${payload.maxRounds} (Turn ${payload.turnNumber}/${payload.totalTurnsInRound}): ${payload.drawerName} is drawing!`);
  });

  const onWord = (clientName, sock) => ({ word }) => {
    // Other 2 players submit guess
    for (const [name, otherSock] of [["Alice", A], ["Bob", B], ["Charlie", C]]) {
      if (name !== clientName) {
        setTimeout(() => otherSock.emit("submit-guess", { text: word }), 200);
      }
    }
  };

  A.on("new-word", onWord("Alice", A));
  B.on("new-word", onWord("Bob", B));
  C.on("new-word", onWord("Charlie", C));

  const gameEndP = once(A, "game-end");

  // Join & ready
  A.emit("join-room", { code, username: "Alice", clientId: "c-a-3" });
  await once(A, "room-state");
  B.emit("join-room", { code, username: "Bob", clientId: "c-b-3" });
  await once(B, "room-state");
  C.emit("join-room", { code, username: "Charlie", clientId: "c-c-3" });
  await once(C, "room-state");

  A.emit("player-ready", { ready: true });
  B.emit("player-ready", { ready: true });
  C.emit("player-ready", { ready: true });
  await wait(400);

  // Alice starts game
  A.emit("start-game");

  const gameEndResult = await Promise.race([
    gameEndP,
    wait(30000).then(() => { throw new Error("Timeout waiting for 3-player 1-round game-end"); }),
  ]);

  console.log(`✓ Game ended successfully! Total turns recorded: ${turnsRecorded.length}`);
  console.log("Standings:", gameEndResult.standings.map(p => `${p.username}: ${p.score}`));

  if (turnsRecorded.length !== 3) {
    throw new Error(`Expected exactly 3 turns, but got ${turnsRecorded.length}`);
  }

  const drawerNames = new Set(turnsRecorded.map(t => t.drawerName));
  if (drawerNames.size !== 3 || !drawerNames.has("Alice") || !drawerNames.has("Bob") || !drawerNames.has("Charlie")) {
    throw new Error(`All 3 players must have drawn, but got: ${[...drawerNames].join(", ")}`);
  }

  console.log("✓ TEST 3 PASSED: 1 Round with 3 players = All 3 players got exactly 1 chance to draw!\n");
  A.close();
  B.close();
  C.close();
}

async function main() {
  try {
    await runTest1Round();
    await runTest2Rounds();
    await runTest3Players1Round();
    console.log("==================================================");
    console.log("🏆 ALL ROUND MANAGEMENT TESTS PASSED PERFECTLY!");
    console.log("==================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

main();
