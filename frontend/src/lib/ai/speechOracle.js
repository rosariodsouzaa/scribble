/**
 * Dragon AI Oracle - Voice Commentary & Real-Time Dynamic Dialogues
 */

class SpeechOracle {
  constructor() {
    this.speechSynthesis = typeof window!== "undefined"? window.speechSynthesis: null;
    this.lastSpokenText = "";
    this.lastSpokeTime = 0;
    this.voice = null;
    this.enabled = true;

    if (this.speechSynthesis) {
      this.initVoices();
      if (typeof window!== "undefined" && window.speechSynthesis.onvoiceschanged!== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.speechSynthesis) return;
    const voices = this.speechSynthesis.getVoices();
    // Prefer English expressive or deep voices
    this.voice =
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Guy") || v.name.includes("David"))) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0] ||
      null;
  }

  speak(text, priority = false) {
    if (!this.enabled ||!this.speechSynthesis ||!text) return;

    const now = Date.now();
    // Throttle repeated speech by 3.5 seconds unless priority
    if (!priority && (now - this.lastSpokeTime < 3500 || text === this.lastSpokenText)) {
      return;
    }

    try {
      this.speechSynthesis.cancel(); // Stop prior utterance
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.85;

      this.lastSpokenText = text;
      this.lastSpokeTime = now;
      this.speechSynthesis.speak(utterance);
    } catch {
      // Voice synthesis error handling
    }
  }

  stop() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Generates dynamic real-time commentary based on top guess, target word, and confidence
   */
  getCommentary(topPrediction, targetPrompt = null, isCorrect = false) {
    if (isCorrect && targetPrompt) {
      return ` Brilliant stroke! By the ancient dragon fires, that is unmistakable: ${targetPrompt.name}!`;
    }

    if (!topPrediction) {
      return "Brush is still clean... Unfurl your scroll and make your first mark!";
    }

    const { name, confidence, icon } = topPrediction;

    if (targetPrompt && name.toLowerCase() === targetPrompt.name.toLowerCase()) {
      if (confidence >= 65) {
        return ` ${icon} YES! That looks exactly like ${name}! Hold steady!`;
      }
      return ` Getting closer to ${targetPrompt.name} (${confidence}%)... add more defining details!`;
    }

    if (confidence > 80) {
      return ` I am ${confidence}% confident this is ${icon} ${name}!`;
    } else if (confidence > 55) {
      return ` Hmm... I see the silhouette of ${icon} ${name}... or maybe something similar?`;
    } else if (confidence > 35) {
      return ` Early contours look like ${icon} ${name}... keep developing the shape!`;
    } else {
      return ` The spirits see lines forming... perhaps ${icon} ${name}?`;
    }
  }
}

export const speechOracle = new SpeechOracle();
