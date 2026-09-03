import { useMemo } from "react";
import { useGameContext } from "./GameProvider.jsx";
import { GameActionDispatcher } from "../services/game/index.js";

/**
 * useGame Hook
 * Provides game state, player roles, and OOP GameActionDispatcher methods.
 */
export function useGame() {
  const { state, dispatch, socket } = useGameContext();

  const dispatcher = useMemo(() => new GameActionDispatcher(socket), [socket]);

  const actions = useMemo(
    () => ({
      join: (code, username, clientId) => {
        dispatch({ type: "CLEAR_ERROR" });
        dispatcher.join(code, username, clientId);
      },
      leave: () => {
        dispatcher.leave();
        dispatch({ type: "RESET" });
      },
      reset: () => dispatch({ type: "RESET" }),
      clearError: () => dispatch({ type: "CLEAR_ERROR" }),
      ready: (ready) => dispatcher.setReady(ready),
      start: () => dispatcher.startGame(),
      playAgain: () => dispatcher.playAgain(),
      guess: (text) => dispatcher.submitGuess(text),
      drawStart: (p) => dispatcher.drawStart(p),
      drawMove: (points) => dispatcher.drawMove(points),
      drawEnd: () => dispatcher.drawEnd(),
      clearCanvas: () => dispatcher.clearCanvas(),
    }),
    [dispatcher, dispatch]
  );

  const me = state.players.find((p) => p.id === state.myId) || null;
  const amDrawer = state.round.drawerId != null && state.round.drawerId === state.myId;
  const amHost = state.hostId != null && state.hostId === state.myId;

  return { state, actions, me, amDrawer, amHost, socket, dispatcher };
}
