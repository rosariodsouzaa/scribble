/**
 * Backward compatibility facade delegating to OOP GameRoom and RoomRepository
 */
import { roomRepository } from "../repositories/RoomRepository.js";
import { GameRoom } from "../models/GameRoom.js";
import { Player } from "../models/Player.js";

export function createRoom(code, options = {}) {
  return roomRepository.createRoom(code, options);
}

export function serializePlayer(p) {
  return p instanceof Player ? p.serialize() : p;
}

export function serializeRoom(room, forSocketId) {
  return room instanceof GameRoom ? room.serialize(forSocketId) : room;
}

export function addPlayer(io, room, socket, { username, clientId }) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    return room.addPlayer(socket, { username, clientId });
  }
  return null;
}

export function setReady(io, room, socketId, ready) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.setPlayerReady(socketId, ready);
  }
}

export function removePlayer(io, room, socketId, reason) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.removePlayer(socketId, reason);
  }
}

export function startGame(io, room, socketId) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    return room.startGame(socketId);
  }
}

export function startRound(io, room) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.startRound();
  }
}

export function endRound(io, room, reason) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.endRound(reason);
  }
}

export function endGame(io, room) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.endGame();
  }
}

export function handleGuess(io, room, socketId, text) {
  if (room instanceof GameRoom) {
    room.setIo(io);
    room.handleGuess(socketId, text);
  }
}

export function destroyRoom(room) {
  if (room instanceof GameRoom) {
    roomRepository.delete(room.code);
  }
}

export function startSweeper() {
  roomRepository.startSweeper();
}
