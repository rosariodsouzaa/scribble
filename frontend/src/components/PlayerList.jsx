import { useGame } from "../state/useGame.js";

export default function PlayerList() {
  const { state } = useGame();
  return (
    <ul className="players dragon-players">
      {state.players.map((p) => (
        <li key={p.id} className={`player-row dragon-player-row ${p.id === state.myId ? "is-me" : ""}`}>
          <span className="avatar dragon-avatar" aria-hidden>
            {p.username[0]?.toUpperCase()}
          </span>
          <span className="pname">
            {p.username}
            {p.id === state.myId && <span className="you-pill">You</span>}
          </span>
          {p.isHost && <span className="tag imperial-tag-host">👑 Clan Lord</span>}
          <div
            className={`ready-gem ${p.isReady ? "ready-gem-active" : ""}`}
            title={p.isReady ? "Battle Stance Ready" : "Preparing"}
          >
            <span className="ready-gem-glow" />
          </div>
        </li>
      ))}
    </ul>
  );
}
