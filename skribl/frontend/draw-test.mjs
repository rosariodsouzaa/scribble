// Focused test for the draw-sync protocol (the "strokes mirror" check without a
// browser). Verifies: (1) the drawer's draw-start/draw-move are relayed to the
// guesser as draw-update with matching normalized data; (2) the drawer does NOT
// receive its own strokes echoed; (3) a NON-drawer's draw attempt is rejected by
// the server (anti-grief gating). Requires backend up on :3001.
import { io } from "socket.io-client";

const BASE = "http://127.0.0.1:3001";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((res) => s.once(ev, res));
const mk = () => io(BASE, { transports: ["websocket"], reconnection: false });

const { code } = await (await fetch(BASE + "/api/rooms", { method: "POST" })).json();
const A = mk();
const B = mk();
await Promise.all([once(A, "connect"), once(B, "connect")]);

const updates = { A: [], B: [] };
A.on("draw-update", (d) => updates.A.push(d));
B.on("draw-update", (d) => updates.B.push(d));
A.on("game-error", (e) => console.log("[A] game-error", e));
B.on("game-error", (e) => console.log("[B] game-error", e));

A.emit("join-room", { code, username: "Drawer", clientId: "d-1" });
await once(A, "room-state");
B.emit("join-room", { code, username: "Guesser", clientId: "g-1" });
await once(B, "room-state");

let drawerSock, guesserSock, drawerId;
let ran = false;
let done;
const finished = new Promise((r) => (done = r));

async function onRound(p) {
  if (ran) return;
  ran = true;
  drawerId = p.drawerId;
  drawerSock = A.id === drawerId ? A : B;
  guesserSock = drawerSock === A ? B : A;

  // (1) legit strokes from the drawer
  drawerSock.emit("draw-start", { x: 0.1, y: 0.2, color: "#ff0000", size: 8 });
  drawerSock.emit("draw-move", { points: [{ x: 0.2, y: 0.3 }, { x: 0.4, y: 0.5 }] });
  await wait(400);

  // (3) illegal stroke from the non-drawer (should be dropped by the server)
  guesserSock.emit("draw-start", { x: 0.9, y: 0.9, color: "#000000", size: 4 });
  await wait(400);

  done();
}
A.on("round-start", onRound);
B.on("round-start", onRound);

A.emit("player-ready", { ready: true });
B.emit("player-ready", { ready: true });
await wait(300);
A.emit("start-game");

await Promise.race([finished, wait(20000).then(() => { throw new Error("TIMEOUT"); })]);

const gUpd = drawerSock === A ? updates.B : updates.A; // guesser's inbox
const dUpd = drawerSock === A ? updates.A : updates.B; // drawer's inbox

const near = (a, b) => Math.abs(a - b) < 1e-6;
const gotStart = gUpd.find((d) => d.type === "draw-start" && near(d.x, 0.1) && d.color === "#ff0000" && d.size === 8);
const gotMove = gUpd.find((d) => d.type === "draw-move" && d.points?.length === 2 && near(d.points[1].x, 0.4));
const illegalLeaked =
  dUpd.find((d) => d.type === "draw-start" && near(d.x ?? -1, 0.9)) ||
  gUpd.find((d) => d.type === "draw-start" && near(d.x ?? -1, 0.9));
const drawerEchoedOwn = dUpd.length > 0;

console.log("guesser received draw-update events:", gUpd.length);
console.log("  draw-start relayed w/ color+size:", !!gotStart);
console.log("  draw-move relayed w/ 2 points:   ", !!gotMove);
console.log("drawer received own strokes echoed:  ", drawerEchoedOwn, "(want false)");
console.log("non-drawer illegal stroke leaked:    ", !!illegalLeaked, "(want false)");

const errors = [];
if (!gotStart) errors.push("drawer's draw-start not relayed to guesser");
if (!gotMove) errors.push("drawer's draw-move not relayed to guesser");
if (drawerEchoedOwn) errors.push("drawer received its own strokes echoed back");
if (illegalLeaked) errors.push("non-drawer's stroke was relayed (gating failed)");

console.log("\n=== RESULT ===");
console.log(errors.length ? "FAIL:\n - " + errors.join("\n - ") : "DRAW SYNC OK");

A.close();
B.close();
process.exit(errors.length ? 1 : 0);
