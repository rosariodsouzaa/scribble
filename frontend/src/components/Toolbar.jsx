import { useState } from "react";
import { useGame } from "../state/useGame.js";
import { usePayment } from "../context/PaymentContext.jsx";
import { Sparkles, Eraser, Paintbrush, Palette, AlertTriangle, X, Check } from "lucide-react";

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
  const { equippedBrush, items } = usePayment();
  const activeSkin = items.find((i) => i.id === equippedBrush);

  const [isEraser, setIsEraser] = useState(false);
  const [prevColor, setPrevColor] = useState("#111827");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Toggle Eraser Mode
  const handleToggleEraser = () => {
    if (!isEraser) {
      setPrevColor(brush.color);
      setBrush((b) => ({ ...b, color: "#ffffff" }));
      setIsEraser(true);
    } else {
      setBrush((b) => ({ ...b, color: prevColor === "#ffffff" ? "#111827" : prevColor }));
      setIsEraser(false);
    }
  };

  const handleSelectColor = (hex) => {
    setIsEraser(false);
    setBrush((b) => ({ ...b, color: hex }));
  };

  const handleClearConfirm = () => {
    actions.clearCanvas();
    setShowClearConfirm(false);
  };

  return (
    <div className="toolbar dragon-toolbar">
      {/* Active Skin Label */}
      <div className="toolbar-label">
        <span>🐉 TOOL:</span>
        {activeSkin && activeSkin.id !== "brush_default" && (
          <span className="equipped-brush-tag" style={{ color: activeSkin.color }}>
            <Sparkles size={12} /> {activeSkin.name}
          </span>
        )}
      </div>

      {/* Mode Selectors (Brush vs Eraser) */}
      <div className="tool-mode-group">
        <button
          type="button"
          className={`tool-mode-btn ${!isEraser ? "active" : ""}`}
          onClick={() => {
            if (isEraser) {
              setBrush((b) => ({ ...b, color: prevColor === "#ffffff" ? "#111827" : prevColor }));
              setIsEraser(false);
            }
          }}
          title="Draw with Brush"
        >
          <Paintbrush size={15} />
          <span>Brush</span>
        </button>

        <button
          type="button"
          className={`tool-mode-btn ${isEraser ? "active eraser" : ""}`}
          onClick={handleToggleEraser}
          title="Erase Canvas Strokes"
        >
          <Eraser size={15} />
          <span>Eraser</span>
        </button>
      </div>

      {/* Preset Swatches */}
      <div className="swatches">
        {COLORS.map((c) => (
          <button
            key={c}
            className={"swatch" + (!isEraser && brush.color === c ? " sel" : "")}
            style={{ backgroundColor: c }}
            onClick={() => handleSelectColor(c)}
            aria-label={`Color ${c}`}
            title={`Color ${c}`}
          />
        ))}

        {/* Custom Color Wheel Picker */}
        <div className="custom-color-picker-wrap" title="Custom Hex Color">
          <input
            type="color"
            className="custom-color-input"
            value={brush.color === "#ffffff" ? "#111827" : brush.color}
            onChange={(e) => handleSelectColor(e.target.value)}
          />
          <Palette size={14} className="palette-icon" />
        </div>
      </div>

      {/* Brush Sizing */}
      <div className="sizes">
        {SIZES.map((s) => (
          <button
            key={s}
            className={"size-btn" + (brush.size === s ? " sel" : "")}
            onClick={() => setBrush((b) => ({ ...b, size: s }))}
            aria-label={`Brush size ${s}`}
            title={`Stroke Width ${s}px`}
          >
            <span
              className="size-dot"
              style={{ width: Math.min(22, Math.max(5, s)), height: Math.min(22, Math.max(5, s)) }}
            />
          </button>
        ))}
      </div>

      {/* Clear Canvas with Confirmation Guard */}
      <div className="clear-wrap">
        {!showClearConfirm ? (
          <button
            type="button"
            className="btn dragon-clear-btn"
            onClick={() => setShowClearConfirm(true)}
            title="Wipe drawing board"
          >
            🧹 Purge Canvas
          </button>
        ) : (
          <div className="clear-confirm-popover">
            <span className="clear-confirm-text">Purge all?</span>
            <button
              type="button"
              className="confirm-btn yes"
              onClick={handleClearConfirm}
              title="Confirm Canvas Wipe"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              className="confirm-btn no"
              onClick={() => setShowClearConfirm(false)}
              title="Cancel"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
