import { useGame } from "../state/useGame.js";

const REASONS = {
  "all-guessed": "Everyone guessed it! 🎉",
  timeout: "Time's up! ⏰",
  "drawer-left": "The drawer left 🚪",
};

export default function RoundSummary() {
  const { state } = useGame();
  const re = state.roundEnd;
  if (!re) return null;

  const sorted = [...re.players].sort((a, b) => b.score - a.score);

  return (
    <div className="overlay">
      <div className="summary card">
        <h3>{REASONS[re.reason] || "Round over"}</h3>
        <p className="reveal">
          The word was <strong>{re.word}</strong>
        </p>
        <ul className="summary-scores">
          {sorted.map((p) => (
            <li key={p.id}>
              <span className="pname">{p.username}</span>
              <span className={"delta" + (p.roundDelta > 0 ? " pos" : "")}>
                {p.roundDelta > 0 ? `+${p.roundDelta}` : p.roundDelta || 0}
              </span>
              <span className="total">{p.score}</span>
            </li>
          ))}
        </ul>
        <p className="muted tiny">
          {re.nextIn > 0 ? "Next round starting…" : "Final results coming up…"}
        </p>
      </div>
    </div>
  );
}
