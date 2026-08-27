import { useState } from "react";
import { useGame } from "../state/useGame.js";
import Canvas from "./Canvas.jsx";
import Toolbar from "./Toolbar.jsx";
import Chat from "./Chat.jsx";
import Scoreboard from "./Scoreboard.jsx";
import Timer from "./Timer.jsx";
import WordHint from "./WordHint.jsx";
import RoundSummary from "./RoundSummary.jsx";

import FireDragonLogo from "./FireDragonLogo.jsx";

export default function GameRoom() {
  const { state, amDrawer } = useGame();
  // Brush lives here so both the Canvas and the Toolbar share it.
  const [brush, setBrush] = useState({ color: "#111827", size: 8 });

  return (
    <div className="gameroom dragon-gameroom">
      <header className="game-top dragon-game-top">
        <div className="dragon-round-pill">
          <FireDragonLogo size="xs" showFireRing={false} />
          <div className="round-info">
            ROUND <strong>{state.round.number}</strong> <span className="round-max">/ {state.round.maxRounds}</span>
          </div>
        </div>
        <WordHint />
        <Timer />
      </header>

      <div className="game-grid dragon-game-grid">
        <aside className="left dragon-panel">
          <Scoreboard />
        </aside>

        <main className="center">
          <div className="canvas-wrap dragon-canvas-wrap">
            {/* Imperial Corner Ornaments */}
            <div className="corner-ornament tl" />
            <div className="corner-ornament tr" />
            <div className="corner-ornament bl" />
            <div className="corner-ornament br" />

            <Canvas brush={brush} />
            {state.state === "roundEnd" && <RoundSummary />}
          </div>
          {amDrawer && state.state === "playing" && (
            <Toolbar brush={brush} setBrush={setBrush} />
          )}
        </main>

        <aside className="right dragon-panel">
          <Chat />
        </aside>
      </div>
    </div>
  );
}
