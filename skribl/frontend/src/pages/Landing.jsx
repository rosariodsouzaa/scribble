import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, setUsername } from "../lib/identity.js";

export default function Landing() {
  const nav = useNavigate();
  const [name, setName] = useState(getUsername());

  function submit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setUsername(clean);
    nav("/lobby");
  }

  return (
    <div className="screen center">
      <div className="card hero">
        <h1 className="title">Scribble&nbsp;Royale</h1>
        <p className="subtitle">Draw it. Guess it. Rule the board.</p>
        <form onSubmit={submit} className="stack">
          <input
            className="input"
            placeholder="Pick a nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button className="btn primary lg" type="submit" disabled={!name.trim()}>
            Play
          </button>
        </form>
      </div>
    </div>
  );
}
