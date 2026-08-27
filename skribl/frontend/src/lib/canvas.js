// The canvas backing store is a fixed logical size on every client; CSS scales the
// element to fit. Coordinates travel the wire normalized to [0,1] so they're
// resolution- and aspect-independent.
export const LOGICAL_W = 900;
export const LOGICAL_H = 600;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// pointer clientX/Y + the element's bounding rect -> normalized [0,1]
export function toNorm(clientX, clientY, rect) {
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}

// normalized [0,1] -> logical canvas pixels
export function fromNorm(x, y) {
  return { x: x * LOGICAL_W, y: y * LOGICAL_H };
}
