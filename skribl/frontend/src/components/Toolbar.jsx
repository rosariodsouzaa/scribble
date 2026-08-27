import { useGame } from "../state/useGame.js";

const COLORS = [
  "#111827", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
];
const SIZES = [4, 8, 16, 28];

export default function Toolbar({ brush, setBrush }) {
  const { actions } = useGame();
  return (
    <div className="toolbar">
      <div className="swatches">
        {COLORS.map((c) => (
          <button
            key={c}
            className={"swatch" + (brush.color === c ? " sel" : "")}
            style={{ background: c }}
            onClick={() => setBrush((b) => ({ ...b, color: c }))}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <div className="sizes">
        {SIZES.map((s) => (
          <button
            key={s}
            className={"size-btn" + (brush.size === s ? " sel" : "")}
            onClick={() => setBrush((b) => ({ ...b, size: s }))}
            aria-label={`Brush size ${s}`}
          >
            <span className="size-dot" style={{ width: s, height: s }} />
          </button>
        ))}
      </div>
      <button className="btn ghost" onClick={actions.clearCanvas}>
        Clear
      </button>
    </div>
  );
}
