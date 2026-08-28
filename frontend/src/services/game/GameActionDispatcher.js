import { C2S } from "../../lib/events.js";

/**
 * GameActionDispatcher
 * Encapsulates client-to-server Socket.io message emissions with strong typing and parameters.
 */
export class GameActionDispatcher {
  /**
   * @param {import("socket.io-client").Socket} socket 
   */
  constructor(socket) {
    this.socket = socket;
  }

  join(code, username, clientId) {
    this.socket.emit(C2S.JOIN, { code, username, clientId });
  }

  leave() {
    this.socket.emit(C2S.LEAVE);
  }

  setReady(ready) {
    this.socket.emit(C2S.READY, { ready: Boolean(ready) });
  }

  startGame() {
    this.socket.emit(C2S.START);
  }

  submitGuess(text) {
    this.socket.emit(C2S.GUESS, { text });
  }

  drawStart(strokeParams) {
    this.socket.emit(C2S.DRAW_START, strokeParams);
  }

  drawMove(points) {
    this.socket.emit(C2S.DRAW_MOVE, { points });
  }

  drawEnd() {
    this.socket.emit(C2S.DRAW_END);
  }

  clearCanvas() {
    this.socket.emit(C2S.CLEAR);
  }
}
