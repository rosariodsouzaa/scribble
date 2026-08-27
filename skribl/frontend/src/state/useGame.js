import { useMemo } from "react";
import { useGameContext } from "./GameProvider.jsx";
import { C2S } from "../lib/events.js";

// Convenience hook: game state + derived flags + action emitters.
export function useGame() {
  const { state, socket } = useGameContext();

  const actions = useMemo(
    () => ({
      join: (code, username, clientId) => socket.emit(C2S.JOIN, { code, username, clientId }),
      leave: () => socket.emit(C2S.LEAVE),
      ready: (ready) => socket.emit(C2S.READY, { ready }),
      start: () => socket.emit(C2S.START),
      guess: (text) => socket.emit(C2S.GUESS, { text }),
      drawStart: (p) => socket.emit(C2S.DRAW_START, p),
      drawMove: (points) => socket.emit(C2S.DRAW_MOVE, { points }),
      drawEnd: () => socket.emit(C2S.DRAW_END),
      clearCanvas: () => socket.emit(C2S.CLEAR),
    }),
    [socket]
  );

  const me = state.players.find((p) => p.id === state.myId) || null;
  const amDrawer = state.round.drawerId != null && state.round.drawerId === state.myId;
  const amHost = state.hostId != null && state.hostId === state.myId;

  return { state, actions, me, amDrawer, amHost, socket };
}
