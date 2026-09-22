import React from "react";

export default function DragonEmblem({
  size = "md",
  className = "",
  animated = true,
  glow = true,
}) {
  const pixelSizes = {
    xs: 26,
    sm: 36,
    md: 52,
    lg: 96,
    xl: 140,
  };

  const dim = typeof size === "number" ? size : pixelSizes[size] || 52;

  return (
    <div
      className={`dragon-emblem-wrap ${className}`}
      style={{
        width: dim,
        height: dim,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: animated ? "transform 0.3s ease" : "none",
        boxShadow: glow ? "0 0 30px 10px rgba(245, 158, 11, 0.5), 0 0 60px 20px rgba(220, 38, 38, 0.3)" : "none",
        borderRadius: "50%",
      }}
      onMouseEnter={(e) => {
        if (animated) e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        if (animated) e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src="/images/dragon-logo.png"
        alt="Dragon Emblem"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
