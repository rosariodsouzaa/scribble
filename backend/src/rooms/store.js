import { customAlphabet } from "nanoid";

// Unambiguous alphabet (no O/0, I/1) for human-friendly room codes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = customAlphabet(ALPHABET, 6);

// The single source of truth for all live rooms. Behind this wrapper so it can
// later be swapped for Redis/Mongo without touching the game engine.
const rooms = new Map();

export const store = {
  has: (code) => rooms.has(code),
  get: (code) => rooms.get(code),
  set: (code, room) => (rooms.set(code, room), room),
  delete: (code) => rooms.delete(code),
  size: () => rooms.size,
  values: () => rooms.values(),

  // Generate a room code that isn't currently in use.
  genCode() {
    let code;
    do {
      code = makeCode();
    } while (rooms.has(code));
    return code;
  },
};
