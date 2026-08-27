import { useGame } from "../state/useGame.js";

const COLORS = [
  "#111827", // Obsidian Ink
  "#dc2626", // Dragon Crimson
  "#f97316", // Flame Orange
  "#f59e0b", // Imperial Gold
  "#10b981", // Imperial Jade
  "#06b6d4", // Celestial Aqua
  "#3b82f6", // Royal Azure
  "#8b5cf6", // Mystic Violet
  "#ec4899", // Lotus Blossom
  "#ffffff", // Rice Paper White
];
const SIZES = [3, 7, 14, 24];

export default function Toolbar({ brush, setBrush }) {
  const { actions } = useGame();
  return (
    <div className="toolbar dragon-toolbar">
      <div className="toolbar-label">🐉 BRUSH:</div>
      <div className="swatches">
        {COLORS.map((c) => (
          <button
            key={c}
            className={"swatch" + (brush.color === c ? " sel" : "")}
            style={{ backgroundColor: c }}
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
            <span className="size-dot" style={{ width: Math.min(22, Math.max(5, s)), height: Math.min(22, Math.max(5, s)) }} />
          </button>
        ))}
      </div>
      <button className="btn dragon-clear-btn" onClick={actions.clearCanvas}>
        🧹 Purge Canvas
      </button>
    </div>
  );
}
