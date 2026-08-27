// Rich, curated word bank categorized by themes with custom word list support.
export const THEME_PACKS = {
  all: [
    "dragon", "tiger", "lion", "elephant", "giraffe", "monkey", "panda", "penguin",
    "kangaroo", "dolphin", "whale", "shark", "octopus", "turtle", "rabbit", "snake",
    "crocodile", "frog", "eagle", "owl", "flamingo", "peacock", "butterfly", "bee",
    "spider", "scorpion", "unicorn", "phoenix", "dinosaur", "crab", "jellyfish", "cat",
    "dog", "horse", "bear", "fox", "wolf", "zebra", "hippo", "camel",
    "pizza", "burger", "ice cream", "cake", "donut", "cookie", "popcorn", "sushi",
    "sandwich", "apple", "banana", "watermelon", "strawberry", "grape", "pineapple",
    "cherry", "avocado", "lemon", "carrot", "broccoli", "corn", "mushroom", "taco",
    "hot dog", "french fries", "pancake", "waffle", "chocolate", "coffee", "tea",
    "clock", "camera", "telephone", "laptop", "guitar", "piano", "drum", "violin",
    "scissors", "umbrella", "backpack", "glasses", "key", "lock", "candle", "lamp",
    "flashlight", "mirror", "brush", "pencil", "book", "hammer", "bucket", "trophy",
    "crown", "sword", "shield", "bow", "ring", "necklace", "watch", "shoe", "hat",
    "car", "bicycle", "motorcycle", "airplane", "helicopter", "rocket", "submarine",
    "boat", "ship", "train", "bus", "truck", "tractor", "ambulance", "skateboard",
    "hot air balloon", "scooter",
    "sun", "moon", "star", "cloud", "rainbow", "lightning", "rain", "snow",
    "volcano", "mountain", "river", "waterfall", "island", "beach", "forest", "tree",
    "flower", "cactus", "campfire", "cave", "desert", "planet", "galaxy", "comet",
    "house", "castle", "temple", "pyramid", "bridge", "lighthouse", "tower", "tent",
    "barn", "windmill", "igloo", "stadium", "palace",
    "king", "queen", "wizard", "ninja", "pirate", "robot", "alien", "ghost",
    "superhero", "clown", "detective", "doctor", "chef", "astronaut", "mermaid",
    "snowman", "scarecrow",
  ],
  dynasty: [
    "dragon", "samurai", "katana", "emperor", "temple", "pagoda", "lotus",
    "phoenix", "scroll", "lantern", "palace", "throne", "bamboo", "bonsai",
    "jade", "warrior", "monk", "archery", "firework", "gong", "fan", "silk"
  ],
  tech: [
    "laptop", "robot", "blockchain", "server", "bitcoin", "metaverse", "satellite",
    "laser", "cyberpunk", "hacker", "drone", "rocket", "artificial intelligence",
    "keyboard", "headphones", "microchip", "vr headset", "spaceship", "battery"
  ],
  anime: [
    "pikachu", "naruto", "ninja", "wizard", "potion", "joystick", "superhero",
    "titan", "shinobi", "pokemon", "sword art", "dragonball", "death note",
    "kunai", "shuriken", "mecha", "guild", "spellbook"
  ],
};

export const WORDS = THEME_PACKS.all;

// Pick a random word that hasn't been used yet in this room session.
export function pickWord(usedWords, options = {}) {
  let pool = THEME_PACKS.all;

  if (options.customWords && Array.isArray(options.customWords) && options.customWords.length > 0) {
    pool = options.customWords;
  } else if (options.theme && THEME_PACKS[options.theme]) {
    pool = THEME_PACKS[options.theme];
  }

  const available = pool.filter((w) => !usedWords.has(String(w).toLowerCase()));
  const candidates = available.length > 0 ? available : pool;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return String(chosen).toLowerCase();
}
