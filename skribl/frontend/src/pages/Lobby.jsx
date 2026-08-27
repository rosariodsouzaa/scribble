import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { getUsername } from "../lib/identity.js";
import { createRoom } from "../api/rooms.js";
import FireDragonLogo from "../components/FireDragonLogo.jsx";

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
      setErr("Enter a valid 4+ letter chamber code.");
      return;
    }
    nav(`/room/${clean}`);
  }

  return (
    <div className="screen center">
      <div className="card lobby dragon-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        <div className="lobby-head">
          <div className="row gap">
            <FireDragonLogo size="sm" showFireRing={false} />
            <div>
              <span className="imperial-tag-sm">DRAGON SANCTUARY</span>
              <h1 className="title sm">Scribble Royale</h1>
            </div>
          </div>
          <div className="user-pill">
            <span className="user-avatar-mini">🔥</span>
            <span className="user-name">{username}</span>
          </div>
        </div>

        <p className="subtitle sm">Create a private chamber or join your clan with a room code.</p>

        <button className="btn primary lg block flame-btn" onClick={create} disabled={busy}>
          <span>{busy ? "Summoning Chamber…" : "⚡ Create Dragon Chamber"}</span>
          <span className="btn-glow" />
        </button>

        <div className="divider"><span>OR ENTER CLAN CHAMBER</span></div>

        <form onSubmit={join} className="join-row">
          <input
            className="input code-input dragon-input"
            placeholder="CHAMBER CODE (e.g. AB12)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn dragon-secondary-btn" type="submit" disabled={code.trim().length < 4}>
            Enter ⛩️
          </button>
        </form>

        {err && <p className="error-text dragon-error">{err}</p>}
      </div>
    </div>
  );
}
