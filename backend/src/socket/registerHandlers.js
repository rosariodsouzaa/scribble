import { SocketController } from "./SocketController.js";
import { roomRepository } from "../repositories/RoomRepository.js";

/**
 * Convenience export delegating to the OOP SocketController
 * @param {import("socket.io").Server} io 
 * @param {import("socket.io").Socket} socket 
 */
export function registerHandlers(io, socket) {
  const controller = new SocketController(io, roomRepository);
  controller.bind(socket);
}
