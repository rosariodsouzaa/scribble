import { useGame } from "../state/useGame.js";

export default function WordHint() {
  const { state, amDrawer } = useGame();

  if (amDrawer && state.myWord) {
    return (
      <div className="wordhint dragon-wordhint drawer">
        <span className="scroll-tag">📜 Secret Scroll:</span>
        <strong className="secret-word">{state.myWord}</strong>
      </div>
    );
  }

  return (
    <div className="wordhint dragon-wordhint">
      <span className="masked-label">Riddle:</span>
      <span className="masked dragon-masked">{state.round.maskedWord || "…"}</span>
      {state.round.wordLength > 0 && (
        <span className="wl dragon-wl">{state.round.wordLength} Runes</span>
      )}
    </div>
  );
}
