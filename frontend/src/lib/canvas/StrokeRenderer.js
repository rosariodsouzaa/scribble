import { CoordinateTransformer } from "./CoordinateTransformer.js";

/**
 * StrokeRenderer
 * Encapsulates direct Canvas 2D rendering operations, stroke styles, line caps, and clear routines.
 */
export class StrokeRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(ctx) {
    this.ctx = ctx;
    this.cursor = { x: 0, y: 0 };
  }

  /**
   * Clears the entire canvas backing store with opaque white
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(
      0,
      0,
      CoordinateTransformer.LOGICAL_WIDTH,
      CoordinateTransformer.LOGICAL_HEIGHT
    );
    this.ctx.restore();
  }

  /**
   * Draws a stroke starting point / initial dot
   * @param {number} normX 
   * @param {number} normY 
   * @param {string} color 
   * @param {number} size 
   */
  drawStart(normX, normY, color = "#111827", size = 8) {
    if (!this.ctx) return;
    this.cursor = CoordinateTransformer.fromNormalized(normX, normY);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.drawDot(this.cursor);
  }

  /**
   * Renders a connected line segment sequence from an array of normalized coordinates
   * @param {Array<{ x: number, y: number }>} points 
   * @param {string|null} [color] 
   * @param {number|null} [size] 
   */
  drawMoveBatch(points, color = null, size = null) {
    if (!this.ctx || !points || points.length === 0) return;

    if (color) this.ctx.strokeStyle = color;
    if (size) this.ctx.lineWidth = size;

    this.ctx.beginPath();
    this.ctx.moveTo(this.cursor.x, this.cursor.y);

    for (const p of points) {
      const q = CoordinateTransformer.fromNormalized(p.x, p.y);
      this.ctx.lineTo(q.x, q.y);
      this.cursor = q;
    }

    this.ctx.stroke();
  }

  /**
   * Draws a single round dot for momentary clicks
   * @param {{ x: number, y: number }} point 
   */
  drawDot(point) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
    this.ctx.lineTo(point.x + 0.1, point.y + 0.1);
    this.ctx.stroke();
  }
}
