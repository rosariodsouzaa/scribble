import { useGame } from "../state/useGame.js";

const REASONS = {
  "all-guessed": "All Warriors Deciphered the Riddle! 🐉🔥",
  timeout: "The Hourglass Has Run Out! ⏳",
  "drawer-left": "The Dragon Brush Was Abandoned 🚪",
};

export default function RoundSummary() {
  const { state } = useGame();
  const re = state.roundEnd;
  if (!re) return null;

  const sorted = [...re.players].sort((a, b) => b.score - a.score);

  return (
    <div className="overlay dragon-overlay">
      <div className="summary card dragon-card dragon-summary-card">
        <div className="dragon-seal-mini">📜 ROUND DECREE</div>
        <h3 className="summary-title">{REASONS[re.reason] || "Round Concluded"}</h3>
        <div className="reveal dragon-reveal">
          The secret rune was <strong className="dragon-word-highlight">{re.word}</strong>
        </div>
        <ul className="summary-scores dragon-summary-scores">
          {sorted.map((p) => (
            <li key={p.id} className="summary-score-row">
              <span className="pname">{p.username}</span>
              <span className={"delta" + (p.roundDelta > 0 ? " pos" : "")}>
                {p.roundDelta > 0 ? `+${p.roundDelta} pts` : `${p.roundDelta || 0} pts`}
              </span>
              <span className="total">{p.score}</span>
            </li>
          ))}
        </ul>
        <div className="summary-footer">
          <span className="pulsing-flame">🔥</span>
          <p className="muted tiny">
            {re.nextIn > 0 ? "Next clash commences shortly…" : "Final dragon coronation coming up…"}
          </p>
        </div>
      </div>
    </div>
  );
}
