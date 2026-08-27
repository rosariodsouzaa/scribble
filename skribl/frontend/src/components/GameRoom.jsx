import { useState } from "react";
import { useGame } from "../state/useGame.js";
import Canvas from "./Canvas.jsx";
import Toolbar from "./Toolbar.jsx";
import Chat from "./Chat.jsx";
import Scoreboard from "./Scoreboard.jsx";
import Timer from "./Timer.jsx";
import WordHint from "./WordHint.jsx";
import RoundSummary from "./RoundSummary.jsx";

export default function GameRoom() {
  const { state, amDrawer } = useGame();
  // Brush lives here so both the Canvas and the Toolbar share it.
  const [brush, setBrush] = useState({ color: "#111827", size: 8 });

  return (
    <div className="gameroom">
      <header className="game-top">
        <div className="round-info">
          Round <strong>{state.round.number}</strong>/{state.round.maxRounds}
        </div>
        <WordHint />
        <Timer />
      </header>

      <div className="game-grid">
        <aside className="left">
          <Scoreboard />
        </aside>

        <main className="center">
          <div className="canvas-wrap">
            <Canvas brush={brush} />
            {state.state === "roundEnd" && <RoundSummary />}
          </div>
          {amDrawer && state.state === "playing" && (
            <Toolbar brush={brush} setBrush={setBrush} />
          )}
        </main>

        <aside className="right">
          <Chat />
        </aside>
      </div>
    </div>
  );
}
