import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { Trophy, Coins, Sparkles, ArrowRight } from "lucide-react";
import { useGame } from "../state/useGame.js";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import FireDragonLogo from "./FireDragonLogo.jsx";
import Button from "./Button.jsx";

export default function GameEnd() {
  const nav = useNavigate();
  const { state, actions } = useGame();
  const { addCoins, user } = useAuthWallet();

  const ge = state.gameEnd;
  const standings = ge?.standings || [...state.players].sort((a, b) => b.score - a.score);
  const winner = standings[0];
  const isWinner = winner && winner.id === state.myId;

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ffd700", "#f59e0b", "#dc2626", "#ffffff"],
      });
      if (isWinner) {
        addCoins(500); // 500 gold bonus for winning!
      } else {
        addCoins(150); // 150 participation gold!
      }
    } catch {}
  }, [isWinner]);

  function backToLobby() {
    actions.leave();
    nav("/dashboard");
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

        <div className="imperial-tag-sm">DYNASTY CORONATION</div>
        <h2 className="title sm">
          {winner ? `${winner.username} Claims the Dragon Throne!` : "Dynasty Clash Concluded"}
        </h2>
        <p className="subtitle sm">
          {isWinner
            ? "Victory is yours, Dragon Champion! +500 Gold added to your vault."
            : "The sacred scrolls have been drawn. Great battle, warrior!"}
        </p>

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
              <span className="pscore dragon-score-val">
                {p.score} <span className="pts">pts</span>
              </span>
            </li>
          ))}
        </ol>

        <Button variant="flame" size="lg" className="block" onClick={backToLobby}>
          <span>Return to Sanctuary ⛩️</span>
        </Button>
      </div>
    </div>
  );
}
