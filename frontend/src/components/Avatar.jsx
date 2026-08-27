import React from "react";

export default function Avatar({ name = "Warrior", initial, size = 36, color = "#f59e0b" }) {
  const displayInitial = initial || name[0]?.toUpperCase() || "🐉";

  return (
    <div
      className="dragon-avatar-badge"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.round(size * 0.42)),
        background: `linear-gradient(135deg, ${color} 0%, #dc2626 100%)`,
      }}
      title={name}
    >
      <span>{displayInitial}</span>
    </div>
  );
}
