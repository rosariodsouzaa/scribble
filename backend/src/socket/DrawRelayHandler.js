/**
 * DrawRelayHandler
 * Encapsulates drawer authentication, stroke data sanitization, and broadcasting.
 */
export class DrawRelayHandler {
  /**
   * @param {import("socket.io").Server} io 
   * @param {import("../repositories/RoomRepository.js").RoomRepository} repository 
   */
  constructor(io, repository) {
    this.io = io;
    this.repository = repository;
  }

  /**
   * Relays drawing strokes from drawer to guessers
   * @param {import("socket.io").Socket} socket 
   * @param {string} type - "start" | "move" | "end"
   * @param {object} data 
   */
  relay(socket, type, data = {}) {
    const room = this.getCurrentRoom(socket);
    if (!room || !room.round || room.round.drawerId !== socket.id) return;

    socket.to(room.channel).emit("draw-update", {
      type,
      ...this.sanitize(type, data),
    });
  }

  /**
   * Relays clear canvas command
   * @param {import("socket.io").Socket} socket 
   */
  clearCanvas(socket) {
    const room = this.getCurrentRoom(socket);
    if (room && room.round && room.round.drawerId === socket.id) {
      socket.to(room.channel).emit("clear-canvas", {});
    }
  }

  sanitize(type, data) {
    if (type === "start") {
      return {
        x: this.sanitizeNum(data.x),
        y: this.sanitizeNum(data.y),
        color: this.sanitizeStr(data.color),
        size: this.sanitizeNum(data.size),
      };
    }
    if (type === "move") {
      const points = Array.isArray(data.points)
        ? data.points.slice(0, 300).map((p) => ({
            x: this.sanitizeNum(p?.x),
            y: this.sanitizeNum(p?.y),
          }))
        : [];
      return { points };
    }
    return {};
  }

  sanitizeNum(v) {
    return typeof v === "number" && Number.isFinite(v) ? v : 0;
  }

  sanitizeStr(v) {
    return typeof v === "string" ? v.slice(0, 20) : "#111827";
  }

  getCurrentRoom(socket) {
    const code = socket.data?.roomCode;
    return code ? this.repository.get(code) : null;
  }
}
