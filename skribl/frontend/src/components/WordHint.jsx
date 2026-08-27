import { useGame } from "../state/useGame.js";

export default function WordHint() {
  const { state, amDrawer } = useGame();

  if (amDrawer && state.myWord) {
    return (
      <div className="wordhint drawer">
        Draw: <strong>{state.myWord}</strong>
      </div>
    );
  }

  return (
    <div className="wordhint">
      <span className="masked">{state.round.maskedWord || "…"}</span>
      {state.round.wordLength > 0 && (
        <span className="wl">{state.round.wordLength} letters</span>
      )}
    </div>
  );
}
