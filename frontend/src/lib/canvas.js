import { CanvasRenderer, CoordinateTransformer } from "./canvas/index.js";

export const LOGICAL_W = CoordinateTransformer.LOGICAL_WIDTH;
export const LOGICAL_H = CoordinateTransformer.LOGICAL_HEIGHT;

export function toNorm(clientX, clientY, rect) {
  return CoordinateTransformer.toNormalized(clientX, clientY, rect);
}

export function fromNorm(x, y) {
  return CoordinateTransformer.fromNormalized(x, y);
}
