import { useEffect, useRef, useState } from "react";

/**
 * Realistic Fire & Dragon Glow Component
 * Features:
 * - Fluid Canvas Fire Engine (Procedural flame tongues + additive plasma particles)
 * - Dynamic aerodynamic ember spark simulation with twinkling & thermal turbulence
 * - Multi-layer bloom & volumetric heat corona
 * - Foreground fire lick overlay for 3D visual depth
 * - Interactive heat surge on hover / touch
 */
export default function FireDragonLogo({
  size = "lg",
  className = "",
  showFireRing = true,
  interactive = true,
}) {
  const bgCanvasRef = useRef(null);
  const fgCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;

    const bgCtx = bgCanvas.getContext("2d");
    const fgCanvas = fgCanvasRef.current;
    const fgCtx = fgCanvas ? fgCanvas.getContext("2d") : null;

    let animId;
    let width = bgCanvas.clientWidth || 200;
    let height = bgCanvas.clientHeight || 200;

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!bgCanvas) return;
      const rect = bgCanvas.getBoundingClientRect();
      width = rect.width || (size === "lg" ? 220 : size === "md" ? 160 : size === "sm" ? 80 : 50);
      height = rect.height || (size === "lg" ? 240 : size === "md" ? 180 : size === "sm" ? 90 : 60);

      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      bgCtx.scale(dpr, dpr);

      if (fgCanvas && fgCtx) {
        fgCanvas.width = width * dpr;
        fgCanvas.height = height * dpr;
        fgCtx.scale(dpr, dpr);
      }
    }

    resize();

    // Scale particle limits based on logo size
    const isSmall = size === "sm" || size === "xs";
    const maxFlameParticles = isSmall ? 18 : size === "md" ? 45 : 75;
    const maxEmbers = isSmall ? 10 : size === "md" ? 24 : 45;

    // Flame Particle Pool
    const flameParticles = [];
    // Ember Spark Pool
    const embers = [];

    // Helper for random in range
    const rand = (min, max) => min + Math.random() * (max - min);

    // Create a flame particle
    function createFlameParticle(overrideY) {
      const centerX = width * 0.5;
      const centerY = height * 0.62;
      const spreadX = width * (isSmall ? 0.22 : 0.32);

      return {
        x: centerX + rand(-spreadX, spreadX),
        y: overrideY ?? centerY + rand(-10, 20),
        vx: rand(-0.4, 0.4),
        vy: rand(-1.6, -3.2) * (isSmall ? 0.6 : 1),
        radius: rand(width * 0.08, width * 0.18),
        maxRadius: rand(width * 0.12, width * 0.22),
        life: 0,
        maxLife: rand(35, 70),
        turbulence: rand(0, Math.PI * 2),
        turbSpeed: rand(0.04, 0.09),
        turbAmp: rand(0.6, 1.8),
      };
    }

    // Create an ember spark
    function createEmber(overrideY) {
      const centerX = width * 0.5;
      const centerY = height * 0.65;
      const spreadX = width * 0.35;

      return {
        x: centerX + rand(-spreadX, spreadX),
        y: overrideY ?? centerY + rand(-15, 15),
        vx: rand(-1.2, 1.2),
        vy: rand(-1.8, -4.2),
        size: rand(1.2, isSmall ? 2.2 : 3.4),
        alpha: rand(0.7, 1),
        maxLife: rand(45, 95),
        life: 0,
        swaySpeed: rand(0.05, 0.12),
        swayAmp: rand(0.8, 2.5),
        swayPhase: rand(0, Math.PI * 2),
        twinklePhase: rand(0, Math.PI * 2),
        colorType: Math.random() > 0.3 ? "gold" : Math.random() > 0.5 ? "white" : "crimson",
      };
    }

    // Seed initial particles
    for (let i = 0; i < maxFlameParticles; i++) {
      const p = createFlameParticle(height * 0.62 - (i / maxFlameParticles) * height * 0.4);
      p.life = rand(0, p.maxLife * 0.8);
      flameParticles.push(p);
    }

    for (let i = 0; i < maxEmbers; i++) {
      const e = createEmber(height * 0.65 - (i / maxEmbers) * height * 0.5);
      e.life = rand(0, e.maxLife * 0.8);
      embers.push(e);
    }

    // Dynamic Procedural Flame Tongues (Bézier curves)
    const tongueCount = isSmall ? 4 : 8;
    const tongues = Array.from({ length: tongueCount }, (_, i) => ({
      angleOffset: ((i - tongueCount / 2) / (tongueCount / 2)) * 0.55,
      heightFactor: rand(0.65, 1.15),
      widthFactor: rand(0.7, 1.3),
      speed1: rand(0.025, 0.045),
      speed2: rand(0.04, 0.07),
      phase1: rand(0, Math.PI * 2),
      phase2: rand(0, Math.PI * 2),
      intensity: rand(0.6, 1),
    }));

    let time = 0;

    function render() {
      time += 1;
      const boost = isHovered ? 1.35 : 1.0;

      // -------------------------------------------------------------
      // 1. BACKGROUND CANVAS (Main Flame Body & Tongues & Embers)
      // -------------------------------------------------------------
      bgCtx.clearRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.62;
      const baseRadius = width * 0.38;

      // Draw Volumetric Radial Core Warmth
      const coreWarmth = bgCtx.createRadialGradient(
        centerX,
        centerY - 5,
        baseRadius * 0.1,
        centerX,
        centerY - 10,
        baseRadius * 1.35
      );
      const pulse = 0.85 + Math.sin(time * 0.08) * 0.12;
      coreWarmth.addColorStop(0, `rgba(255, 245, 190, ${0.45 * pulse * boost})`);
      coreWarmth.addColorStop(0.25, `rgba(255, 140, 20, ${0.4 * pulse * boost})`);
      coreWarmth.addColorStop(0.55, `rgba(230, 45, 10, ${0.28 * pulse * boost})`);
      coreWarmth.addColorStop(0.85, `rgba(160, 15, 5, ${0.12 * pulse * boost})`);
      coreWarmth.addColorStop(1, "rgba(0, 0, 0, 0)");

      bgCtx.fillStyle = coreWarmth;
      bgCtx.beginPath();
      bgCtx.arc(centerX, centerY, baseRadius * 1.35, 0, Math.PI * 2);
      bgCtx.fill();

      // Draw Procedural Licking Flame Tongues
      bgCtx.save();
      bgCtx.globalCompositeOperation = "lighter";

      tongues.forEach((t) => {
        const tHeight = (height * 0.48 * t.heightFactor + Math.sin(time * t.speed1 + t.phase1) * 18) * boost;
        const sway1 = Math.sin(time * t.speed1 + t.phase1) * 16;
        const sway2 = Math.cos(time * t.speed2 + t.phase2) * 12;

        const startX = centerX + t.angleOffset * baseRadius * 1.1;
        const startY = centerY + baseRadius * 0.3;
        const tipX = centerX + t.angleOffset * baseRadius * 0.6 + sway1 + sway2;
        const tipY = centerY - tHeight;

        const cp1X = startX - 25 * t.widthFactor + sway1 * 0.5;
        const cp1Y = centerY - tHeight * 0.4;
        const cp2X = tipX - 10;
        const cp2Y = tipY + tHeight * 0.25;

        const cp3X = tipX + 10;
        const cp3Y = tipY + tHeight * 0.25;
        const cp4X = startX + 25 * t.widthFactor + sway2 * 0.5;
        const cp4Y = centerY - tHeight * 0.4;

        const flameGrad = bgCtx.createLinearGradient(centerX, startY, tipX, tipY);
        flameGrad.addColorStop(0, "rgba(255, 60, 0, 0.8)");
        flameGrad.addColorStop(0.35, "rgba(255, 150, 10, 0.75)");
        flameGrad.addColorStop(0.7, "rgba(255, 230, 80, 0.65)");
        flameGrad.addColorStop(0.9, "rgba(255, 255, 240, 0.85)");
        flameGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        bgCtx.fillStyle = flameGrad;
        bgCtx.beginPath();
        bgCtx.moveTo(startX - 18 * t.widthFactor, startY);
        bgCtx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, tipX, tipY);
        bgCtx.bezierCurveTo(cp3X, cp3Y, cp4X, cp4Y, startX + 18 * t.widthFactor, startY);
        bgCtx.closePath();
        bgCtx.fill();
      });

      // Draw Additive Plasma Fire Particles
      for (let i = 0; i < flameParticles.length; i++) {
        const p = flameParticles[i];
        p.life += 1;
        p.y += p.vy * boost;
        p.turbulence += p.turbSpeed;
        p.x += p.vx + Math.sin(p.turbulence) * p.turbAmp;

        const progress = p.life / p.maxLife;

        if (progress >= 1 || p.y < height * 0.05) {
          flameParticles[i] = createFlameParticle();
          continue;
        }

        // Particle size growth then dissipation
        const curRadius =
          progress < 0.25
            ? p.radius * (0.4 + (progress / 0.25) * 0.6)
            : p.radius * (1 - (progress - 0.25) / 0.75);

        if (curRadius <= 0.5) continue;

        // Realistic Thermal Color Map (White-hot core -> Neon Orange -> Fire Red -> Fade)
        let r = 255,
          g = 255,
          b = 255,
          a = 0.8;

        if (progress < 0.2) {
          // White to bright lemon yellow
          r = 255;
          g = Math.floor(255 - progress * 200);
          b = Math.floor(240 - progress * 800);
          a = 0.75 * (1 - progress * 0.5) * boost;
        } else if (progress < 0.55) {
          // Bright yellow to roaring orange
          const sub = (progress - 0.2) / 0.35;
          r = 255;
          g = Math.floor(215 - sub * 125);
          b = Math.floor(40 - sub * 40);
          a = (0.65 - sub * 0.25) * boost;
        } else {
          // Orange to deep crimson ember
          const sub = (progress - 0.55) / 0.45;
          r = Math.floor(255 - sub * 65);
          g = Math.floor(90 - sub * 75);
          b = Math.floor(10 - sub * 10);
          a = (0.4 * (1 - sub)) * boost;
        }

        const radGrad = bgCtx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          Math.max(curRadius, 1)
        );
        radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${Math.min(a, 1)})`);
        radGrad.addColorStop(0.45, `rgba(${r}, ${Math.max(0, g - 40)}, 0, ${Math.min(a * 0.65, 1)})`);
        radGrad.addColorStop(1, "rgba(220, 20, 0, 0)");

        bgCtx.fillStyle = radGrad;
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // Draw Rising Glowing Ember Sparks
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life += 1;
        e.swayPhase += e.swaySpeed;
        e.twinklePhase += 0.15;
        e.x += e.vx + Math.sin(e.swayPhase) * e.swayAmp;
        e.y += e.vy * boost;

        const progress = e.life / e.maxLife;

        if (progress >= 1 || e.y < 0) {
          embers[i] = createEmber();
          continue;
        }

        const twinkle = 0.7 + Math.sin(e.twinklePhase) * 0.3;
        const curAlpha = e.alpha * (1 - progress) * twinkle;

        let col = `rgba(255, 230, 120, ${curAlpha})`;
        let glowCol = `rgba(255, 160, 20, ${curAlpha * 0.6})`;

        if (e.colorType === "white") {
          col = `rgba(255, 255, 255, ${curAlpha})`;
          glowCol = `rgba(255, 240, 180, ${curAlpha * 0.7})`;
        } else if (e.colorType === "crimson") {
          col = `rgba(255, 90, 30, ${curAlpha})`;
          glowCol = `rgba(230, 20, 0, ${curAlpha * 0.5})`;
        }

        // Draw spark glow aura
        bgCtx.fillStyle = glowCol;
        bgCtx.beginPath();
        bgCtx.arc(e.x, e.y, e.size * 2.2, 0, Math.PI * 2);
        bgCtx.fill();

        // Draw spark core
        bgCtx.fillStyle = col;
        bgCtx.beginPath();
        bgCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        bgCtx.fill();
      }

      bgCtx.restore();

      // -------------------------------------------------------------
      // 2. FOREGROUND CANVAS (Lapping front flames & close embers)
      // -------------------------------------------------------------
      if (fgCtx && !isSmall) {
        fgCtx.clearRect(0, 0, width, height);
        fgCtx.save();
        fgCtx.globalCompositeOperation = "lighter";

        // Subtle lower licking flame overlay on dragon edge
        const frontLickGrad = fgCtx.createLinearGradient(
          centerX,
          centerY + baseRadius * 0.6,
          centerX,
          centerY + baseRadius * 0.1
        );
        const frontPulse = 0.5 + Math.sin(time * 0.12) * 0.25;
        frontLickGrad.addColorStop(0, `rgba(255, 80, 0, ${0.45 * frontPulse * boost})`);
        frontLickGrad.addColorStop(0.5, `rgba(255, 180, 20, ${0.35 * frontPulse * boost})`);
        frontLickGrad.addColorStop(1, "rgba(255, 240, 100, 0)");

        fgCtx.fillStyle = frontLickGrad;
        fgCtx.beginPath();
        const bottomY = centerY + baseRadius * 0.7;
        const wave1 = Math.sin(time * 0.08) * 8;
        const wave2 = Math.cos(time * 0.1) * 6;

        fgCtx.moveTo(centerX - baseRadius * 0.75, bottomY);
        fgCtx.quadraticCurveTo(
          centerX - baseRadius * 0.3 + wave1,
          centerY + baseRadius * 0.2,
          centerX,
          centerY + baseRadius * 0.35 + wave2
        );
        fgCtx.quadraticCurveTo(
          centerX + baseRadius * 0.4 - wave2,
          centerY + baseRadius * 0.18,
          centerX + baseRadius * 0.75,
          bottomY
        );
        fgCtx.closePath();
        fgCtx.fill();

        // 3-4 foreground floating micro sparks crossing over the dragon
        for (let j = 0; j < 6; j++) {
          const sparkTime = time * 0.03 + j * 1.5;
          const sx = centerX + Math.sin(sparkTime * 1.2) * (baseRadius * 0.7);
          const sy = centerY + baseRadius * 0.4 - ((time * 1.2 + j * 45) % (height * 0.7));
          if (sy > centerY - baseRadius * 0.8 && sy < centerY + baseRadius * 0.6) {
            fgCtx.fillStyle = "rgba(255, 245, 180, 0.85)";
            fgCtx.beginPath();
            fgCtx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            fgCtx.fill();

            fgCtx.fillStyle = "rgba(255, 120, 0, 0.4)";
            fgCtx.beginPath();
            fgCtx.arc(sx, sy, 3.5, 0, Math.PI * 2);
            fgCtx.fill();
          }
        }

        fgCtx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size, isHovered]);

  return (
    <div
      ref={containerRef}
      className={`fire-dragon-wrapper size-${size} ${isHovered ? "is-hovered" : ""} ${className}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      {/* Volumetric Deep Radial Aura */}
      <div className="fire-aura-outer" />
      <div className="fire-aura-inner" />
      <div className="fire-heat-bloom" />

      {/* Background Fluid Fire & Sparks Simulation */}
      <canvas ref={bgCanvasRef} className="fire-dragon-canvas bg-flame-canvas" />

      {/* Plasma Energy Ring (Smooth, seamless cosmic heat ring) */}
      {showFireRing && (
        <div className="fire-ring-vortex">
          <div className="fire-ring-flame flame-core" />
          <div className="fire-ring-flame flame-glow" />
          <div className="fire-ring-flame flame-corona" />
        </div>
      )}

      {/* The Central Dragon Emblem with Luminous Radiant Lighting */}
      <div className="dragon-logo-img-box">
        <img
          src="/dragon-logo.png"
          alt="Scribble Royale Fire Dragon"
          className="dragon-logo-img"
          loading="eager"
        />
        {/* Dragon Internal Heat Core */}
        <div className="dragon-eye-burn" />
        <div className="dragon-crest-flare" />
        <div className="dragon-rim-light" />
      </div>

      {/* Foreground Flame Tongue & Spark Overlay (3D Depth) */}
      <canvas ref={fgCanvasRef} className="fire-dragon-canvas fg-flame-canvas" />
    </div>
  );
}
