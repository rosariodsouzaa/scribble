/**
 * WordMaskEngine Domain Service
 * Encapsulates secret word masking, hint index calculations, and progressive reveal rules.
 */
export class WordMaskEngine {
  /**
   * Masks a secret word with underscores, keeping spaces and revealed letters
   * @param {string} word 
   * @param {Set<number>} [revealedIndices] 
   * @returns {string}
   */
  static maskWord(word, revealedIndices = new Set()) {
    let charIdx = 0;
    return String(word)
      .split(" ")
      .map((wordPart) => {
        return wordPart
          .split("")
          .map((ch) => {
            const isLetter = /[a-zA-Z0-9]/.test(ch);
            if (!isLetter) return ch; // keep literal symbols/hyphens
            const isRevealed = revealedIndices.has(charIdx);
            charIdx++;
            return isRevealed ? ch.toUpperCase() : "_";
          })
          .join(" ");
      })
      .join("   ");
  }

  /**
   * Identifies unrevealed letter positions eligible for hint revelation
   * @param {string} word 
   * @param {Set<number>} [currentRevealed] 
   * @returns {Array<{ index: number, letter: string }>}
   */
  static getEligibleHintIndices(word, currentRevealed = new Set()) {
    const eligible = [];
    let charIdx = 0;
    for (const part of String(word).split(" ")) {
      for (const ch of part) {
        if (/[a-zA-Z0-9]/.test(ch)) {
          if (!currentRevealed.has(charIdx)) {
            eligible.push({ index: charIdx, letter: ch.toUpperCase() });
          }
          charIdx++;
        }
      }
    }
    return eligible;
  }

  /**
   * Calculates max hints allowed based on word length
   * @param {number} wordLength 
   * @returns {number}
   */
  static getMaxHints(wordLength) {
    if (wordLength <= 2) return 0;
    if (wordLength <= 4) return 1;
    if (wordLength <= 7) return 2;
    return 3;
  }
}
