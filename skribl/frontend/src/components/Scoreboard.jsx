import { useGame } from "../state/useGame.js";

export default function Scoreboard() {
  const { state } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);

  return (
    <div className="scoreboard">
      <h3>Scores</h3>
      <ul>
        {sorted.map((p) => (
          <li
            key={p.id}
            className={"score-row" + (p.id === state.round.drawerId ? " drawing" : "")}
          >
            <span className="pname">
              {p.username}
              {p.id === state.myId ? " (you)" : ""}
            </span>
            {p.id === state.round.drawerId && (
              <span className="pencil" title="Drawing">✏️</span>
            )}
            <span className="pscore">{p.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
