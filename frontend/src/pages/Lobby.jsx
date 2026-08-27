import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, PlusCircle, ArrowRight, Flame, Shield, Sparkles, BookOpen } from "lucide-react";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";
import { createRoom } from "../api/rooms.js";
import FireDragonLogo from "../components/FireDragonLogo.jsx";
import Button from "../components/Button.jsx";

const THEME_OPTIONS = [
  { id: "all", label: "🌍 Universal Pack" },
  { id: "dynasty", label: "🐉 Dragon Dynasty" },
  { id: "tech", label: "💻 Tech & Cyber" },
  { id: "anime", label: "⚡ Anime & Gaming" },
  { id: "custom", label: "✍️ Custom List" },
];

export default function Lobby() {
  const navigate = useNavigate();
  const { user, setWarriorName } = useAuthWallet();
  const [code, setCode] = useState("");
  const [nameInput, setNameInput] = useState(user.name || "Warrior");
  const [rounds, setRounds] = useState(3);
  const [duration, setDuration] = useState(60);
  const [theme, setTheme] = useState("all");
  const [customWordsInput, setCustomWordsInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async () => {
    setBusy(true);
    setErr("");
    try {
      setWarriorName(nameInput);
      const parsedCustomWords =
        theme === "custom"
          ? customWordsInput
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean)
          : null;

      const { code: newCode } = await createRoom({
        maxRounds: rounds,
        roundDurationSec: duration,
        theme,
        customWords: parsedCustomWords,
      });
      navigate(`/room/${newCode}`);
    } catch {
      setErr("Couldn't summon chamber — is the backend server running?");
      setBusy(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) {
      setErr("Enter a valid 4-character chamber code.");
      return;
    }
    setWarriorName(nameInput);
    navigate(`/room/${clean}`);
  };

  return (
    <div className="screen center lobby-screen">
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
              <span className="imperial-tag-sm">CLAN SANCTUARY</span>
              <h1 className="title sm">Chamber Summoner</h1>
            </div>
          </div>

          <div className="user-pill">
            <span className="user-avatar-mini">🔥</span>
            <input
              className="lobby-name-edit"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={18}
              title="Edit your warrior nickname"
            />
          </div>
        </div>

        <p className="subtitle sm">Summon a private battle chamber or enter an existing clan seal.</p>

        {/* Chamber Settings */}
        <div className="lobby-settings-box">
          <div className="setting-group">
            <label className="setting-label">ROUNDS PER CLASH</label>
            <div className="pill-selector">
              {[3, 5, 8].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`setting-pill ${rounds === r ? "active" : ""}`}
                  onClick={() => setRounds(r)}
                >
                  {r} Rounds
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label className="setting-label">DRAW TIME</label>
            <div className="pill-selector">
              {[45, 60, 80].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`setting-pill ${duration === d ? "active" : ""}`}
                  onClick={() => setDuration(d)}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group column-group">
            <label className="setting-label">SECRET WORD THEME</label>
            <div className="pill-selector wrap">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`setting-pill ${theme === t.id ? "active" : ""}`}
                  onClick={() => setTheme(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {theme === "custom" && (
              <div className="custom-words-input-wrap">
                <input
                  className="input dragon-input"
                  placeholder="Type words separated by commas (e.g. goku, matrix, hoverboard)"
                  value={customWordsInput}
                  onChange={(e) => setCustomWordsInput(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <Button
          variant="flame"
          size="lg"
          className="block"
          onClick={handleCreate}
          disabled={busy}
          icon={<Flame size={18} />}
        >
          {busy ? "Summoning Chamber…" : "⚡ Summon Dragon Chamber"}
        </Button>

        <div className="divider">
          <span>OR ENTER CLAN SEAL</span>
        </div>

        <form onSubmit={handleJoin} className="join-row">
          <input
            className="input code-input dragon-input"
            placeholder="CHAMBER CODE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <Button variant="secondary" size="md" type="submit" disabled={code.trim().length < 4}>
            Enter ⛩️
          </Button>
        </form>

        {err && <p className="error-text dragon-error">{err}</p>}
      </div>
    </div>
  );
}
