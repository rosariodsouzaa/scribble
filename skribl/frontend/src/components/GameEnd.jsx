import { useNavigate } from "react-router-dom";
import { useGame } from "../state/useGame.js";
import FireDragonLogo from "./FireDragonLogo.jsx";

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

  const RANK_TITLES = ["🐉 DRAGON EMPEROR", "🐯 TIGER CHAMPION", "🦅 PHOENIX MASTER", "⚔️ DRAGON WARRIOR"];

  return (
    <div className="screen center">
      <div className="card gameend dragon-card dragon-gameend-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        <div className="dragon-trophy-wrap">
          <FireDragonLogo size="md" showFireRing={true} />
        </div>

        <div className="imperial-tag-sm">DYNASTY FINALE</div>
        <h2 className="title sm">
          {winner ? `${winner.username} Claims the Throne!` : "Dynasty Clash Concluded"}
        </h2>
        <p className="subtitle sm">The sacred scrolls have been drawn. Here stand the immortal warriors:</p>

        <ol className="standings dragon-standings">
          {standings.map((p, i) => (
            <li key={p.id} className={`standing-row ${i === 0 ? "first dragon-champion" : ""}`}>
              <span className="rank dragon-rank">{i === 0 ? "👑" : i + 1}</span>
              <div className="standing-pinfo">
                <span className="pname">
                  {p.username}
                  {p.id === state.myId && <span className="you-pill">You</span>}
                </span>
                <span className="standing-title">{RANK_TITLES[i] || "⚔️ WARRIOR"}</span>
              </div>
              <span className="pscore dragon-score-val">{p.score} <span className="pts">pts</span></span>
            </li>
          ))}
        </ol>

        <button className="btn primary lg flame-btn block" onClick={backToLobby}>
          <span>Return to Sanctuary ⛩️</span>
          <span className="btn-glow" />
        </button>
      </div>
    </div>
  );
}
