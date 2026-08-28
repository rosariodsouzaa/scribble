import { roomRepository } from "../repositories/RoomRepository.js";

/**
 * Backward compatibility wrapper for roomRepository
 */
export const store = {
  has: (code) => roomRepository.has(code),
  get: (code) => roomRepository.get(code),
  set: (code, room) => roomRepository.set(code, room),
  delete: (code) => roomRepository.delete(code),
  size: () => roomRepository.size,
  values: () => roomRepository.values(),
  genCode: () => roomRepository.generateCode(),
};
