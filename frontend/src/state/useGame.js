import { useMemo } from "react";
import { useGameContext } from "./GameProvider.jsx";
import { GameActionDispatcher } from "../services/game/index.js";

/**
 * useGame Hook
 * Provides game state, player roles, and OOP GameActionDispatcher methods.
 */
export function useGame() {
  const { state, socket } = useGameContext();

  const dispatcher = useMemo(() => new GameActionDispatcher(socket), [socket]);

  const actions = useMemo(
    () => ({
      join: (code, username, clientId) => dispatcher.join(code, username, clientId),
      leave: () => dispatcher.leave(),
      ready: (ready) => dispatcher.setReady(ready),
      start: () => dispatcher.startGame(),
      guess: (text) => dispatcher.submitGuess(text),
      drawStart: (p) => dispatcher.drawStart(p),
      drawMove: (points) => dispatcher.drawMove(points),
      drawEnd: () => dispatcher.drawEnd(),
      clearCanvas: () => dispatcher.clearCanvas(),
    }),
    [dispatcher]
  );

  const me = state.players.find((p) => p.id === state.myId) || null;
  const amDrawer = state.round.drawerId != null && state.round.drawerId === state.myId;
  const amHost = state.hostId != null && state.hostId === state.myId;

  return { state, actions, me, amDrawer, amHost, socket, dispatcher };
}
