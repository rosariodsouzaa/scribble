import { customAlphabet } from "nanoid";
import { config } from "../config.js";
import { GameRoom } from "../models/GameRoom.js";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = customAlphabet(ALPHABET, 6);

/**
 * Room Repository
 * Encapsulates room persistence, code generation, querying, and sweeper maintenance.
 */
export class RoomRepository {
  /**
   * @param {import("socket.io").Server} [io] 
   */
  constructor(io = null) {
    this.rooms = new Map(); // code -> GameRoom
    this.io = io;
    this.sweeperInterval = null;
  }

  /**
   * Inject or update Socket.io instance
   * @param {import("socket.io").Server} io 
   */
  setIo(io) {
    this.io = io;
    for (const room of this.rooms.values()) {
      room.setIo(io);
    }
  }

  /**
   * Generate a unique, unused room code
   * @returns {string}
   */
  generateCode() {
    let code;
    do {
      code = makeCode();
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Factory method to create, register, and return a new GameRoom
   * @param {string} [code] 
   * @param {object} [options] 
   * @returns {GameRoom}
   */
  createRoom(code = null, options = {}) {
    const roomCode = (code || this.generateCode()).toUpperCase();
    const room = new GameRoom(roomCode, options, this.io);
    this.rooms.set(roomCode, room);
    return room;
  }

  /**
   * Retrieve a room by code
   * @param {string} code 
   * @returns {GameRoom|undefined}
   */
  get(code) {
    if (!code) return undefined;
    return this.rooms.get(String(code).toUpperCase());
  }

  /**
   * Check if a room exists
   * @param {string} code 
   * @returns {boolean}
   */
  has(code) {
    if (!code) return false;
    return this.rooms.has(String(code).toUpperCase());
  }

  /**
   * Set or update a room in the repository
   * @param {string} code 
   * @param {GameRoom} room 
   */
  set(code, room) {
    const roomCode = String(code).toUpperCase();
    this.rooms.set(roomCode, room);
    return room;
  }

  /**
   * Delete and destroy a room
   * @param {string} code 
   * @returns {boolean}
   */
  delete(code) {
    const roomCode = String(code).toUpperCase();
    const room = this.rooms.get(roomCode);
    if (room) {
      room.destroy();
      return this.rooms.delete(roomCode);
    }
    return false;
  }

  /**
   * Total number of active rooms
   * @returns {number}
   */
  get size() {
    return this.rooms.size;
  }

  /**
   * Returns iterator of active rooms
   * @returns {IterableIterator<GameRoom>}
   */
  values() {
    return this.rooms.values();
  }

  /**
   * Start the empty room cleanup sweeper
   */
  startSweeper() {
    if (this.sweeperInterval) return;

    this.sweeperInterval = setInterval(() => {
      const now = Date.now();
      for (const room of [...this.rooms.values()]) {
        if (room.players.size === 0) {
          if (room.emptySince == null) {
            room.emptySince = now;
          } else if (now - room.emptySince > config.emptyRoomGraceMs) {
            this.delete(room.code);
          }
        }
      }
    }, config.sweepIntervalMs);
  }

  /**
   * Stop the sweeper
   */
  stopSweeper() {
    if (this.sweeperInterval) {
      clearInterval(this.sweeperInterval);
      this.sweeperInterval = null;
    }
  }
}

// Global Singleton Repository
export const roomRepository = new RoomRepository();
