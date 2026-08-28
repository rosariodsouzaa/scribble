import { roomRepository } from "../repositories/RoomRepository.js";
import { DrawRelayHandler } from "./DrawRelayHandler.js";
import { RoomEventHandler } from "./RoomEventHandler.js";
import { GuessEventHandler } from "./GuessEventHandler.js";

/**
 * SocketController
 * Coordinates modular WebSocket sub-handlers with GameRoom domain models.
 */
export class SocketController {
  /**
   * @param {import("socket.io").Server} io 
   * @param {import("../repositories/RoomRepository.js").RoomRepository} [repository] 
   */
  constructor(io, repository = roomRepository) {
    this.io = io;
    this.repository = repository;
    this.drawHandler = new DrawRelayHandler(io, repository);
    this.roomHandler = new RoomEventHandler(io, repository);
    this.guessHandler = new GuessEventHandler(io, repository);
  }

  /**
   * Bind event listeners to an incoming socket connection
   * @param {import("socket.io").Socket} socket 
   */
  bind(socket) {
    // Room lifecycle events
    socket.on("join-room", (data) => this.roomHandler.handleJoin(socket, data));
    socket.on("leave-room", () => this.roomHandler.handleLeave(socket));
    socket.on("player-ready", (data) => this.roomHandler.handleReady(socket, data));
    socket.on("start-game", () => this.roomHandler.handleStartGame(socket));
    socket.on("disconnect", () => this.roomHandler.handleDisconnect(socket));

    // Drawing pipeline (drawer only, zero server stroke storage)
    socket.on("draw-start", (data) => this.drawHandler.relay(socket, "start", data));
    socket.on("draw-move", (data) => this.drawHandler.relay(socket, "move", data));
    socket.on("draw-end", () => this.drawHandler.relay(socket, "end", {}));
    socket.on("clear-canvas", () => this.drawHandler.clearCanvas(socket));

    // Guessing events
    socket.on("submit-guess", (data) => this.guessHandler.handleGuess(socket, data));
  }
}
