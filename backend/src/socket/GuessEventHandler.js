/**
 * GuessEventHandler
 * Encapsulates guess submission events and delegates to the active GameRoom.
 */
export class GuessEventHandler {
  /**
   * @param {import("socket.io").Server} io 
   * @param {import("../repositories/RoomRepository.js").RoomRepository} repository 
   */
  constructor(io, repository) {
    this.io = io;
    this.repository = repository;
  }

  handleGuess(socket, { text } = {}) {
    const room = this.getCurrentRoom(socket);
    if (room) {
      room.handleGuess(socket.id, text);
    }
  }

  getCurrentRoom(socket) {
    const code = socket.data?.roomCode;
    return code ? this.repository.get(code) : null;
  }
}
