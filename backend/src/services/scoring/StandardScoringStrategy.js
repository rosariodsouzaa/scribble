import { ScoringStrategy } from "./ScoringStrategy.js";
import { config } from "../../config.js";

/**
 * Standard Scoring Strategy
 * Concrete implementation using time decay ratio, speed multipliers, and position rank bonuses.
 */
export class StandardScoringStrategy extends ScoringStrategy {
  constructor(scoringConfig = config.scoring) {
    super();
    this.config = scoringConfig;
  }

  calculateGuesserPoints(remainingSec, totalSec, rankIndex) {
    const ratio = Math.max(0, Math.min(1, remainingSec / totalSec));
    const base = this.config.guesser.base;
    const speedBonus = Math.round(ratio * this.config.guesser.speedMax);
    const rankBonus = this.config.guesser.rankBonuses[rankIndex] ?? 10;
    return base + speedBonus + rankBonus;
  }

  calculateDrawerPoints(remainingSec, totalSec) {
    const ratio = Math.max(0, Math.min(1, remainingSec / totalSec));
    const base = this.config.drawer.basePerGuesser;
    const speedBonus = Math.round(ratio * this.config.drawer.speedMaxPerGuesser);
    return base + speedBonus;
  }

  getAllGuessedBonus() {
    return this.config.drawer.allGuessedBonus || 50;
  }
}
