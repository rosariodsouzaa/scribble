import { useState } from "react";
import { useGame } from "../state/useGame.js";
import PlayerList from "./PlayerList.jsx";

export default function WaitingRoom() {
  const { state, actions, me, amHost } = useGame();
  const [copied, setCopied] = useState(false);
  const allReady = state.players.length >= 2 && state.players.every((p) => p.isReady);

  function copyCode() {
    navigator.clipboard?.writeText(state.code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  return (
    <div className="screen center">
      <div className="card waiting dragon-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        <div className="imperial-tag-sm text-center">🐉 DRAGON CHAMBER 🐉</div>
        <div className="waiting-head">
          <div>
            <p className="muted tiny uppercase">CHAMBER CODE</p>
            <div className="code-big" onClick={copyCode} title="Click to copy secret seal">
              {state.code}
            </div>
          </div>
          <button className={`btn dragon-copy-btn ${copied ? "copied" : ""}`} onClick={copyCode}>
            {copied ? "✓ Copied Seal" : "📋 Copy Seal"}
          </button>
        </div>

        <p className="muted small">
          Gather your clan. At least <strong>2 dragon warriors</strong> must prepare before the battle ignites.
        </p>

        <PlayerList />

        <div className="row gap end waiting-actions">
          <button
            className={`btn ${me?.isReady ? "dragon-ready-btn-active" : "dragon-ready-btn"}`}
            onClick={() => actions.ready(!me?.isReady)}
          >
            {me?.isReady ? "⚔️ Stance: Ready" : "⚡ Ready Up"}
          </button>
          {amHost && (
            <button
              className="btn primary flame-btn"
              disabled={!allReady}
              onClick={actions.start}
              title={allReady ? "" : "All warriors must be ready (minimum 2 warriors)"}
            >
              <span>🔥 Ignite Game</span>
              <span className="btn-glow" />
            </button>
          )}
        </div>
        {amHost && !allReady && (
          <p className="muted tiny center-text waiting-subnote">
            ⏳ Waiting for all clan members to take their stance…
          </p>
        )}
      </div>
    </div>
  );
}
