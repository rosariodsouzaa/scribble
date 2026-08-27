import { useGame } from "../state/useGame.js";

export default function Timer() {
  const { state } = useGame();
  const total = state.settings.roundDurationSec || 60;
  const r = state.remaining;
  const pct = Math.max(0, Math.min(100, (r / total) * 100));
  const low = r <= 10;

  return (
    <div className="timer">
      <div className={"timer-num" + (low ? " low" : "")}>{r}s</div>
      <div className="timer-bar">
        <div className={"timer-fill" + (low ? " low" : "")} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
