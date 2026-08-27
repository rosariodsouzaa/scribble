import { useMemo } from "react";

/**
 * FlyingShadowDragon
 * Renders majestic mythical shadow dragons soaring across the background sky
 * Features:
 * - Serpentine body with articulated wing flapping
 * - Glowing piercing dragon eyes & fire crest
 * - Trailing smoke ember wake
 * - Multi-depth parallax (Majestic Close Dragon & Distant High-Altitude Dragons)
 */
export default function FlyingShadowDragon() {
  return (
    <div className="flying-dragons-container" aria-hidden="true">
      {/* 1. Primary Majestic Shadow Dragon (Grand Sky Sovereign) */}
      <div className="shadow-dragon-track dragon-track-primary">
        <div className="shadow-dragon-flight">
          {/* Dragon Silhouette SVG with Articulated Wings & Glowing Eye */}
          <svg
            className="shadow-dragon-svg"
            viewBox="0 0 320 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="dragonShadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#080302" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#1a0805" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#3d1209" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="dragonWingGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0c0403" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#250b06" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#5c190a" stopOpacity="0.6" />
              </linearGradient>
              <radialGradient id="dragonEyeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#ffd700" />
                <stop offset="70%" stopColor="#ff4500" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="shadowSmokeBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>

            {/* Back Wing (Flaps in counter-phase) */}
            <g className="dragon-wing back-wing">
              <path
                d="M130 65 Q115 15 80 5 Q105 25 100 45 Q120 35 125 55 Q132 48 135 68 Z"
                fill="url(#dragonWingGrad)"
                opacity="0.8"
              />
              <path
                d="M130 65 L80 5 M130 65 L100 45 M130 65 L125 55"
                stroke="rgba(255, 100, 0, 0.25)"
                strokeWidth="1.2"
              />
            </g>

            {/* Sinuous Dragon Body & Neck */}
            <g className="dragon-body-group" filter="url(#shadowSmokeBlur)">
              {/* Dragon Whisker / Flowing Beard */}
              <path
                className="dragon-whisker"
                d="M285 76 Q275 88 260 85 Q245 82 235 90"
                stroke="rgba(255, 140, 0, 0.45)"
                strokeWidth="1.5"
                fill="none"
              />
              
              {/* Head & Horns */}
              {/* Upper & Lower Horns */}
              <path
                d="M272 58 Q255 42 240 38 Q252 50 262 58 Z"
                fill="#0a0302"
              />
              <path
                d="M268 55 Q250 32 225 25 Q242 42 258 54 Z"
                fill="url(#dragonShadowGrad)"
              />
              
              {/* Snout & Jaws */}
              <path
                d="M260 60 Q278 62 295 68 Q288 74 275 76 Q285 82 280 86 Q268 82 260 76 Q245 78 230 72 Z"
                fill="url(#dragonShadowGrad)"
              />

              {/* Serpentine Torso & Spines */}
              <path
                className="dragon-spine"
                d="M260 70 Q235 62 210 75 Q185 88 160 72 Q135 56 110 75 Q85 92 60 75 Q40 60 20 70 Q5 78 0 74 Q15 65 35 58 Q60 52 85 68 Q110 82 135 65 Q160 48 185 65 Q210 80 235 65 Q248 58 260 70 Z"
                fill="url(#dragonShadowGrad)"
              />

              {/* Dorsal Flame Spines */}
              <path
                d="M230 63 L225 54 L220 65 L200 68 L195 56 L190 70 L165 60 L160 48 L155 64 L130 60 L125 50 L120 66 L95 68 L90 58 L85 72 Z"
                fill="rgba(255, 69, 0, 0.35)"
              />

              {/* Imperial Claws / Talons */}
              <path
                d="M205 78 Q195 98 182 105 Q190 102 196 95 M188 106 Q194 99 202 92"
                stroke="#120503"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M125 75 Q115 95 102 102 Q110 99 116 92 M108 103 Q114 96 122 89"
                stroke="#120503"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Flame Tail Tuft */}
              <path
                className="dragon-tail-flame"
                d="M15 72 Q-5 65 -15 55 Q-10 70 -20 75 Q-8 80 -18 90 Q0 82 15 74 Z"
                fill="rgba(255, 80, 0, 0.4)"
              />
            </g>

            {/* Front Main Wing (Dramatic Flapping & Shadow Sweep) */}
            <g className="dragon-wing front-wing">
              <path
                d="M150 70 Q130 10 90 0 Q118 24 112 48 Q138 36 142 60 Q150 50 155 72 Z"
                fill="url(#dragonWingGrad)"
              />
              {/* Wing Struts */}
              <path
                d="M150 70 L90 0 M150 70 L112 48 M150 70 L142 60"
                stroke="rgba(255, 120, 0, 0.35)"
                strokeWidth="1.6"
              />
              {/* Wing Edge Fiery Glow */}
              <path
                d="M90 0 Q118 24 112 48 Q138 36 142 60"
                stroke="rgba(255, 160, 20, 0.2)"
                strokeWidth="1"
                fill="none"
              />
            </g>

            {/* Piercing Glowing Fiery Eye */}
            <circle
              className="dragon-fiery-eye"
              cx="276"
              cy="67"
              r="2.8"
              fill="url(#dragonEyeGrad)"
            />
            {/* Eye Glow Flare */}
            <circle
              cx="276"
              cy="67"
              r="6.5"
              fill="rgba(255, 120, 0, 0.4)"
              filter="url(#shadowSmokeBlur)"
            />
          </svg>

          {/* Dragon Fiery Smoke Trail Particles */}
          <div className="dragon-smoke-trail">
            <span className="smoke-puff puff-1" />
            <span className="smoke-puff puff-2" />
            <span className="smoke-puff puff-3" />
            <span className="smoke-puff puff-4" />
          </div>
        </div>
      </div>

      {/* 2. Secondary Distant High-Altitude Shadow Dragon (Atmospheric Parallax) */}
      <div className="shadow-dragon-track dragon-track-distant">
        <div className="shadow-dragon-flight distant-flight">
          <svg
            className="shadow-dragon-svg distant-svg"
            viewBox="0 0 320 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className="dragon-wing back-wing">
              <path
                d="M130 65 Q115 15 80 5 Q105 25 100 45 Q120 35 125 55 Q132 48 135 68 Z"
                fill="#000"
                opacity="0.6"
              />
            </g>
            <path
              className="dragon-spine"
              d="M260 70 Q235 62 210 75 Q185 88 160 72 Q135 56 110 75 Q85 92 60 75 Q40 60 20 70 Q5 78 0 74 Q15 65 35 58 Q60 52 85 68 Q110 82 135 65 Q160 48 185 65 Q210 80 235 65 Q248 58 260 70 Z"
              fill="#060201"
              opacity="0.85"
            />
            <g className="dragon-wing front-wing">
              <path
                d="M150 70 Q130 10 90 0 Q118 24 112 48 Q138 36 142 60 Q150 50 155 72 Z"
                fill="#000"
                opacity="0.85"
              />
            </g>
            <circle cx="276" cy="67" r="2.2" fill="#ffd700" opacity="0.9" />
          </svg>
        </div>
      </div>

      {/* 3. Deep Celestial Silhouette Dragon (Weaving between distant clouds) */}
      <div className="shadow-dragon-track dragon-track-celestial">
        <div className="shadow-dragon-flight celestial-flight">
          <svg
            className="shadow-dragon-svg celestial-svg"
            viewBox="0 0 320 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="dragon-spine"
              d="M260 70 Q235 62 210 75 Q185 88 160 72 Q135 56 110 75 Q85 92 60 75 Q40 60 20 70 Q5 78 0 74 Q15 65 35 58 Q60 52 85 68 Q110 82 135 65 Q160 48 185 65 Q210 80 235 65 Q248 58 260 70 Z"
              fill="#080302"
              opacity="0.5"
            />
            <g className="dragon-wing front-wing">
              <path
                d="M150 70 Q130 10 90 0 Q118 24 112 48 Q138 36 142 60 Q150 50 155 72 Z"
                fill="#000"
                opacity="0.6"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
