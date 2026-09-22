import React from "react";

/**
 * DragonEmblem
 * Premium Vector Imperial Dragon & Calligraphy Brush Medallion Emblem.
 * Renders crisply across all resolutions and screen scales.
 */
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
      className={`dragon-emblem-wrap size-${typeof size === "string" ? size : "custom"} ${
        animated ? "is-animated" : ""
      } ${glow ? "has-glow" : ""} ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        viewBox="0 0 120 120"
        width={dim}
        height={dim}
        className="dragon-emblem-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Imperial Gold */}
          <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Dragon Blazing Fire */}
          <linearGradient id="emblemFlame" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="35%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>

          {/* Deep Obsidian Lacquer Background */}
          <radialGradient id="emblemCoreBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c1208" />
            <stop offset="70%" stopColor="#140804" />
            <stop offset="100%" stopColor="#080302" />
          </radialGradient>

          {/* Brush Handle Gradient */}
          <linearGradient id="brushWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0a00" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="emblemGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Solar Dragon Tooth Rays */}
        <g stroke="url(#emblemGold)" strokeWidth="1.2" opacity="0.85">
          <line x1="60" y1="2" x2="60" y2="7" />
          <line x1="60" y1="113" x2="60" y2="118" />
          <line x1="2" y1="60" x2="7" y2="60" />
          <line x1="113" y1="60" x2="118" y2="60" />
          <line x1="19" y1="19" x2="23" y2="23" />
          <line x1="97" y1="97" x2="101" y2="101" />
          <line x1="19" y1="101" x2="23" y2="97" />
          <line x1="97" y1="23" x2="101" y2="19" />
        </g>

        {/* Medallion Base Rim */}
        <circle cx="60" cy="60" r="54" fill="url(#emblemCoreBg)" stroke="url(#emblemGold)" strokeWidth="3" />
        <circle cx="60" cy="60" r="48" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="60" cy="60" r="45" stroke="rgba(251, 191, 36, 0.25)" strokeWidth="0.75" />

        {/* Crossing Imperial Calligraphy Brush Behind Dragon */}
        <g id="calligraphyBrush" opacity="0.95">
          {/* Brush Shaft */}
          <path d="M22 98 L98 22" stroke="url(#brushWood)" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 98 L98 22" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" strokeLinecap="round" />
          {/* Gold Ferrule Ring */}
          <circle cx="34" cy="86" r="3.5" fill="url(#emblemGold)" />
          {/* Ink Brush Tip */}
          <path
            d="M18 102 C15 106, 14 109, 12 112 C18 109, 21 106, 24 100 Z"
            fill="#f59e0b"
          />
        </g>

        {/* Dragon Flame Breath / Aura Waves */}
        <path
          d="M74 65 C84 62, 92 68, 102 64 C96 72, 88 74, 78 72 Z"
          fill="url(#emblemFlame)"
          opacity="0.8"
        />

        {/* Imperial Dragon Crest / Head Silhouette */}
        <path
          d="M34 76 
             C32 64, 38 48, 50 40 
             C46 30, 40 22, 28 16 
             C42 19, 52 28, 56 36 
             C64 30, 76 28, 88 34 
             C84 38, 78 40, 74 40 
             C86 42, 94 48, 98 58 
             C100 64, 96 70, 88 74 
             C76 82, 62 86, 50 84 
             C40 82, 36 83, 34 76 Z"
          fill="url(#emblemFlame)"
          filter="url(#emblemGlowFilter)"
        />

        {/* Primary Golden Antler Horns */}
        <path
          d="M56 36 C52 28, 42 19, 28 16 C38 22, 44 30, 48 40"
          stroke="url(#emblemGold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M64 30 C74 24, 84 21, 96 15 C88 23, 84 31, 80 37"
          stroke="url(#emblemGold)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Secondary Horn Spikes */}
        <path d="M42 24 Q48 22 52 27" stroke="url(#emblemGold)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M80 23 Q86 21 88 26" stroke="url(#emblemGold)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Dragon Fierce Eye (Amber Glow + White Iris + Black Pupil) */}
        <ellipse cx="68" cy="48" rx="4" ry="3" fill="#fef08a" />
        <circle cx="68" cy="48" r="2" fill="#ffffff" />
        <circle cx="68.5" cy="48" r="1" fill="#450a0a" />
        <path d="M63 45 Q69 43 74 47" stroke="url(#emblemGold)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Dragon Snout, Sharp Fangs & Whiskers */}
        <path
          d="M76 54 L88 56 L76 61"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Fangs */}
        <polygon points="78,55 80,59 82,55" fill="#ffffff" />
        <polygon points="83,56 85,60 87,56" fill="#ffffff" />

        {/* Flowing Whiskers */}
        <path
          d="M72 58 C80 62, 88 60, 94 65 C90 68, 82 66, 74 62"
          stroke="url(#emblemGold)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M68 64 C76 72, 85 73, 92 78"
          stroke="url(#emblemGold)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Dragon Scales / Rib Highlights */}
        <path d="M46 54 Q54 58 60 52" stroke="url(#emblemGold)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
        <path d="M42 63 Q50 67 58 61" stroke="url(#emblemGold)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
        <path d="M40 72 Q48 76 56 70" stroke="url(#emblemGold)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />

        {/* Center Golden Pearl / Fire Orb Accent */}
        <circle cx="60" cy="94" r="5" fill="url(#emblemGold)" stroke="#ffffff" strokeWidth="0.8" />
        <circle cx="58.5" cy="92.5" r="1.5" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  );
}
