import { useGame } from "../state/useGame.js";

export default function PlayerList() {
  const { state } = useGame();
  return (
    <ul className="players">
      {state.players.map((p) => (
        <li key={p.id} className="player-row">
          <span className="avatar" aria-hidden>
            {p.username[0]?.toUpperCase()}
          </span>
          <span className="pname">
            {p.username}
            {p.id === state.myId ? " (you)" : ""}
          </span>
          {p.isHost && <span className="tag">host</span>}
          <span
            className={"ready-dot " + (p.isReady ? "on" : "")}
            title={p.isReady ? "Ready" : "Not ready"}
          />
        </li>
      ))}
    </ul>
  );
}
