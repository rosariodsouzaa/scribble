/**
 * StrokeBatcher
 * Encapsulates rAF (requestAnimationFrame) point queuing and network packet flushing.
 */
export class StrokeBatcher {
  /**
   * @param {function(Array<{ x: number, y: number }>): void} onFlush - Callback to emit batched move data
   */
  constructor(onFlush) {
    this.onFlush = onFlush;
    this.buffer = [];
    this.rafId = 0;
  }

  /**
   * Adds a normalized point to the batch queue and schedules a frame flush
   * @param {{ x: number, y: number }} point 
   */
  push(point) {
    this.buffer.push(point);
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Immediately flushes all queued points to the subscriber
   */
  flush() {
    this.rafId = 0;
    if (this.buffer.length > 0) {
      this.onFlush(this.buffer);
      this.buffer = [];
    }
  }

  /**
   * Cancels any pending animation frame and clears the buffer
   */
  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.buffer = [];
  }
}
