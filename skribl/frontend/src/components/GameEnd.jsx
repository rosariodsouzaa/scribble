import { useNavigate } from "react-router-dom";
import { useGame } from "../state/useGame.js";

export default function GameEnd() {
  const nav = useNavigate();
  const { state, actions } = useGame();
  const ge = state.gameEnd;
  const standings = ge?.standings || [...state.players].sort((a, b) => b.score - a.score);
  const winner = standings[0];

  function backToLobby() {
    actions.leave();
    nav("/lobby");
  }

  return (
    <div className="screen center">
      <div className="card gameend">
        <div className="trophy" aria-hidden>🏆</div>
        <h2>{winner ? `${winner.username} wins!` : "Game over"}</h2>
        <ol className="standings">
          {standings.map((p, i) => (
            <li key={p.id} className={i === 0 ? "first" : ""}>
              <span className="rank">{i + 1}</span>
              <span className="pname">
                {p.username}
                {p.id === state.myId ? " (you)" : ""}
              </span>
              <span className="pscore">{p.score}</span>
            </li>
          ))}
        </ol>
        <button className="btn primary lg" onClick={backToLobby}>
          Back to lobby
        </button>
      </div>
    </div>
  );
}
