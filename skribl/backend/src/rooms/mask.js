// Turn a secret word into a masked hint of underscores, revealing letters as hints emerge.
//   "dragon", Set()            -> "_ _ _ _ _ _"
//   "dragon", Set([0, 3])       -> "D _ _ G _ _"
//   "ice cream", Set([0])       -> "I _ _   _ _ _ _ _"

export function maskWord(word, revealedIndices = new Set()) {
  let charIdx = 0;
  return String(word)
    .split(" ")
    .map((wordPart) => {
      return wordPart
        .split("")
        .map((ch) => {
          const isLetter = /[a-zA-Z0-9]/.test(ch);
          if (!isLetter) return ch; // Keep special symbols/hyphens as literal
          const isRevealed = revealedIndices.has(charIdx);
          charIdx++;
          return isRevealed ? ch.toUpperCase() : "_";
        })
        .join(" ");
    })
    .join("   ");
}

// Compute which character indices can be randomly revealed as hints over time
export function getEligibleHintIndices(word, currentRevealed = new Set()) {
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

// Determine maximum hints allowed for a given word length
export function getMaxHints(wordLength) {
  if (wordLength <= 2) return 0;
  if (wordLength <= 4) return 1;
  if (wordLength <= 7) return 2;
  return 3;
}
