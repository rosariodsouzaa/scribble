import { useMemo } from "react";
import FlyingShadowDragon from "./FlyingShadowDragon.jsx";

export default function DragonBackground() {
  // Generate stable random particles for floating ember sparks
  const embers = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: `${(i * 3.1 + Math.sin(i) * 5) % 100}%`,
      size: `${Math.floor(2 + (i % 5) * 1.5)}px`,
      duration: `${6 + (i % 7) * 1.5}s`,
      delay: `${-(i % 8) * 1.2}s`,
      opacity: 0.2 + (i % 6) * 0.12,
    }));
  }, []);

  return (
    <div className="dragon-bg-container" aria-hidden="true">
      {/* Dynamic ambient radial dragon flares */}
      <div className="dragon-aurora dragon-aurora-top" />
      <div className="dragon-aurora dragon-aurora-bottom" />
      <div className="dragon-aurora dragon-aurora-center" />

      {/* Majestic Flying Shadow Dragons Soaring Across Sky */}
      <FlyingShadowDragon />

      {/* Traditional Oriental Cloud (Xiangyun) Motifs */}
      <div className="oriental-cloud cloud-1">
        <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 50 C10 50 0 40 0 30 C0 20 15 15 25 22 C30 10 50 10 60 20 C70 5 95 10 100 25 C112 25 120 35 120 45 C120 50 110 50 100 50 Z"
            fill="currentColor"
          />
          <path
            d="M30 45 C25 40 25 35 32 30 C40 25 50 35 45 42"
            stroke="rgba(255,215,0,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="oriental-cloud cloud-2">
        <svg viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M25 60 C12 60 0 48 0 36 C0 24 18 18 30 26 C36 12 60 12 72 24 C84 6 114 12 120 30 C134 30 144 42 144 54 C144 60 132 60 120 60 Z"
            fill="currentColor"
          />
          <path
            d="M40 50 C32 44 34 36 44 32 C56 28 66 40 58 48"
            stroke="rgba(255,165,0,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="oriental-cloud cloud-3">
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 40 C8 40 0 32 0 24 C0 16 12 12 20 17 C24 8 40 8 48 16 C56 4 76 8 80 20 C90 20 96 28 96 36 C96 40 88 40 80 40 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Floating Ember Sparks */}
      <div className="ember-layer">
        {embers.map((ember) => (
          <span
            key={ember.id}
            className="ember-particle"
            style={{
              left: ember.left,
              width: ember.size,
              height: ember.size,
              animationDuration: ember.duration,
              animationDelay: ember.delay,
              opacity: ember.opacity,
            }}
          />
        ))}
      </div>

      {/* Subtle dragon scale geometry overlay */}
      <div className="dragon-scale-mesh" />
    </div>
  );
}
