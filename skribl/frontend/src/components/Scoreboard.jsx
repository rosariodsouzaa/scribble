import { useGame } from "../state/useGame.js";

const RANK_BADGES = ["🥇", "🥈", "🥉", "⚔️", "🔥", "🛡️"];

export default function Scoreboard() {
  const { state } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard dragon-scoreboard">
      <div className="scoreboard-title">
        <span>🏆 DRAGON RANKS</span>
        <span className="scoreboard-count">{sorted.length} Warriors</span>
      </div>
      <ul className="score-list">
        {sorted.map((p, idx) => {
          const isDrawer = p.id === state.round.drawerId;
          const isMe = p.id === state.myId;
          const isLeader = idx === 0 && p.score > 0;
          return (
            <li
              key={p.id}
              className={`score-row dragon-score-row ${isDrawer ? "drawing" : ""} ${isLeader ? "leader" : ""} ${isMe ? "is-me" : ""}`}
            >
              <span className="rank-badge" title={`Rank #${idx + 1}`}>
                {RANK_BADGES[idx] || `#${idx + 1}`}
              </span>
              <div className="pinfo">
                <span className="pname">
                  {p.username}
                  {isMe && <span className="you-pill">You</span>}
                  {isLeader && <span className="crown-icon" title="Current Leader">👑</span>}
                </span>
                {isDrawer && (
                  <span className="drawer-indicator">
                    <span className="flame-spark">🔥</span> Drawing Now…
                  </span>
                )}
              </div>
              <span className="pscore">
                {p.score} <span className="pts">pts</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
