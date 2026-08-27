import { Router } from "express";
import { store } from "../rooms/store.js";
import { createRoom } from "../rooms/room.js";

const router = Router();

// Create a room: reserve a code now; the first socket to join-room becomes host.
router.post("/", (_req, res) => {
  const code = store.genCode();
  createRoom(code);
  res.status(201).json({ code });
});

// Lightweight existence/joinability check (used before navigating to a room).
router.get("/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const room = store.get(code);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    code: room.code,
    state: room.state,
    playerCount: room.players.size,
    joinable: room.state === "waiting",
  });
});

export default router;
