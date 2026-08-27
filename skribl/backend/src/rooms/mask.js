// Turn a secret word into a masked hint of underscores, revealing letters as hints emerge.
//   "dragon", Set()      -> "_ _ _ _ _ _"
//   "dragon", Set([0, 3]) -> "D _ _ G _ _"
//   "ice cream", Set()   -> "_ _ _   /   _ _ _ _ _"
export function maskWord(word, revealedIndices = new Set()) {
  let charIndex = 0;
  return String(word)
    .split(" ")
    .map((part) => {
      const maskedPart = part
        .split("")
        .map((char) => {
          const isRevealed = revealedIndices.has(charIndex);
          charIndex++;
          return isRevealed ? char.toUpperCase() : "_";
        })
        .join(" ");
      return maskedPart;
    })
    .join("   /   ");
}

// Compute which character indices can be randomly revealed as hints over time
export function getEligibleHintIndices(word, currentRevealed = new Set()) {
  const eligible = [];
  let index = 0;
  for (const ch of String(word).toLowerCase()) {
    if (ch !== " ") {
      if (!currentRevealed.has(index)) eligible.push(index);
      index++;
    }
  }
  return eligible;
}
