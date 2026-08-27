import { useEffect, useRef, useState } from "react";
import { useGame } from "../state/useGame.js";

export default function Chat() {
  const { state, actions, amDrawer } = useGame();
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.chat.length]);

  const disabled = amDrawer || state.state !== "playing" || state.guessedCorrect;

  function submit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    actions.guess(t);
    setText("");
  }

  const placeholder = amDrawer
    ? "You're drawing…"
    : state.guessedCorrect
    ? "You guessed it! 🎉"
    : "Type your guess…";

  return (
    <div className="chat dragon-chat">
      <div className="chat-header">
        <span>💬 IMPERIAL CHAT & GUESSES</span>
      </div>
      <div className="chat-list dragon-chat-list" ref={listRef}>
        {state.chat.length === 0 && (
          <div className="chat-empty-hint">Type your guesses here to score points! 🐉</div>
        )}
        {state.chat.map((m) => (
          <div key={m.id} className={"chat-msg dragon-chat-msg " + m.type}>
            {m.type === "guess" && <span className="cu">{m.username}: </span>}
            {m.type === "correct" && <span className="dragon-correct-badge">🔥 </span>}
            <span className="ct">{m.text}</span>
          </div>
        ))}
      </div>
      <form className="chat-input dragon-chat-input" onSubmit={submit}>
        <input
          className="input dragon-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={60}
        />
        <button className="btn primary dragon-send-btn" type="submit" disabled={disabled}>
          Send 🏹
        </button>
      </form>
    </div>
  );
}
