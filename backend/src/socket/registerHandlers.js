// Wires each socket connection's client->server events to the game state machine.
// Enforces the two core guards: only the drawer may draw/clear, and room lookups
// go through the socket's tracked room code.
import { store } from "../rooms/store.js";
import {
  addPlayer,
  setReady,
  startGame,
  handleGuess,
  removePlayer,
} from "../rooms/room.js";

const channel = (code) => `room:${code}`;

export function registerHandlers(io, socket) {
  socket.on("join-room", ({ code, username, clientId } = {}) => {
    const room = store.get(String(code || "").toUpperCase());
    if (!room) {
      socket.emit("game-error", { code: "room-not-found", message: "Room not found." });
      return;
    }
    addPlayer(io, room, socket, { username, clientId });
  });

  socket.on("leave-room", () => {
    const room = currentRoom(socket);
    if (!room) return;
    const code = room.code;
    removePlayer(io, room, socket.id, "left");
    socket.leave(channel(code));
    socket.data.roomCode = null;
  });

  socket.on("player-ready", ({ ready } = {}) => {
    const room = currentRoom(socket);
    if (room) setReady(io, room, socket.id, ready);
  });

  socket.on("start-game", () => {
    const room = currentRoom(socket);
    if (room) startGame(io, room, socket.id);
  });

  // --- drawing: drawer-only, relayed blindly (no server-side stroke storage) ---
  socket.on("draw-start", (data) => relayDraw(io, socket, "start", data));
  socket.on("draw-move", (data) => relayDraw(io, socket, "move", data));
  socket.on("draw-end", () => relayDraw(io, socket, "end", {}));

  socket.on("clear-canvas", () => {
    const room = currentRoom(socket);
    if (room && room.round.drawerId === socket.id) {
      socket.to(channel(room.code)).emit("clear-canvas", {});
    }
  });

  socket.on("submit-guess", ({ text } = {}) => {
    const room = currentRoom(socket);
    if (room) handleGuess(io, room, socket.id, text);
  });

  socket.on("disconnect", () => {
    const room = currentRoom(socket);
    if (room) removePlayer(io, room, socket.id, "disconnected");
  });
}

function currentRoom(socket) {
  const code = socket.data.roomCode;
  return code ? store.get(code) : null;
}

function relayDraw(io, socket, type, data = {}) {
  const room = currentRoom(socket);
  if (!room || room.round.drawerId !== socket.id) return; // only the drawer draws
  socket.to(channel(room.code)).emit("draw-update", { type, ...sanitizeDraw(type, data) });
}

function sanitizeDraw(type, data) {
  if (type === "start") {
    return { x: num(data.x), y: num(data.y), color: str(data.color), size: num(data.size) };
  }
  if (type === "move") {
    const points = Array.isArray(data.points)
      ? data.points.slice(0, 300).map((p) => ({ x: num(p?.x), y: num(p?.y) }))
      : [];
    return { points };
  }
  return {};
}

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const str = (v) => (typeof v === "string" ? v.slice(0, 20) : "#111827");
