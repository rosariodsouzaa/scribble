import { useGame } from "../state/useGame.js";

const RANK_ICONS = ["🐉", "🐯", "🦅", "⚔️", "🔥"];

export default function Scoreboard() {
  const { state } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard dragon-scoreboard">
      <div className="scoreboard-title">
        <span>🏆 DRAGON RANKS</span>
      </div>
      <ul className="score-list">
        {sorted.map((p, idx) => {
          const isDrawer = p.id === state.round.drawerId;
          const isMe = p.id === state.myId;
          return (
            <li
              key={p.id}
              className={`score-row dragon-score-row ${isDrawer ? "drawing" : ""} ${idx === 0 ? "leader" : ""} ${isMe ? "is-me" : ""}`}
            >
              <span className="rank-badge">{RANK_ICONS[idx] || `${idx + 1}`}</span>
              <div className="pinfo">
                <span className="pname">
                  {p.username}
                  {isMe && <span className="you-pill">You</span>}
                </span>
                {isDrawer && (
                  <span className="drawer-indicator">
                    <span className="flame-spark">🔥</span> Drawing
                  </span>
                )}
              </div>
              <span className="pscore">{p.score} <span className="pts">pts</span></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
