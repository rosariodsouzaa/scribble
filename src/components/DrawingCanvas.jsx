import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw, Trash2, Paintbrush } from 'lucide-react';

const COLORS = [
  '#000000',
  '#ef4444',
  '#f97316',
  '#fbbf24',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
];

const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 7 },
  { label: 'L', size: 14 },
];

const DrawingCanvas = ({ isDrawer = true, onDrawStroke }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Save current content before resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      // Apply new dimensions
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial state save
    saveState();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imageData]);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
    ctx.lineWidth = brushSize;

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isDrawer) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();

    if (onDrawStroke) {
      onDrawStroke({ x, y, color: isEraser ? '#ffffff' : currentColor, size: brushSize });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    saveState();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  return (
    <div className="canvas-card-wrapper">
      <div className="canvas-element-box" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="canvas-element"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {isDrawer && (
        <div className="canvas-toolbar">
          {/* Colors */}
          <div className="toolbar-group">
            <div className="color-palette">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${!isEraser && currentColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                  onClick={() => {
                    setCurrentColor(c);
                    setIsEraser(false);
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Brush Sizes & Tools */}
          <div className="toolbar-group">
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.size}
                type="button"
                className={`brush-size-btn ${brushSize === b.size && !isEraser ? 'active' : ''}`}
                style={{ width: '32px', height: '32px', fontSize: '0.75rem', fontWeight: 700 }}
                onClick={() => {
                  setBrushSize(b.size);
                  setIsEraser(false);
                }}
              >
                {b.label}
              </button>
            ))}

            <button
              type="button"
              className={`tool-action-btn ${isEraser ? 'active' : ''}`}
              onClick={() => setIsEraser(!isEraser)}
              title="Eraser"
            >
              <Eraser size={16} />
              <span>Eraser</span>
            </button>

            <button
              type="button"
              className="tool-action-btn"
              onClick={handleUndo}
              title="Undo"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              className="tool-action-btn"
              onClick={handleClear}
              title="Clear Canvas"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
