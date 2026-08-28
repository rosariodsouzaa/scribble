import { CoordinateTransformer } from "./CoordinateTransformer.js";
import { StrokeRenderer } from "./StrokeRenderer.js";

/**
 * CanvasRenderer Engine
 * Coordinates canvas context lifecycle, coordinate transformations, and stroke rendering.
 */
export class CanvasRenderer {
  static LOGICAL_W = CoordinateTransformer.LOGICAL_WIDTH;
  static LOGICAL_H = CoordinateTransformer.LOGICAL_HEIGHT;

  /**
   * @param {HTMLCanvasElement} canvasElement 
   */
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = null;
    this.strokeRenderer = null;
    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.canvas.width = CanvasRenderer.LOGICAL_W;
    this.canvas.height = CanvasRenderer.LOGICAL_H;

    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.strokeRenderer = new StrokeRenderer(this.ctx);
      this.clear();
    }
  }

  /**
   * Transforms screen pointer coordinate to normalized [0, 1] space
   * @param {number} clientX 
   * @param {number} clientY 
   * @param {DOMRect} rect 
   * @returns {{ x: number, y: number }}
   */
  static toNormalized(clientX, clientY, rect) {
    return CoordinateTransformer.toNormalized(clientX, clientY, rect);
  }

  /**
   * Transforms normalized [0, 1] space to logical pixel space
   * @param {number} nx 
   * @param {number} ny 
   * @returns {{ x: number, y: number }}
   */
  static fromNormalized(nx, ny) {
    return CoordinateTransformer.fromNormalized(nx, ny);
  }

  /**
   * Clears the drawing board
   */
  clear() {
    this.strokeRenderer?.clear();
  }

  /**
   * Initiates a stroke sequence
   * @param {number} normX 
   * @param {number} normY 
   * @param {string} color 
   * @param {number} size 
   */
  renderStart(normX, normY, color = "#111827", size = 8) {
    this.strokeRenderer?.drawStart(normX, normY, color, size);
  }

  /**
   * Draws a batched line segment
   * @param {Array<{ x: number, y: number }>} points 
   * @param {string|null} [color] 
   * @param {number|null} [size] 
   */
  renderMoveBatch(points, color = null, size = null) {
    this.strokeRenderer?.drawMoveBatch(points, color, size);
  }
}
