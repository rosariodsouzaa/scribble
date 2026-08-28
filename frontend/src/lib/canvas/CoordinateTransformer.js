/**
 * CoordinateTransformer
 * Encapsulates normalized [0, 1] coordinate mapping to resolution-independent logical pixel space.
 */
export class CoordinateTransformer {
  static LOGICAL_WIDTH = 900;
  static LOGICAL_HEIGHT = 600;

  /**
   * Transforms pointer event coordinates to normalized [0, 1] space
   * @param {number} clientX 
   * @param {number} clientY 
   * @param {DOMRect} boundingClientRect 
   * @returns {{ x: number, y: number }}
   */
  static toNormalized(clientX, clientY, boundingClientRect) {
    const rawX = (clientX - boundingClientRect.left) / boundingClientRect.width;
    const rawY = (clientY - boundingClientRect.top) / boundingClientRect.height;

    const clampedX = Math.max(0, Math.min(1, rawX));
    const clampedY = Math.max(0, Math.min(1, rawY));

    return {
      x: Number(clampedX.toFixed(4)),
      y: Number(clampedY.toFixed(4)),
    };
  }

  /**
   * Transforms normalized [0, 1] coordinate to logical canvas pixels
   * @param {number} normX 
   * @param {number} normY 
   * @returns {{ x: number, y: number }}
   */
  static fromNormalized(normX, normY) {
    return {
      x: normX * CoordinateTransformer.LOGICAL_WIDTH,
      y: normY * CoordinateTransformer.LOGICAL_HEIGHT,
    };
  }
}
