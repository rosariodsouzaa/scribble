import { WordDictionary } from "../services/words/WordDictionary.js";

export const THEME_PACKS = WordDictionary.THEME_PACKS;
export const WORDS = WordDictionary.THEME_PACKS.all;

export function pickWord(usedWords, options = {}) {
  return WordDictionary.pickWord(usedWords, options);
}
