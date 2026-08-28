/**
 * RoomEventHandler
 * Encapsulates room lifecycle socket events (join, leave, ready, start, disconnect).
 */
export class RoomEventHandler {
  /**
   * @param {import("socket.io").Server} io 
   * @param {import("../repositories/RoomRepository.js").RoomRepository} repository 
   */
  constructor(io, repository) {
    this.io = io;
    this.repository = repository;
  }

  handleJoin(socket, { code, username, clientId } = {}) {
    const room = this.repository.get(code);
    if (!room) {
      socket.emit("game-error", { code: "room-not-found", message: "Room not found." });
      return;
    }
    room.addPlayer(socket, { username, clientId });
  }

  handleLeave(socket) {
    const room = this.getCurrentRoom(socket);
    if (!room) return;

    room.removePlayer(socket.id, "left");
    socket.leave(room.channel);
    socket.data.roomCode = null;
  }

  handleReady(socket, { ready } = {}) {
    const room = this.getCurrentRoom(socket);
    if (room) {
      room.setPlayerReady(socket.id, ready);
    }
  }

  handleStartGame(socket) {
    const room = this.getCurrentRoom(socket);
    if (room) {
      room.startGame(socket.id);
    }
  }

  handleDisconnect(socket) {
    const room = this.getCurrentRoom(socket);
    if (room) {
      room.removePlayer(socket.id, "disconnected");
    }
  }

  getCurrentRoom(socket) {
    const code = socket.data?.roomCode;
    return code ? this.repository.get(code) : null;
  }
}
