import React from "react";

export default function FireDragonLogo({
  size = "lg",
  className = "",
  interactive = true,
}) {
  // Map size prop to pixel dimensions
  const getDim = () => {
    switch (size) {
      case "xs": return 32;
      case "sm": return 50;
      case "md": return 110;
      case "lg": return 165;
      default: return 165;
    }
  };

  const dim = getDim();

  return (
    <div
      className={`simple-dragon-logo ${className}`}
      style={{
        width: dim,
        height: dim,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: interactive ? "transform 0.3s ease" : "none",
        cursor: interactive ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (interactive) e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        if (interactive) e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <img
        src="/images/dragon-logo.png"
        alt="Dragon Dynasty"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "50%",
          boxShadow: "0 0 30px 10px rgba(245, 158, 11, 0.5), 0 0 60px 20px rgba(220, 38, 38, 0.3)",
        }}
      />
    </div>
  );
}
