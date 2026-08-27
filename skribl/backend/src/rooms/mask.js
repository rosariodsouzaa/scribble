// Turn a secret word into a masked hint of underscores, preserving word breaks.
//   "apple"     -> "_ _ _ _ _"
//   "ice cream" -> "_ _ _   /   _ _ _ _ _"
export function maskWord(word) {
  return String(word)
    .split(" ")
    .map((part) => part.split("").map(() => "_").join(" "))
    .join("   /   ");
}
