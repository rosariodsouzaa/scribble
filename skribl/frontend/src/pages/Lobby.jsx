import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getUsername } from "../lib/identity.js";
import { createRoom } from "../api/rooms.js";

export default function Lobby() {
  const nav = useNavigate();
  const username = getUsername();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!username) return <Navigate to="/" replace />;

  async function create() {
    setBusy(true);
    setErr("");
    try {
      const { code: newCode } = await createRoom();
      nav(`/room/${newCode}`);
    } catch {
      setErr("Couldn't create a room — is the server running?");
      setBusy(false);
    }
  }

  function join(e) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) {
      setErr("Enter a valid room code.");
      return;
    }
    nav(`/room/${clean}`);
  }

  return (
    <div className="screen center">
      <div className="card lobby">
        <div className="lobby-head">
          <h1 className="title sm">Scribble Royale</h1>
          <span className="muted">Hi, {username} 👋</span>
        </div>

        <button className="btn primary lg block" onClick={create} disabled={busy}>
          {busy ? "Creating…" : "Create a room"}
        </button>

        <div className="divider"><span>or</span></div>

        <form onSubmit={join} className="join-row">
          <input
            className="input code-input"
            placeholder="ENTER CODE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn block" type="submit">Join</button>
        </form>

        {err && <p className="error-text">{err}</p>}
      </div>
    </div>
  );
}
