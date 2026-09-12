import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import {
  Undo2,
  Redo2,
  Trash2,
  Download,
  Grid,
  Sparkles,
  Eraser,
  PenTool,
  Flame,
  Feather,
  Highlighter,
  Maximize2,
  Minimize2,
  FlipHorizontal,
} from "lucide-react";

export const DRAGON_PALETTE = [
  { name: "Ink Shadow", hex: "#12131a" },
  { name: "Imperial Gold", hex: "#fbbf24" },
  { name: "Dragon Flame", hex: "#f97316" },
  { name: "Crimson Blaze", hex: "#ef4444" },
  { name: "Jade Dynasty", hex: "#10b981" },
  { name: "Cyber Cyan", hex: "#06b6d4" },
  { name: "Mystic Violet", hex: "#8b5cf6" },
  { name: "Royal Purple", hex: "#ec4899" },
  { name: "Parchment White", hex: "#f8fafc" },
  { name: "Ember Brown", hex: "#78350f" },
];

export const BRUSH_TOOLS = [
  { id: "pen", name: "Brush Pen", icon: PenTool, description: "Smooth standard ink stroke" },
  { id: "flame", name: "Neon Fire", icon: Flame, description: "Glows with intense dragon fire embers" },
  { id: "calligraphy", name: "Calligraphy", icon: Feather, description: "Broad oriental ink flourish" },
  { id: "highlighter", name: "Highlighter", icon: Highlighter, description: "Translucent luminous marker" },
  { id: "eraser", name: "Eraser", icon: Eraser, description: "Clear or correct ink" },
];

const PracticeCanvas = forwardRef(function PracticeCanvas(
  {
    onCanvasChange,
    brushColor = "#fbbf24",
    setBrushColor,
    brushSize = 6,
    setBrushSize,
    selectedTool = "pen",
    setSelectedTool,
    disabled = false,
  },
  ref
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Undo / Redo history
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Settings
  const [showGrid, setShowGrid] = useState(false);
  const [symmetryMode, setSymmetryMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const strokesDataRef = useRef([]); // [ [xs, ys, ts], ... ]
  const currentStrokeRef = useRef(null); // { xs: [], ys: [], ts: [], startTime: number }

  // Save current canvas snapshot to history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Truncate redo stack
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 25) newHistory.shift();

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;

    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Initialize canvas resolution & baseline blank canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    const rect = container?.getBoundingClientRect() || { width: 700, height: 500 };

    const targetW = Math.max(320, Math.floor(rect.width || 700));
    const targetH = Math.max(320, Math.floor(rect.height || 500));

    // Match physical pixels with element dimensions
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Background fill (Dark Dynasty Dojo Canvas)
    ctx.fillStyle = "#0f1117";
    ctx.fillRect(0, 0, targetW, targetH);

    historyRef.current = [];
    historyIndexRef.current = -1;
    strokesDataRef.current = [];
    currentStrokeRef.current = null;
    pushHistory();
    onCanvasChange?.(canvas, strokesDataRef.current);
  }, [pushHistory, onCanvasChange]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      // Debounced resize
      clearTimeout(window._cvsResizeTimer);
      window._cvsResizeTimer = setTimeout(initCanvas, 250);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      strokesDataRef.current.pop();
      onCanvasChange?.(canvas, strokesDataRef.current);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      onCanvasChange?.(canvas, strokesDataRef.current);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0f1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokesDataRef.current = [];
    currentStrokeRef.current = null;
    pushHistory();
    onCanvasChange?.(canvas, []);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `scribble-royale-artwork-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Expose clear and canvas methods via imperative handle
  useImperativeHandle(ref, () => ({
    clearCanvas: handleClear,
    getCanvas: () => canvasRef.current,
    getStrokes: () => strokesDataRef.current,
  }));

  // Coordinate helper converting pointer event with exact sub-pixel scaling
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, w: 700 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return {
      x,
      y,
      w: canvas.width,
    };
  };

  // Setup drawing context styles based on active tool
  const applyToolStyle = (ctx, tool, color, size) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.strokeStyle = "#0f1117";
      ctx.lineWidth = size * 2.5;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    } else if (tool === "flame") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.globalAlpha = 0.95;
    } else if (tool === "calligraphy") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.5;
      ctx.lineCap = "square";
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    } else if (tool === "highlighter") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2.5;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.35;
    } else {
      // standard pen
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }
  };

  const drawSegment = (p1, p2, isMirror = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.save();
    applyToolStyle(ctx, selectedTool, brushColor, brushSize);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.restore();
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    isDrawingRef.current = true;

    const pt = getCoordinates(e);
    lastPointRef.current = pt;

    const t0 = Date.now();
    currentStrokeRef.current = {
      xs: [Math.round(pt.x)],
      ys: [Math.round(pt.y)],
      ts: [0],
      startTime: t0,
    };

    // Draw single dot
    drawSegment(pt, { x: pt.x + 0.1, y: pt.y + 0.1 });
    if (symmetryMode) {
      const mirrorX = pt.w - pt.x;
      drawSegment({ x: mirrorX, y: pt.y }, { x: mirrorX + 0.1, y: pt.y + 0.1 }, true);
    }

    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || disabled) return;
    const pt = getCoordinates(e);
    const last = lastPointRef.current;
    if (!last) {
      lastPointRef.current = pt;
      return;
    }

    drawSegment(last, pt);

    if (currentStrokeRef.current) {
      const dt = Date.now() - currentStrokeRef.current.startTime;
      currentStrokeRef.current.xs.push(Math.round(pt.x));
      currentStrokeRef.current.ys.push(Math.round(pt.y));
      currentStrokeRef.current.ts.push(dt);
    }

    if (symmetryMode) {
      const lastMirror = { x: last.w - last.x, y: last.y };
      const ptMirror = { x: pt.w - pt.x, y: pt.y };
      drawSegment(lastMirror, ptMirror, true);
    }

    lastPointRef.current = pt;

    // Trigger prediction callback with throttled animation frame
    if (!window._predRaf) {
      window._predRaf = requestAnimationFrame(() => {
        const activeStrokes = currentStrokeRef.current?.xs?.length
          ? [...strokesDataRef.current, [currentStrokeRef.current.xs, currentStrokeRef.current.ys, currentStrokeRef.current.ts]]
          : strokesDataRef.current;
        onCanvasChange?.(canvasRef.current, activeStrokes);
        window._predRaf = null;
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    if (currentStrokeRef.current && currentStrokeRef.current.xs.length > 0) {
      strokesDataRef.current.push([
        currentStrokeRef.current.xs,
        currentStrokeRef.current.ys,
        currentStrokeRef.current.ts,
      ]);
    }
    currentStrokeRef.current = null;

    pushHistory();
    onCanvasChange?.(canvasRef.current, strokesDataRef.current);
  };

  return (
    <div className={`practice-canvas-wrapper ${isFullscreen ? "fullscreen" : ""}`} ref={containerRef}>
      {/* Top Floating Mini Toolbar */}
      <div className="practice-canvas-top-bar">
        {/* Tool selector */}
        <div className="tool-btn-group">
          {BRUSH_TOOLS.map((t) => {
            const Icon = t.icon;
            const active = selectedTool === t.id;
            return (
              <button
                key={t.id}
                className={`tool-pill-btn ${active ? "active" : ""}`}
                onClick={() => setSelectedTool(t.id)}
                title={t.description}
              >
                <Icon size={16} />
                <span className="tool-pill-label">{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action buttons (Undo, Redo, Symmetry, Grid, Clear, Export) */}
        <div className="action-btn-group">
          <button
            className="canvas-icon-btn"
            onClick={() => setSymmetryMode(!symmetryMode)}
            title={symmetryMode ? "Disable Symmetry Mirror" : "Enable Symmetry Mirror (Draw crests/dragons)"}
            style={{ color: symmetryMode ? "#fbbf24" : "inherit" }}
          >
            <FlipHorizontal size={17} />
          </button>

          <button
            className="canvas-icon-btn"
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? "Hide Grid Guides" : "Show Grid Guides"}
            style={{ color: showGrid ? "#38bdf8" : "inherit" }}
          >
            <Grid size={17} />
          </button>

          <div className="toolbar-v-divider" />

          <button
            className="canvas-icon-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo stroke (Ctrl+Z)"
          >
            <Undo2 size={17} />
          </button>

          <button
            className="canvas-icon-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo stroke (Ctrl+Y)"
          >
            <Redo2 size={17} />
          </button>

          <button
            className="canvas-icon-btn danger"
            onClick={handleClear}
            title="Clear canvas"
          >
            <Trash2 size={17} />
          </button>

          <button
            className="canvas-icon-btn"
            onClick={handleDownload}
            title="Save PNG snapshot"
          >
            <Download size={17} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="practice-canvas-stage">
        {showGrid && <div className="practice-canvas-grid-overlay" />}
        {symmetryMode && <div className="practice-canvas-symmetry-line" />}

        <canvas
          ref={canvasRef}
          className="practice-canvas-element"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            cursor: selectedTool === "eraser" ? "cell" : "crosshair",
            touchAction: "none",
          }}
        />
      </div>

      {/* Bottom Floating Color & Size Palette Bar */}
      <div className="practice-canvas-bottom-bar">
        {/* Color swatches */}
        <div className="color-swatches-cluster">
          {DRAGON_PALETTE.map((c) => (
            <button
              key={c.hex}
              className={`color-swatch-circle ${brushColor === c.hex ? "active" : ""}`}
              style={{ backgroundColor: c.hex }}
              onClick={() => {
                setBrushColor(c.hex);
                if (selectedTool === "eraser") setSelectedTool("pen");
              }}
              title={c.name}
            />
          ))}

          {/* Custom color picker */}
          <div className="custom-color-wrap" title="Custom Dragon Dye">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="custom-color-input"
            />
          </div>
        </div>

        {/* Brush Size Slider */}
        <div className="brush-size-slider-cluster">
          <span className="size-label">SIZE {brushSize}px</span>
          <input
            type="range"
            min="2"
            max="36"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="brush-range-slider"
          />
          <div
            className="brush-preview-dot"
            style={{
              width: Math.max(4, Math.min(24, brushSize)),
              height: Math.max(4, Math.min(24, brushSize)),
              backgroundColor: brushColor,
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default PracticeCanvas;
