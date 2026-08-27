import { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useGame } from "../state/useGame.js";
import { getUsername, getClientId } from "../lib/identity.js";
import WaitingRoom from "../components/WaitingRoom.jsx";
import GameRoom from "../components/GameRoom.jsx";
import GameEnd from "../components/GameEnd.jsx";

import DragonLoader from "../components/DragonLoader.jsx";

export default function Room() {
  const { code } = useParams();
  const nav = useNavigate();
  const { state, actions, socket } = useGame();
  const username = getUsername();
  const upperCode = (code || "").toUpperCase();

  useEffect(() => {
    if (!username) return undefined;
    const clientId = getClientId();
    const join = () => actions.join(upperCode, username, clientId);
    join(); // join now (buffered if the socket is still connecting)
    socket.on("connect", join); // and re-join after any reconnect
    return () => {
      socket.off("connect", join);
      actions.leave();
    };
    // actions & socket are stable for the socket's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upperCode, username]);

  if (!username) return <Navigate to="/" replace />;

  const joined = state.code === upperCode;
  const fatal =
    state.error && !joined && ["room-not-found", "game-in-progress"].includes(state.error.code);

  if (fatal) {
    return (
      <div className="screen center">
        <div className="card dragon-card text-center">
          <div className="dragon-seal-icon">⚠️</div>
          <h2 className="title sm">Chamber {upperCode} Sealed</h2>
          <p className="muted">{state.error.message}</p>
          <button className="btn primary block" onClick={() => nav("/lobby")}>
            Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="screen center">
        <div className="card dragon-card dragon-loading-card">
          <DragonLoader message={`Entering Dragon Chamber ${upperCode}…`} />
        </div>
      </div>
    );
  }

  if (state.state === "gameEnd") return <GameEnd />;
  if (state.state === "playing" || state.state === "roundEnd") return <GameRoom />;
  return <WaitingRoom />;
}
