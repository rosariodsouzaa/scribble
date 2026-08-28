/**
 * Abstract Base Scoring Strategy
 * Defines contract for dynamic time-decay and rank-based point calculations.
 */
export class ScoringStrategy {
  /**
   * Calculates points earned by a guesser
   * @param {number} remainingSec 
   * @param {number} totalSec 
   * @param {number} rankIndex - 0 for 1st, 1 for 2nd, etc.
   * @returns {number}
   */
  calculateGuesserPoints(remainingSec, totalSec, rankIndex) {
    throw new Error("calculateGuesserPoints() must be implemented by concrete subclass");
  }

  /**
   * Calculates points earned by the drawer for a correct guess
   * @param {number} remainingSec 
   * @param {number} totalSec 
   * @returns {number}
   */
  calculateDrawerPoints(remainingSec, totalSec) {
    throw new Error("calculateDrawerPoints() must be implemented by concrete subclass");
  }

  /**
   * Bonus points awarded to the drawer if 100% of warriors solve the drawing
   * @returns {number}
   */
  getAllGuessedBonus() {
    return 0;
  }
}
