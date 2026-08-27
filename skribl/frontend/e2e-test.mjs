// Headless two-client integration test for the Scribble Royale game engine.
// Alice (host) + Bob join a room, ready up, and play a full 3-round game to
// game-end. Also asserts the anti-leak contract: the secret word reaches ONLY
// the drawer (via `new-word`), never a guesser, and never appears on
// `round-start` / `guess-result`. Requires the backend up on :3001.
import { io } from "socket.io-client";

const BASE = "http://127.0.0.1:3001";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((res) => s.once(ev, res));
const say = (m) => console.log(m);
const mk = (name) => {
  const s = io(BASE, { transports: ["websocket"], reconnection: false });
  s._name = name;
  return s;
};

const leaks = [];

const { code } = await (await fetch(BASE + "/api/rooms", { method: "POST" })).json();
say(`room created: ${code}`);

const A = mk("Alice");
const B = mk("Bob");
await Promise.all([once(A, "connect"), once(B, "connect")]);
say(`connected: Alice=${A.id.slice(0, 6)} Bob=${B.id.slice(0, 6)}`);

let drawerId = null;
let guesserSock = null;
const rounds = [];

// --- anti-leak assertions on both clients ---
for (const c of [A, B]) {
  c.on("game-error", (e) => say(`[${c._name}] game-error: ${JSON.stringify(e)}`));
  c.on("round-start", (p) => {
    if ("word" in p) leaks.push(`round-start carried 'word' to ${c._name}`);
  });
  c.on("new-word", ({ word }) => {
    if (c.id !== drawerId) { leaks.push(`new-word delivered to NON-drawer ${c._name}`); return; }
    if (guesserSock) guesserSock.emit("submit-guess", { text: word });
  });
  c.on("guess-result", (r) => {
    if (r.correct && ("word" in r || "text" in r)) leaks.push(`correct guess-result leaked to ${c._name}`);
  });
}

// --- round/score bookkeeping (observe via A only, to avoid dup) ---
function setDrawer(p) {
  drawerId = p.drawerId;
  guesserSock = A.id === drawerId ? B : A;
}
A.on("round-start", (p) => {
  setDrawer(p);
  rounds.push({ n: p.number, drawer: p.drawerName });
  say(`round ${p.number}/${p.maxRounds} start — drawer=${p.drawerName} masked="${p.maskedWord}" len=${p.wordLength}`);
});
B.on("round-start", setDrawer);

let firstTick = false;
A.on("timer-tick", ({ remaining }) => {
  if (!firstTick) { firstTick = true; say(`  timer-tick observed (remaining=${remaining})`); }
});
A.on("guess-result", (r) => { if (r.correct) say(`  ✓ ${r.username} guessed correctly`); });
A.on("score-update", ({ players }) => say("  scores: " + players.map((p) => `${p.username}=${p.score}`).join(" ")));
A.on("round-end", (r) => say(`round ${r.number} end — reason=${r.reason} word="${r.word}" nextIn=${r.nextIn}`));

const gameEnd = once(A, "game-end");

// --- join handshake ---
A.emit("join-room", { code, username: "Alice", clientId: "alice-1" });
await once(A, "room-state");
say("Alice joined (host)");
B.emit("join-room", { code, username: "Bob", clientId: "bob-1" });
await once(B, "room-state");
say("Bob joined");

// ready both, then host starts
A.emit("player-ready", { ready: true });
B.emit("player-ready", { ready: true });
await wait(300);
say("both ready → Alice starts game");
A.emit("start-game");

const end = await Promise.race([
  gameEnd,
  wait(45000).then(() => { throw new Error("TIMEOUT waiting for game-end"); }),
]);

say("\n=== GAME-END ===");
say("winnerId=" + end.winnerId);
say("standings: " + end.standings.map((p) => `${p.username}=${p.score}`).join(" "));
const winner = end.standings.find((p) => p.id === end.winnerId);
say("winner=" + (winner ? winner.username : "?"));

say("\n=== SECURITY (anti-leak) ===");
say(leaks.length === 0
  ? "PASS — secret word never leaked to a guesser over the wire."
  : "FAIL:\n - " + leaks.join("\n - "));

const errors = [];
if (rounds.length !== 3) errors.push(`expected 3 rounds, saw ${rounds.length}`);
if (leaks.length) errors.push("anti-leak violations present");
if (!winner) errors.push("no winner resolved");
const byName = Object.fromEntries(end.standings.map((p) => [p.username, p.score]));
if (byName.Bob !== 25) errors.push(`Bob score ${byName.Bob} != 25`);
if (byName.Alice !== 20) errors.push(`Alice score ${byName.Alice} != 20`);
if (winner && winner.username !== "Bob") errors.push(`winner ${winner.username} != Bob`);

say("\n=== RESULT ===");
say(errors.length ? "FAIL:\n - " + errors.join("\n - ") : "ALL ASSERTIONS PASSED");

A.close();
B.close();
process.exit(errors.length ? 1 : 0);
