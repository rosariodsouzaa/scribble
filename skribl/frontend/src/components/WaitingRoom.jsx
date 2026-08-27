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
      <div className="card waiting">
        <div className="waiting-head">
          <div>
            <p className="muted tiny">ROOM CODE</p>
            <div className="code-big" onClick={copyCode} title="Click to copy">
              {state.code}
            </div>
          </div>
          <button className="btn ghost" onClick={copyCode}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="muted">Share the code with friends. You need at least 2 players to start.</p>

        <PlayerList />

        <div className="row gap end">
          <button
            className={"btn " + (me?.isReady ? "" : "primary")}
            onClick={() => actions.ready(!me?.isReady)}
          >
            {me?.isReady ? "Not ready" : "I'm ready"}
          </button>
          {amHost && (
            <button
              className="btn primary"
              disabled={!allReady}
              onClick={actions.start}
              title={allReady ? "" : "Everyone must be ready (min 2 players)"}
            >
              Start game
            </button>
          )}
        </div>
        {amHost && !allReady && (
          <p className="muted tiny center-text">Waiting for everyone to ready up…</p>
        )}
      </div>
    </div>
  );
}
