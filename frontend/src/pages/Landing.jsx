import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, setUsername } from "../lib/identity.js";
import FireDragonLogo from "../components/FireDragonLogo.jsx";

export default function Landing() {
  const nav = useNavigate();
  const [name, setName] = useState(getUsername());
  const [isFocused, setIsFocused] = useState(false);

  function submit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setUsername(clean);
    nav("/lobby");
  }

  return (
    <div className="screen center landing-screen">
      <div className="card hero dragon-card">
        {/* Imperial Corner Brackets */}
        <div className="imperial-bracket tl" />
        <div className="imperial-bracket tr" />
        <div className="imperial-bracket bl" />
        <div className="imperial-bracket br" />

        {/* Central Blazing Dragon Emblem */}
        <FireDragonLogo size="lg" showFireRing={true} />

        <div className="imperial-tag">✨ DRAGON DYNASTY EDITION ✨</div>
        <h1 className="title">Scribble&nbsp;Royale</h1>
        <p className="subtitle">
          Unleash your brush. Decipher the mythical riddles. Rule the dynasty.
        </p>

        <form onSubmit={submit} className="stack">
          <div className={`input-group ${isFocused ? "is-focused" : ""}`}>
            <span className="input-icon">👑</span>
            <input
              className="input dragon-input"
              placeholder="Enter your Dragon Nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={20}
              autoFocus
            />
          </div>
          <button className="btn primary lg flame-btn" type="submit" disabled={!name.trim()}>
            <span>Enter the Arena ⚡</span>
            <span className="btn-glow" />
          </button>
        </form>

        <div className="hero-features">
          <span className="feat-chip">🔥 Real-time Ink Sync</span>
          <span className="feat-chip">🐉 Multi-round Battles</span>
          <span className="feat-chip">🏆 Imperial Glory</span>
        </div>
      </div>
    </div>
  );
}
