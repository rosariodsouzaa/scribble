/**
 * AudioContextManager
 * Encapsulates Web Audio API context instantiation and resume state handling.
 */
export class AudioContextManager {
  constructor() {
    this.ctx = null;
  }

  getContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  getCurrentTime() {
    const ctx = this.getContext();
    return ctx ? ctx.currentTime : 0;
  }
}
