// Rich, diverse, easily drawable, and engaging word bank for Scribble Royale.
export const WORDS = [
  // Animals & Mythical Creatures
  "dragon", "tiger", "lion", "elephant", "giraffe", "monkey", "panda", "penguin",
  "kangaroo", "dolphin", "whale", "shark", "octopus", "turtle", "rabbit", "snake",
  "crocodile", "frog", "eagle", "owl", "flamingo", "peacock", "butterfly", "bee",
  "spider", "scorpion", "unicorn", "phoenix", "dinosaur", "crab", "jellyfish", "cat",
  "dog", "horse", "bear", "fox", "wolf", "zebra", "hippo", "camel",

  // Food & Drinks
  "pizza", "burger", "ice cream", "cake", "donut", "cookie", "popcorn", "sushi",
  "sandwich", "apple", "banana", "watermelon", "strawberry", "grape", "pineapple",
  "cherry", "avocado", "lemon", "carrot", "broccoli", "corn", "mushroom", "taco",
  "hot dog", "french fries", "pancake", "waffle", "chocolate", "coffee", "tea",

  // Everyday Objects & Tools
  "clock", "camera", "telephone", "laptop", "guitar", "piano", "drum", "violin",
  "scissors", "umbrella", "backpack", "glasses", "key", "lock", "candle", "lamp",
  "flashlight", "mirror", "brush", "pencil", "book", "hammer", "bucket", "trophy",
  "crown", "sword", "shield", "bow", "ring", "necklace", "watch", "shoe", "hat",

  // Vehicles & Transport
  "car", "bicycle", "motorcycle", "airplane", "helicopter", "rocket", "submarine",
  "boat", "ship", "train", "bus", "truck", "tractor", "ambulance", "skateboard",
  "hot air balloon", "scooter",

  // Nature, Astronomy & Landscapes
  "sun", "moon", "star", "cloud", "rainbow", "lightning", "rain", "snow",
  "volcano", "mountain", "river", "waterfall", "island", "beach", "forest", "tree",
  "flower", "cactus", "campfire", "cave", "desert", "planet", "galaxy", "comet",

  // Buildings & Places
  "house", "castle", "temple", "pyramid", "bridge", "lighthouse", "tower", "tent",
  "barn", "windmill", "igloo", "stadium", "palace",

  // Characters, Roles & Fun
  "king", "queen", "wizard", "ninja", "pirate", "robot", "alien", "ghost",
  "superhero", "clown", "detective", "doctor", "chef", "astronaut", "mermaid",
  "snowman", "scarecrow",
];

// Pick a random word that hasn't been used yet in this room session.
export function pickWord(usedWords) {
  const available = WORDS.filter((w) => !usedWords.has(w.toLowerCase()));
  const pool = available.length > 0 ? available : WORDS;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen;
}
