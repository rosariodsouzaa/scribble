import { Router } from "express";
import { roomRepository } from "../repositories/RoomRepository.js";

const router = Router();

// Create a room: reserve a code and instantiate GameRoom
router.post("/", (req, res) => {
  const options = req.body || {};
  const room = roomRepository.createRoom(null, options);
  res.status(201).json({ code: room.code });
});

// Lightweight existence/joinability check (used before navigating to a room)
router.get("/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const room = roomRepository.get(code);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({
    code: room.code,
    state: room.state,
    playerCount: room.players.size,
    joinable: room.state === "waiting",
  });
});

export default router;
