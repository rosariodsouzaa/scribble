import React from "react";

export default function Button({
  children,
  variant = "primary", // primary | flame | emerald | secondary | outline
  size = "md", // sm | md | lg
  icon,
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
      {(variant === "primary" || variant === "flame") && <span className="btn-glow" />}
    </button>
  );
}
