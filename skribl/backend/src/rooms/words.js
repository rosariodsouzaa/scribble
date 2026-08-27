// Simple, easy-to-draw word list. Kept short and family-friendly for the MVP.
export const WORDS = [
  "apple", "banana", "car", "house", "tree", "sun", "moon", "star", "fish", "cat",
  "dog", "bird", "flower", "boat", "train", "rocket", "guitar", "piano", "pizza", "burger",
  "clock", "book", "phone", "camera", "glasses", "hat", "shoe", "sock", "umbrella", "key",
  "door", "window", "chair", "table", "lamp", "candle", "cake", "ice cream", "donut", "cookie",
  "mountain", "river", "cloud", "rainbow", "snowman", "ghost", "robot", "dragon", "crown", "sword",
  "butterfly", "bee", "snail", "spider", "elephant", "giraffe", "lion", "penguin", "octopus", "whale",
  "bicycle", "airplane", "helicopter", "anchor", "compass", "ladder", "bridge", "castle", "island", "cactus",
];

// Pick a random word that hasn't been used yet in this room.
export function pickWord(usedWords) {
  const available = WORDS.filter((w) => !usedWords.has(w));
  const pool = available.length > 0 ? available : WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}
