import { createContext, useContext, useEffect, useReducer } from "react";
import { useSocket } from "../socket/SocketContext.jsx";
import { S2C } from "../lib/events.js";
import { gameReducer, initialState } from "./gameReducer.js";

const GameContext = createContext(null);

// Subscribes to the low-frequency server events and funnels them into the reducer.
// Draw traffic is deliberately NOT handled here (see Canvas.jsx).
export function GameProvider({ children }) {
  const socket = useSocket();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (!socket) return undefined;

    const handlers = {
      connect: () => dispatch({ type: "CONNECTED", id: socket.id }),
      disconnect: () => dispatch({ type: "DISCONNECTED" }),
      [S2C.ERROR]: (payload) => dispatch({ type: "ERROR", payload }),
      [S2C.ROOM_STATE]: (room) => dispatch({ type: "ROOM_STATE", room }),
      [S2C.PLAYER_JOINED]: (d) => dispatch({ type: "PLAYER_JOINED", ...d }),
      [S2C.PLAYER_LEFT]: (d) => dispatch({ type: "PLAYER_LEFT", ...d }),
      [S2C.PLAYER_UPDATED]: (d) => dispatch({ type: "PLAYER_UPDATED", ...d }),
      [S2C.GAME_STARTED]: (d) => dispatch({ type: "GAME_STARTED", ...d }),
      [S2C.ROUND_START]: (d) => dispatch({ type: "ROUND_START", ...d }),
      [S2C.NEW_WORD]: (d) => dispatch({ type: "NEW_WORD", ...d }),
      [S2C.GUESS_RESULT]: (d) => dispatch({ type: "GUESS_RESULT", ...d }),
      [S2C.SCORE_UPDATE]: (d) => dispatch({ type: "SCORE_UPDATE", ...d }),
      [S2C.TIMER_TICK]: (d) => dispatch({ type: "TIMER_TICK", ...d }),
      [S2C.ROUND_END]: (d) => dispatch({ type: "ROUND_END", ...d }),
      [S2C.GAME_END]: (d) => dispatch({ type: "GAME_END", ...d }),
    };

    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);
    if (socket.connected) dispatch({ type: "CONNECTED", id: socket.id });

    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
    };
  }, [socket]);

  return <GameContext.Provider value={{ state, dispatch, socket }}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGameContext must be used within a GameProvider");
  return ctx;
}
