import { maskWord, getEligibleHintIndices, getMaxHints } from "../rooms/mask.js";

/**
 * Round Domain Model
 * Encapsulates single-round gameplay, secret word masking, hint reveals, and correct guess state.
 */
export class Round {
  /**
   * @param {number} number - Current round number
   * @param {string} drawerId - Socket ID of the active drawer
   * @param {string} word - Secret word chosen for this round
   * @param {number} durationSec - Duration of the round in seconds
   */
  constructor(number, drawerId, word, durationSec) {
    this.number = number;
    this.drawerId = drawerId;
    this.word = word;
    this.revealedIndices = new Set();
    this.hintsGiven = 0;
    this.firstGuessHappened = false;
    this.maskedWord = maskWord(word, this.revealedIndices);
    this.wordLength = word.replace(/\s/g, "").length;
    this.endsAt = Date.now() + durationSec * 1000;
    this.correctGuessers = new Set();
    this.roundScores = new Map(); // playerId -> points earned in this round
  }

  /**
   * Checks whether a player has already correctly guessed the word this round
   * @param {string} playerId 
   * @returns {boolean}
   */
  hasGuessed(playerId) {
    return this.correctGuessers.has(playerId);
  }

  /**
   * Records a correct guess and updates round delta points
   * @param {string} playerId 
   * @param {number} points 
   */
  recordGuess(playerId, points) {
    this.correctGuessers.add(playerId);
    this.addRoundScore(playerId, points);
  }

  /**
   * Increments points earned during this round
   * @param {string} playerId 
   * @param {number} points 
   */
  addRoundScore(playerId, points) {
    const prev = this.roundScores.get(playerId) || 0;
    this.roundScores.set(playerId, prev + points);
  }

  /**
   * Gets points earned by a player this round
   * @param {string} playerId 
   * @returns {number}
   */
  getRoundScore(playerId) {
    return this.roundScores.get(playerId) || 0;
  }

  /**
   * Checks if all eligible guessers have successfully solved the word
   * @param {number} eligibleGuesserCount 
   * @returns {boolean}
   */
  isAllGuessed(eligibleGuesserCount) {
    return eligibleGuesserCount > 0 && this.correctGuessers.size >= eligibleGuesserCount;
  }

  /**
   * Calculates remaining seconds left in the round
   * @returns {number}
   */
  timeRemainingSec() {
    return Math.max(0, Math.ceil((this.endsAt - Date.now()) / 1000));
  }

  /**
   * Shortens round timer (e.g. after first correct guess)
   * @param {number} maxSec 
   */
  capRemainingTime(maxSec) {
    const currentRemaining = this.timeRemainingSec();
    if (currentRemaining > maxSec) {
      this.endsAt = Date.now() + maxSec * 1000;
      return true;
    }
    return false;
  }

  /**
   * Checks whether a hint can be progressively revealed
   * @param {number} totalSec 
   * @returns {boolean}
   */
  canRevealProgressiveHint(totalSec) {
    const remaining = this.timeRemainingSec();
    const maxHints = getMaxHints(this.wordLength);

    if (maxHints >= 1 && this.hintsGiven === 0 && remaining <= totalSec * 0.65) {
      return true;
    }
    if (maxHints >= 2 && this.hintsGiven === 1 && remaining <= totalSec * 0.40) {
      return true;
    }
    if (maxHints >= 3 && this.hintsGiven === 2 && remaining <= totalSec * 0.20) {
      return true;
    }
    return false;
  }

  /**
   * Reveals a random unrevealed letter in the word
   * @returns {{ letter: string, index: number } | null}
   */
  revealHintLetter() {
    const eligible = getEligibleHintIndices(this.word, this.revealedIndices);
    if (eligible.length === 0) return null;

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    this.revealedIndices.add(chosen.index);
    this.hintsGiven += 1;
    this.maskedWord = maskWord(this.word, this.revealedIndices);

    return chosen;
  }

  /**
   * Serializes round data safely. The secret word is omitted unless isDrawer is true.
   * @param {boolean} isDrawer 
   * @param {string|null} drawerName 
   * @returns {object}
   */
  serialize(isDrawer = false, drawerName = null) {
    return {
      number: this.number,
      drawerId: this.drawerId,
      drawerName: drawerName,
      endsAt: this.endsAt,
      maskedWord: this.maskedWord,
      wordLength: this.wordLength,
      word: isDrawer ? this.word : undefined,
    };
  }
}
