import { WordMaskEngine } from "../services/words/WordMaskEngine.js";

export function maskWord(word, revealedIndices = new Set()) {
  return WordMaskEngine.maskWord(word, revealedIndices);
}

export function getEligibleHintIndices(word, currentRevealed = new Set()) {
  return WordMaskEngine.getEligibleHintIndices(word, currentRevealed);
}

export function getMaxHints(wordLength) {
  return WordMaskEngine.getMaxHints(wordLength);
}
