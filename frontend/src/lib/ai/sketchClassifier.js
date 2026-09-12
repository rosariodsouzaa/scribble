import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

/**
 * 36 Core Doodle Categories with Synonyms, Natural Color Affinities & Hints
 */
export const SKETCH_CATEGORIES = [
  { id: "bow", name: "Bow & Arrow", icon: "🏹", colorTags: ["yellow", "orange", "brown", "white", "black"], syns: ["bow", "arrow", "archery", "bow and arrow", "crossbow"], hints: "Draw a curved bow arc with a string and a straight arrow!" },
  { id: "fish", name: "Fish", icon: "🐟", colorTags: ["cyan_blue", "orange", "yellow", "red"], syns: ["fish", "goldfish", "shark", "salmon", "trout", "carp", "tuna", "sea animal"], hints: "Draw an oval body with a triangular tail fin and an eye!" },
  { id: "sword", name: "Sword", icon: "⚔️", colorTags: ["white", "cyan_blue", "yellow", "black"], syns: ["sword", "dagger", "blade", "rapier", "saber", "cutlass", "weapon"], hints: "Draw a long straight blade with a crossguard hilt." },
  { id: "apple", name: "Apple", icon: "🍎", colorTags: ["red", "green", "yellow"], syns: ["apple", "granny smith", "fruit"], hints: "Draw a round apple with a top dimple and small stem." },
  { id: "star", name: "Star", icon: "⭐", colorTags: ["yellow", "white", "orange"], syns: ["star", "pentagram", "asterisk"], hints: "Draw a 5-pointed star with sharp acute vertices." },
  { id: "car", name: "Car", icon: "🚗", colorTags: ["red", "cyan_blue", "yellow", "black", "white", "orange"], syns: ["car", "automobile", "sports car", "sedan", "vehicle"], hints: "Draw a low rectangular body, roof cabin, and two round wheels." },
  { id: "tree", name: "Tree", icon: "🌲", colorTags: ["green", "brown"], syns: ["tree", "pine", "palm", "oak", "forest", "spruce"], hints: "Draw a vertical trunk with bushy foliage or triangle pine layers." },
  { id: "house", name: "House", icon: "🏠", colorTags: ["brown", "red", "yellow", "white"], syns: ["house", "home", "building", "cottage", "barn"], hints: "Draw a square base, triangular roof, door, and windows." },
  { id: "crown", name: "Crown", icon: "👑", colorTags: ["yellow", "orange", "purple_pink"], syns: ["crown", "coronet", "tiara", "royal"], hints: "Draw 3 to 5 peaks with circles on top and a flat band." },
  { id: "sun", name: "Sun", icon: "☀️", colorTags: ["yellow", "orange", "red"], syns: ["sun", "sunlight", "solar", "sunburst"], hints: "Draw a round circle with radiating ray lines." },
  { id: "heart", name: "Heart", icon: "❤️", colorTags: ["red", "purple_pink", "orange"], syns: ["heart", "love", "valentine"], hints: "Draw two rounded top curves meeting at a sharp bottom point." },
  { id: "castle", name: "Castle", icon: "🏰", colorTags: ["brown", "white", "black", "purple_pink"], syns: ["castle", "palace", "fortress", "tower"], hints: "Draw square walls, notched battlements, and a central gate." },
  { id: "shield", name: "Shield", icon: "🛡️", colorTags: ["yellow", "cyan_blue", "red", "purple_pink"], syns: ["shield", "buckler", "crest", "armor"], hints: "Draw a curved crest with an emblem or cross in the middle." },
  { id: "flame", name: "Flame", icon: "🔥", colorTags: ["orange", "red", "yellow"], syns: ["flame", "fire", "campfire", "torch"], hints: "Draw curved teardrop shapes rising to pointed tips." },
  { id: "moon", name: "Moon", icon: "🌙", colorTags: ["yellow", "white", "cyan_blue"], syns: ["moon", "crescent", "lunar"], hints: "Draw a curved crescent C-shape." },
  { id: "airplane", name: "Airplane", icon: "✈️", colorTags: ["white", "cyan_blue", "yellow", "black"], syns: ["airplane", "aeroplane", "airliner", "jet", "aircraft", "plane"], hints: "Draw a long fuselage, two wide side wings, and a tail fin." },
  { id: "cat", name: "Cat", icon: "🐱", colorTags: ["brown", "white", "black", "orange", "yellow"], syns: ["cat", "kitten", "feline", "tabby"], hints: "Draw a round head, two pointy triangle ears, and whiskers." },
  { id: "dog", name: "Dog", icon: "🐶", colorTags: ["brown", "white", "black", "yellow"], syns: ["dog", "puppy", "canine", "hound"], hints: "Draw floppy ears, a snout nose, eyes, and collar." },
  { id: "bird", name: "Bird", icon: "🐦", colorTags: ["cyan_blue", "red", "yellow", "green", "purple_pink"], syns: ["bird", "robin", "parrot", "eagle"], hints: "Draw a beak, rounded body, wings, and legs." },
  { id: "flower", name: "Flower", icon: "🌸", colorTags: ["purple_pink", "red", "yellow", "green", "orange"], syns: ["flower", "daisy", "rose", "tulip", "sunflower"], hints: "Draw a central circle surrounded by petal loops and a stem." },
  { id: "lightning", name: "Lightning", icon: "⚡", colorTags: ["yellow", "cyan_blue", "white"], syns: ["lightning", "thunderbolt", "flash"], hints: "Draw a sharp zigzag line with a pointed arrow tip." },
  { id: "diamond", name: "Diamond", icon: "💎", colorTags: ["cyan_blue", "white", "purple_pink"], syns: ["diamond", "gem", "crystal", "jewel"], hints: "Draw a wide flat top, angled sides, and a sharp bottom point." },
  { id: "eye", name: "Eye", icon: "👁️", colorTags: ["cyan_blue", "brown", "green", "black", "white"], syns: ["eye", "eyeball", "iris", "pupil"], hints: "Draw an almond shape with a round pupil dot in the center." },
  { id: "smile", name: "Smiley Face", icon: "😊", colorTags: ["yellow", "orange", "purple_pink"], syns: ["smile", "smiley", "face", "happy"], hints: "Draw a circle with two dot eyes and a curved smile line." },
  { id: "skull", name: "Skull", icon: "💀", colorTags: ["white", "black"], syns: ["skull", "skeleton", "bone"], hints: "Draw a round dome, two dark eye holes, and teeth." },
  { id: "guitar", name: "Guitar", icon: "🎸", colorTags: ["brown", "yellow", "red", "orange"], syns: ["guitar", "acoustic guitar", "violin"], hints: "Draw an hourglass figure-8 body with a long straight neck." },
  { id: "cup", name: "Cup", icon: "☕", colorTags: ["brown", "white", "cyan_blue", "red"], syns: ["cup", "mug", "coffee mug", "teacup"], hints: "Draw a cylindrical mug with a curved C handle on one side." },
  { id: "clock", name: "Clock", icon: "⏰", colorTags: ["yellow", "white", "black"], syns: ["clock", "alarm clock", "watch", "timer"], hints: "Draw a circle with hour and minute hands and bells on top." },
  { id: "book", name: "Book", icon: "📖", colorTags: ["brown", "red", "cyan_blue", "purple_pink"], syns: ["book", "notebook", "novel"], hints: "Draw two open rectangle pages or a rectangular cover spine." },
  { id: "hat", name: "Wizard Hat", icon: "🧙", colorTags: ["purple_pink", "black", "brown", "cyan_blue"], syns: ["hat", "cap", "sombrero"], hints: "Draw an oval brim with a tall pointed cone." },
  { id: "umbrella", name: "Umbrella", icon: "☂️", colorTags: ["cyan_blue", "purple_pink", "yellow", "red", "black"], syns: ["umbrella", "parasol"], hints: "Draw a dome canopy with a curved J handle at the bottom." },
  { id: "pizza", name: "Pizza", icon: "🍕", colorTags: ["yellow", "orange", "red", "brown"], syns: ["pizza", "pie", "slice"], hints: "Draw a triangular slice with a top crust arch and pepperoni dots." },
  { id: "mountain", name: "Mountain", icon: "⛰️", colorTags: ["brown", "white", "cyan_blue", "green"], syns: ["mountain", "alp", "volcano", "cliff"], hints: "Draw tall jagged triangular peaks with snow lines." },
  { id: "boat", name: "Boat", icon: "⛵", colorTags: ["brown", "cyan_blue", "white", "red"], syns: ["boat", "sailboat", "ship", "yacht"], hints: "Draw a curved hull with a vertical mast and triangle sail." },
  { id: "potion", name: "Potion Flask", icon: "🧪", colorTags: ["purple_pink", "cyan_blue", "green", "red"], syns: ["potion", "flask", "bottle"], hints: "Draw a narrow bottle neck flaring into a round base." },
  { id: "dragon", name: "Dragon", icon: "🐉", colorTags: ["green", "red", "orange", "purple_pink", "black"], syns: ["dragon", "lizard", "reptile", "dinosaur", "monster"], hints: "Draw wings, horns, a long tail, and flames!" },
];

let mobileNetModel = null;
let isModelLoading = false;

export async function initDeepLearningModel() {
  if (mobileNetModel || isModelLoading) return mobileNetModel;
  isModelLoading = true;
  try {
    await tf.ready();
    mobileNetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
  } catch (err) {
    console.warn("[AI Oracle] MobileNet init:", err);
  } finally {
    isModelLoading = false;
  }
  return mobileNetModel;
}

initDeepLearningModel();

/**
 * Converts RGB values into high-level semantic color tags
 */
export function rgbToColorTag(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (max < 45) return "black";
  if (delta < 20 && lightness > 175) return "white";
  if (delta < 22) return "neutral";

  let h = 0;
  if (delta > 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  // Check brown (warm hue with darker lightness)
  if ((h <= 45 || h >= 340) && lightness < 95 && max > 50) return "brown";

  if (h >= 345 || h < 18) return "red";
  if (h >= 18 && h < 45) return "orange";
  if (h >= 45 && h < 75) return "yellow";
  if (h >= 75 && h < 165) return "green";
  if (h >= 165 && h < 260) return "cyan_blue";
  if (h >= 260 && h < 345) return "purple_pink";

  return "neutral";
}

// Helper to draw a line on a 28x28 grid
function drawLine28(grid, x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let cx = x0, cy = y0;
  while (true) {
    if (cx >= 0 && cx < 28 && cy >= 0 && cy < 28) {
      grid[cy][cx] = 1;
      if (cx + 1 < 28) grid[cy][cx + 1] = Math.max(grid[cy][cx + 1], 0.6);
      if (cy + 1 < 28) grid[cy][cx + 1] = Math.max(grid[cy][cx + 1], 0.6);
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// Helper to draw an ellipse on a 28x28 grid
function drawEllipse28(grid, cx, cy, rx, ry) {
  for (let a = 0; a < Math.PI * 2; a += 0.08) {
    const x = Math.round(cx + rx * Math.cos(a));
    const y = Math.round(cy + ry * Math.sin(a));
    if (x >= 0 && x < 28 && y >= 0 && y < 28) {
      grid[y][x] = 1;
    }
  }
}

const makeEmptyGrid = () => Array(28).fill(0).map(() => Array(28).fill(0));

/**
 * Generate 28x28 Canonical Prototypical Maps for all categories
 */
function generatePrototypes() {
  const bank = {};

  // 1. BOW & ARROW (Multi-variant)
  {
    const g1 = makeEmptyGrid();
    for (let a = Math.PI * 0.5; a <= Math.PI * 1.5; a += 0.08) {
      const x = Math.round(8 + 6 * Math.cos(a));
      const y = Math.round(14 + 11 * Math.sin(a));
      if (x >= 0 && x < 28 && y >= 0 && y < 28) g1[y][x] = 1;
    }
    drawLine28(g1, 8, 3, 8, 25);
    drawLine28(g1, 20, 2, 20, 25);
    drawLine28(g1, 16, 7, 20, 2);
    drawLine28(g1, 24, 7, 20, 2);
    drawLine28(g1, 16, 7, 24, 7);
    drawLine28(g1, 17, 22, 20, 25);
    drawLine28(g1, 23, 22, 20, 25);

    const g2 = makeEmptyGrid();
    for (let a = Math.PI * 0.5; a <= Math.PI * 1.5; a += 0.08) {
      const x = Math.round(10 + 8 * Math.cos(a));
      const y = Math.round(14 + 11 * Math.sin(a));
      if (x >= 0 && x < 28 && y >= 0 && y < 28) g2[y][x] = 1;
    }
    drawLine28(g2, 10, 3, 10, 25);
    drawLine28(g2, 2, 14, 25, 14);
    drawLine28(g2, 21, 10, 25, 14);
    drawLine28(g2, 21, 18, 25, 14);

    bank["bow"] = [g1, g2];
  }

  // 2. FISH (Facing Right & Facing Left)
  {
    const g1 = makeEmptyGrid();
    drawEllipse28(g1, 11, 14, 8, 6);
    drawLine28(g1, 19, 14, 26, 7);
    drawLine28(g1, 19, 14, 26, 21);
    drawLine28(g1, 26, 7, 26, 21);
    g1[12][6] = 1;

    const g2 = makeEmptyGrid();
    drawEllipse28(g2, 17, 14, 8, 6);
    drawLine28(g2, 9, 14, 2, 7);
    drawLine28(g2, 9, 14, 2, 21);
    drawLine28(g2, 2, 7, 2, 21);
    g2[12][22] = 1;

    bank["fish"] = [g1, g2];
  }

  // 3. SWORD (Blade + Crossguard + Pommel)
  {
    const g1 = makeEmptyGrid();
    drawLine28(g1, 14, 2, 14, 23);
    drawLine28(g1, 6, 18, 22, 18);
    drawLine28(g1, 14, 23, 14, 26);
    drawLine28(g1, 12, 26, 16, 26);

    const g2 = makeEmptyGrid();
    drawLine28(g2, 3, 25, 24, 4);
    drawLine28(g2, 5, 20, 10, 25);

    bank["sword"] = [g1, g2];
  }

  // 4. APPLE (Round body + top stem + leaf)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 15, 9, 9);
    drawLine28(g, 14, 6, 17, 2);
    drawLine28(g, 15, 4, 19, 4);
    bank["apple"] = [g];
  }

  // 5. STAR (5-pointed star)
  {
    const g1 = makeEmptyGrid();
    const pts = [
      [14, 2], [17, 10], [25, 11], [19, 17], [21, 25],
      [14, 21], [7, 25], [9, 17], [3, 11], [11, 10]
    ];
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      drawLine28(g1, p1[0], p1[1], p2[0], p2[1]);
    }
    bank["star"] = [g1];
  }

  // 6. CAR (Body + Cabin + Wheels)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 3, 18, 25, 18);
    drawLine28(g, 3, 18, 5, 23);
    drawLine28(g, 25, 18, 23, 23);
    drawLine28(g, 5, 23, 23, 23);
    drawLine28(g, 8, 18, 11, 11);
    drawLine28(g, 11, 11, 18, 11);
    drawLine28(g, 18, 11, 21, 18);
    drawEllipse28(g, 8, 23, 3, 3);
    drawEllipse28(g, 20, 23, 3, 3);
    bank["car"] = [g];
  }

  // 7. TREE (Canopy + Trunk / Pine)
  {
    const g1 = makeEmptyGrid();
    drawLine28(g1, 13, 18, 13, 26);
    drawLine28(g1, 15, 18, 15, 26);
    drawLine28(g1, 13, 26, 15, 26);
    drawEllipse28(g1, 14, 10, 8, 8);

    const g2 = makeEmptyGrid();
    drawLine28(g2, 14, 2, 7, 10);
    drawLine28(g2, 14, 2, 21, 10);
    drawLine28(g2, 7, 10, 21, 10);
    drawLine28(g2, 9, 10, 4, 18);
    drawLine28(g2, 19, 10, 24, 18);
    drawLine28(g2, 4, 18, 24, 18);
    drawLine28(g2, 12, 18, 12, 26);
    drawLine28(g2, 16, 18, 16, 26);

    bank["tree"] = [g1, g2];
  }

  // 8. HOUSE (Roof + Box + Door + Window)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 14, 3, 3, 13);
    drawLine28(g, 14, 3, 25, 13);
    drawLine28(g, 3, 13, 25, 13);
    drawLine28(g, 5, 13, 5, 25);
    drawLine28(g, 23, 13, 23, 25);
    drawLine28(g, 5, 25, 23, 25);
    drawLine28(g, 11, 18, 11, 25);
    drawLine28(g, 17, 18, 17, 25);
    drawLine28(g, 11, 18, 17, 18);
    bank["house"] = [g];
  }

  // 9. CROWN (Base + 3 Peaks)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 4, 23, 24, 23);
    drawLine28(g, 4, 23, 4, 10);
    drawLine28(g, 24, 23, 24, 10);
    drawLine28(g, 4, 10, 9, 17);
    drawLine28(g, 9, 17, 14, 6);
    drawLine28(g, 14, 6, 19, 17);
    drawLine28(g, 19, 17, 24, 10);
    bank["crown"] = [g];
  }

  // 10. SUN (Center circle + rays)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 14, 5, 5);
    drawLine28(g, 14, 2, 14, 7);
    drawLine28(g, 14, 21, 14, 26);
    drawLine28(g, 2, 14, 7, 14);
    drawLine28(g, 21, 14, 26, 14);
    drawLine28(g, 5, 5, 9, 9);
    drawLine28(g, 19, 19, 23, 23);
    drawLine28(g, 23, 5, 19, 9);
    drawLine28(g, 5, 23, 9, 19);
    bank["sun"] = [g];
  }

  // 11. HEART (Two lobes + bottom point)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 9, 9, 5, 5);
    drawEllipse28(g, 19, 9, 5, 5);
    drawLine28(g, 4, 11, 14, 25);
    drawLine28(g, 24, 11, 14, 25);
    bank["heart"] = [g];
  }

  // 12. SMILE (Circle + eyes + smile)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 14, 11, 11);
    g[10][9] = 1;
    g[10][19] = 1;
    for (let a = 0.2; a < Math.PI - 0.2; a += 0.2) {
      const x = Math.round(14 + 6 * Math.cos(a + Math.PI));
      const y = Math.round(16 + 4 * Math.sin(a));
      if (x >= 0 && x < 28 && y >= 0 && y < 28) g[y][x] = 1;
    }
    bank["smile"] = [g];
  }

  // 13. CLOCK (Circle + hands)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 14, 11, 11);
    drawLine28(g, 14, 14, 14, 7);
    drawLine28(g, 14, 14, 20, 14);
    bank["clock"] = [g];
  }

  // 14. MOON (Crescent C)
  {
    const g = makeEmptyGrid();
    for (let a = Math.PI * 0.4; a <= Math.PI * 1.6; a += 0.1) {
      const x1 = Math.round(15 + 10 * Math.cos(a));
      const y1 = Math.round(14 + 10 * Math.sin(a));
      if (x1 >= 0 && x1 < 28 && y1 >= 0 && y1 < 28) g[y1][x1] = 1;
      const x2 = Math.round(11 + 7 * Math.cos(a));
      const y2 = Math.round(14 + 7 * Math.sin(a));
      if (x2 >= 0 && x2 < 28 && y2 >= 0 && y2 < 28) g[y2][x2] = 1;
    }
    bank["moon"] = [g];
  }

  // 15. AIRPLANE (Fuselage + Wings)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 14, 3, 14, 25);
    drawLine28(g, 3, 12, 25, 12);
    drawLine28(g, 9, 23, 19, 23);
    bank["airplane"] = [g];
  }

  // 16. GUITAR (Hourglass + Neck)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 14, 2, 14, 15);
    drawEllipse28(g, 14, 17, 4, 3);
    drawEllipse28(g, 14, 22, 6, 4);
    bank["guitar"] = [g];
  }

  // 17. CUP (Mug + Handle)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 6, 8, 20, 8);
    drawLine28(g, 6, 8, 6, 23);
    drawLine28(g, 20, 8, 20, 23);
    drawLine28(g, 6, 23, 20, 23);
    drawLine28(g, 20, 11, 25, 14);
    drawLine28(g, 25, 14, 20, 19);
    bank["cup"] = [g];
  }

  // 18. UMBRELLA (Dome + Hook)
  {
    const g = makeEmptyGrid();
    for (let a = Math.PI; a <= Math.PI * 2; a += 0.1) {
      const x = Math.round(14 + 10 * Math.cos(a));
      const y = Math.round(13 + 8 * Math.sin(a));
      if (x >= 0 && x < 28 && y >= 0 && y < 28) g[y][x] = 1;
    }
    drawLine28(g, 4, 13, 24, 13);
    drawLine28(g, 14, 13, 14, 23);
    drawLine28(g, 14, 23, 11, 25);
    bank["umbrella"] = [g];
  }

  // 19. MOUNTAIN (Peaks)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 2, 24, 12, 5);
    drawLine28(g, 12, 5, 20, 24);
    drawLine28(g, 15, 14, 22, 8);
    drawLine28(g, 22, 8, 26, 24);
    drawLine28(g, 2, 24, 26, 24);
    bank["mountain"] = [g];
  }

  // 20. EYE (Almond + Pupil)
  {
    const g = makeEmptyGrid();
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      const x = Math.round(14 + 11 * Math.cos(a));
      const y = Math.round(14 + 5 * Math.sin(a));
      if (x >= 0 && x < 28 && y >= 0 && y < 28) g[y][x] = 1;
    }
    drawEllipse28(g, 14, 14, 3, 3);
    bank["eye"] = [g];
  }

  // 21. SHIELD (Curved crest + bottom V)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 4, 4, 24, 4);
    drawLine28(g, 4, 4, 4, 16);
    drawLine28(g, 24, 4, 24, 16);
    drawLine28(g, 4, 16, 14, 26);
    drawLine28(g, 24, 16, 14, 26);
    drawLine28(g, 14, 7, 14, 22);
    drawLine28(g, 7, 12, 21, 12);
    bank["shield"] = [g];
  }

  // 22. CASTLE (Battlements + Walls)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 3, 25, 25, 25);
    drawLine28(g, 4, 8, 4, 25);
    drawLine28(g, 24, 8, 24, 25);
    drawLine28(g, 4, 8, 8, 8);
    drawLine28(g, 8, 8, 8, 12);
    drawLine28(g, 8, 12, 12, 12);
    drawLine28(g, 12, 12, 12, 8);
    drawLine28(g, 12, 8, 16, 8);
    drawLine28(g, 16, 8, 16, 12);
    drawLine28(g, 16, 12, 20, 12);
    drawLine28(g, 20, 12, 20, 8);
    drawLine28(g, 20, 8, 24, 8);
    drawEllipse28(g, 14, 22, 3, 4);
    bank["castle"] = [g];
  }

  // 23. FLAME (Teardrop fire)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 14, 2, 7, 16);
    drawLine28(g, 14, 2, 21, 16);
    drawLine28(g, 7, 16, 14, 25);
    drawLine28(g, 21, 16, 14, 25);
    drawLine28(g, 14, 10, 10, 18);
    drawLine28(g, 14, 10, 18, 18);
    bank["flame"] = [g];
  }

  // 24. FLOWER (Center + Petals + Stem)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 11, 4, 4);
    drawEllipse28(g, 14, 5, 3, 3);
    drawEllipse28(g, 14, 17, 3, 3);
    drawEllipse28(g, 8, 11, 3, 3);
    drawEllipse28(g, 20, 11, 3, 3);
    drawLine28(g, 14, 18, 14, 26);
    bank["flower"] = [g];
  }

  // 25. LIGHTNING (Zigzag bolt)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 17, 2, 10, 13);
    drawLine28(g, 10, 13, 18, 13);
    drawLine28(g, 18, 13, 8, 26);
    bank["lightning"] = [g];
  }

  // 26. DIAMOND (Flat top + angled + V-point)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 8, 6, 20, 6);
    drawLine28(g, 8, 6, 3, 13);
    drawLine28(g, 20, 6, 25, 13);
    drawLine28(g, 3, 13, 25, 13);
    drawLine28(g, 3, 13, 14, 26);
    drawLine28(g, 25, 13, 14, 26);
    bank["diamond"] = [g];
  }

  // 27. CAT (Round head + 2 triangular ears)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 16, 9, 8);
    drawLine28(g, 6, 11, 6, 3);
    drawLine28(g, 6, 3, 11, 9);
    drawLine28(g, 22, 11, 22, 3);
    drawLine28(g, 22, 3, 17, 9);
    g[15][10] = 1;
    g[15][18] = 1;
    bank["cat"] = [g];
  }

  // 28. DOG (Head + Floppy ears)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 14, 8, 8);
    drawEllipse28(g, 5, 14, 3, 6);
    drawEllipse28(g, 23, 14, 3, 6);
    g[13][10] = 1;
    g[13][18] = 1;
    bank["dog"] = [g];
  }

  // 29. BIRD (Body + Beak + Wing)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 14, 8, 6);
    drawLine28(g, 6, 13, 1, 15);
    drawLine28(g, 1, 15, 6, 17);
    drawEllipse28(g, 16, 12, 5, 3);
    drawLine28(g, 22, 14, 27, 11);
    bank["bird"] = [g];
  }

  // 30. SKULL (Dome + Eyes + Teeth)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 12, 9, 8);
    g[12][9] = 1;
    g[12][10] = 1;
    g[12][18] = 1;
    g[12][19] = 1;
    drawLine28(g, 9, 20, 19, 20);
    drawLine28(g, 9, 20, 9, 25);
    drawLine28(g, 19, 20, 19, 25);
    drawLine28(g, 9, 25, 19, 25);
    bank["skull"] = [g];
  }

  // 31. BOOK (Open spine + pages)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 14, 6, 14, 24);
    drawLine28(g, 14, 6, 3, 9);
    drawLine28(g, 3, 9, 3, 23);
    drawLine28(g, 3, 23, 14, 24);
    drawLine28(g, 14, 6, 25, 9);
    drawLine28(g, 25, 9, 25, 23);
    drawLine28(g, 25, 23, 14, 24);
    bank["book"] = [g];
  }

  // 32. HAT (Brim + Cone)
  {
    const g = makeEmptyGrid();
    drawEllipse28(g, 14, 22, 11, 4);
    drawLine28(g, 6, 22, 14, 3);
    drawLine28(g, 22, 22, 14, 3);
    bank["hat"] = [g];
  }

  // 33. PIZZA (Triangle slice)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 4, 6, 24, 6);
    drawLine28(g, 4, 6, 14, 26);
    drawLine28(g, 24, 6, 14, 26);
    drawEllipse28(g, 11, 12, 2, 2);
    drawEllipse28(g, 17, 12, 2, 2);
    drawEllipse28(g, 14, 18, 2, 2);
    bank["pizza"] = [g];
  }

  // 34. POTION (Neck + Flask)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 11, 3, 17, 3);
    drawLine28(g, 11, 3, 11, 10);
    drawLine28(g, 17, 3, 17, 10);
    drawEllipse28(g, 14, 18, 8, 7);
    bank["potion"] = [g];
  }

  // 35. BOAT (Hull + Mast + Sail)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 3, 21, 25, 21);
    drawLine28(g, 6, 25, 22, 25);
    drawLine28(g, 3, 21, 6, 25);
    drawLine28(g, 25, 21, 22, 25);
    drawLine28(g, 14, 4, 14, 21);
    drawLine28(g, 14, 4, 23, 15);
    drawLine28(g, 14, 15, 23, 15);
    bank["boat"] = [g];
  }

  // 36. DRAGON (Spine + Wings)
  {
    const g = makeEmptyGrid();
    drawLine28(g, 5, 22, 23, 14);
    drawLine28(g, 14, 17, 6, 6);
    drawLine28(g, 6, 6, 12, 10);
    drawLine28(g, 14, 17, 22, 6);
    drawLine28(g, 22, 6, 16, 10);
    bank["dragon"] = [g];
  }

  return bank;
}

const PROTOTYPE_BANK = generatePrototypes();

/**
 * Normalizes user canvas strokes into 28x28 binary matrix and extracts dominant ink color
 */
export function extractCanvas28x28(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return null;

  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, maxX = 0, minY = h, maxY = 0;
  let drawnPixels = 0;
  let sumR = 0, sumG = 0, sumB = 0;

  // Background color is #0f1117 (R=15, G=17, B=23)
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      const alpha = data[idx + 3];
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const diffR = Math.abs(r - 15);
      const diffG = Math.abs(g - 17);
      const diffB = Math.abs(b - 23);
      const isInk = alpha > 40 && (diffR > 25 || diffG > 25 || diffB > 25 || r > 45 || g > 45 || b > 45);

      if (isInk) {
        drawnPixels++;
        sumR += r;
        sumG += g;
        sumB += b;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Minimum 35 sampled ink pixels required for sketch detection
  if (drawnPixels < 35) return null;

  const boxW = Math.max(2, maxX - minX);
  const boxH = Math.max(2, maxY - minY);
  const userGrid = makeEmptyGrid();

  for (let gy = 0; gy < 28; gy++) {
    for (let gx = 0; gx < 28; gx++) {
      const sampleX = minX + Math.floor((gx / 28) * boxW);
      const sampleY = minY + Math.floor((gy / 28) * boxH);
      const idx = (sampleY * w + sampleX) * 4;
      const alpha = data[idx + 3];
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const diffR = Math.abs(r - 15);
      const diffG = Math.abs(g - 17);
      const diffB = Math.abs(b - 23);
      const isInk = alpha > 40 && (diffR > 25 || diffG > 25 || diffB > 25 || r > 45 || g > 45 || b > 45);

      if (isInk) {
        userGrid[gy][gx] = 1;
      }
    }
  }

  const avgR = Math.round(sumR / drawnPixels);
  const avgG = Math.round(sumG / drawnPixels);
  const avgB = Math.round(sumB / drawnPixels);
  const dominantColorTag = rgbToColorTag(avgR, avgG, avgB);

  return {
    userGrid,
    boxW,
    boxH,
    aspectRatio: boxW / boxH,
    drawnPixels,
    dominantColorTag,
    avgColor: { r: avgR, g: avgG, b: avgB },
  };
}

/**
 * Computes cosine similarity between user grid and prototype grid
 */
function computePrototypeSimilarity(userGrid, protoGrid) {
  let dot = 0;
  let userNorm = 0;
  let protoNorm = 0;

  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const u = userGrid[y][x];
      const p = protoGrid[y][x];
      dot += u * p;
      userNorm += u * u;
      protoNorm += p * p;
    }
  }

  if (userNorm === 0 || protoNorm === 0) return 0;
  return dot / (Math.sqrt(userNorm) * Math.sqrt(protoNorm));
}

/**
 * Real-Time Sketch Classification Engine with Multi-Part Structural Validation & Completeness Scaling
 */
export function classifySketch(canvas, strokesHistory = []) {
  if (Array.isArray(strokesHistory) && strokesHistory.length === 0) {
    return {
      empty: true,
      topPrediction: null,
      predictions: [],
      timestamp: Date.now(),
      drawnPixels: 0,
    };
  }

  const extracted = extractCanvas28x28(canvas);
  if (!extracted || extracted.drawnPixels < 35) {
    return {
      empty: true,
      topPrediction: null,
      predictions: [],
      timestamp: Date.now(),
      drawnPixels: extracted?.drawnPixels || 0,
    };
  }

  const { userGrid, aspectRatio, drawnPixels, dominantColorTag } = extracted;

  // Completeness ramp: Scale down premature guesses until drawing has substantive strokes (>= 80 ink pixels)
  const completenessFactor = Math.min(1.0, Math.max(0.40, drawnPixels / 85));

  // Compute highest similarity across prototype variants for each category
  const scored = SKETCH_CATEGORIES.map((cat) => {
    const protos = PROTOTYPE_BANK[cat.id] || [];
    let maxSim = 0.1;
    for (const proto of protos) {
      const sim = computePrototypeSimilarity(userGrid, proto);
      if (sim > maxSim) maxSim = sim;
    }

    let sim = maxSim;

    // 1. Chromatic Color Bonus (only applies if drawing has formed enough to be identifiable)
    if (cat.colorTags && cat.colorTags.includes(dominantColorTag) && drawnPixels >= 50) {
      if (dominantColorTag === "red" && (cat.id === "apple" || cat.id === "heart" || cat.id === "flame")) {
        sim += 0.18;
      } else if (dominantColorTag === "green" && (cat.id === "tree" || cat.id === "apple")) {
        sim += 0.18;
      } else if (dominantColorTag === "cyan_blue" && (cat.id === "diamond" || cat.id === "fish" || cat.id === "boat" || cat.id === "potion")) {
        sim += 0.16;
      } else if (dominantColorTag === "yellow" && (cat.id === "sun" || cat.id === "star" || cat.id === "crown" || cat.id === "lightning" || cat.id === "smile")) {
        sim += 0.14;
      } else if (dominantColorTag === "purple_pink" && (cat.id === "potion" || cat.id === "hat" || cat.id === "flower" || cat.id === "heart")) {
        sim += 0.16;
      } else if (dominantColorTag === "brown" && (cat.id === "tree" || cat.id === "guitar" || cat.id === "house" || cat.id === "cup")) {
        sim += 0.15;
      } else {
        sim += 0.08;
      }
    }

    // 2. Multi-Part Structural Checks (Requires both anatomy parts before boosting)
    if (cat.id === "bow") {
      const hasLeftArc = userGrid[14][4] === 1 || userGrid[14][5] === 1 || userGrid[14][6] === 1;
      const hasRightArrow = (userGrid[4][18] === 1 || userGrid[4][19] === 1 || userGrid[4][20] === 1) &&
                            (userGrid[24][18] === 1 || userGrid[24][19] === 1 || userGrid[24][20] === 1);
      const hasHorizontalArrow = (userGrid[14][3] === 1 && userGrid[14][25] === 1);

      if (hasLeftArc && (hasRightArrow || hasHorizontalArrow) && drawnPixels >= 55) {
        sim += 0.45;
      } else if (hasLeftArc && drawnPixels >= 40) {
        sim += 0.15;
      }
    } else if (cat.id === "fish") {
      const rightWaist = userGrid[14][19] === 1 || userGrid[14][20] === 1;
      const rightFinTop = userGrid[7][26] === 1 || userGrid[8][26] === 1;
      const rightFinBot = userGrid[20][26] === 1 || userGrid[21][26] === 1;

      const leftWaist = userGrid[14][8] === 1 || userGrid[14][9] === 1;
      const leftFinTop = userGrid[7][2] === 1 || userGrid[8][2] === 1;
      const leftFinBot = userGrid[20][2] === 1 || userGrid[21][2] === 1;

      const hasRightTail = rightWaist && (rightFinTop || rightFinBot);
      const hasLeftTail = leftWaist && (leftFinTop || leftFinBot);
      const isOvalBody = userGrid[14][13] === 1 || userGrid[14][14] === 1;

      if ((hasRightTail || hasLeftTail) && isOvalBody && aspectRatio > 1.15 && drawnPixels >= 55) {
        sim += 0.40;
      } else {
        sim = Math.min(sim, 0.18);
      }
    } else if (cat.id === "tree") {
      // Tree MUST have a trunk at bottom (y 18..26) AND broader canopy/foliage at top (y 4..14)
      const hasTrunk = (userGrid[22][13] === 1 || userGrid[22][14] === 1 || userGrid[22][15] === 1 || userGrid[25][14] === 1);
      const hasCanopy = (userGrid[8][6] === 1 || userGrid[8][21] === 1 || userGrid[10][14] === 1 || userGrid[6][14] === 1);
      if (hasTrunk && hasCanopy && drawnPixels >= 60) {
        sim += 0.35;
      } else if (!hasCanopy) {
        // Without canopy, a single vertical line is just a line, NOT a tree!
        sim = Math.min(sim, 0.15);
      }
    } else if (cat.id === "apple") {
      // Apple MUST have a round enclosed body (left/right/bottom lobes) PLUS top stem
      const hasLeftLobe = userGrid[14][6] === 1 || userGrid[14][7] === 1;
      const hasRightLobe = userGrid[14][21] === 1 || userGrid[14][22] === 1;
      const hasBottomLobe = userGrid[23][14] === 1 || userGrid[24][14] === 1;
      const hasStem = userGrid[2][14] === 1 || userGrid[3][14] === 1 || userGrid[4][14] === 1;

      if (hasLeftLobe && hasRightLobe && hasBottomLobe && hasStem && drawnPixels >= 60) {
        sim += 0.38;
      } else if (!hasLeftLobe || !hasRightLobe) {
        // Without an apple body, a partial stroke is NOT an apple
        sim = Math.min(sim, 0.18);
      }
    } else if (cat.id === "sword") {
      // Sword MUST have long blade AND horizontal crossguard
      const hasLongBlade = userGrid[4][14] === 1 && userGrid[24][14] === 1;
      const hasCrossguard = (userGrid[18][7] === 1 || userGrid[18][8] === 1) && (userGrid[18][20] === 1 || userGrid[18][21] === 1);
      if (hasLongBlade && hasCrossguard && drawnPixels >= 55) {
        sim += 0.40;
      } else if (!hasCrossguard) {
        sim = Math.min(sim, 0.22);
      }
    } else if (cat.id === "star") {
      if (userGrid[3][14] === 1 && userGrid[24][7] === 1 && userGrid[24][21] === 1 && drawnPixels >= 50) {
        sim += 0.35;
      }
    } else if (cat.id === "car") {
      const hasWheels = (userGrid[23][7] === 1 || userGrid[24][7] === 1) && (userGrid[23][20] === 1 || userGrid[24][20] === 1);
      const hasRoof = userGrid[11][14] === 1 || userGrid[12][14] === 1;
      if (hasWheels && hasRoof && aspectRatio > 1.25 && drawnPixels >= 60) {
        sim += 0.38;
      } else {
        sim = Math.min(sim, 0.20);
      }
    } else if (cat.id === "heart") {
      const hasTopDip = userGrid[5][13] === 0 && userGrid[5][14] === 0 && (userGrid[5][8] === 1 || userGrid[5][20] === 1);
      const hasBottomV = userGrid[25][14] === 1 && userGrid[25][4] === 0 && userGrid[25][23] === 0;
      if (hasTopDip && hasBottomV && drawnPixels >= 50) {
        sim += 0.38;
      } else {
        sim = Math.min(sim, 0.15);
      }
    }

    // Apply completeness scaling so unfinished 10% sketches don't jump to max score
    const adjustedScore = Math.max(0.05, Math.min(0.99, sim * completenessFactor));

    return {
      ...cat,
      score: adjustedScore,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];
  const confidence = Math.round(Math.min(99, Math.max(12, top.score * 105)));

  const topPrediction = {
    id: top.id,
    name: top.name,
    icon: top.icon,
    confidence,
    hints: top.hints,
  };

  const predictions = scored.slice(0, 5).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    confidence: Math.round(Math.min(99, Math.max(5, s.score * 100))),
    hints: s.hints,
  }));

  return {
    empty: false,
    topPrediction,
    predictions,
    timestamp: Date.now(),
    drawnPixels,
  };
}

/**
 * Google QuickDraw Official Neural Network Inference
 * Passes stroke trajectories to Google's handwriting/doodle recognition model
 * with fallback to local Prototypical Pattern Engine.
 */
export async function classifyWithDeepLearning(canvas, strokesData = []) {
  const localResult = classifySketch(canvas, strokesData);
  if (!strokesData || strokesData.length === 0) return localResult;

  try {
    const payload = {
      input_type: 0,
      requests: [
        {
          language: "quickdraw",
          writing_guide: { width: canvas.width || 700, height: canvas.height || 500 },
          ink: strokesData,
        },
      ],
    };

    const res = await fetch("https://inputtools.google.com/request?ime=handwriting&app=quickdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const guesses = data[1]?.[0]?.[1] || [];

    if (guesses && guesses.length > 0) {
      for (let i = 0; i < guesses.length; i++) {
        const guess = guesses[i].toLowerCase().trim();
        const matched = SKETCH_CATEGORIES.find(
          (cat) =>
            cat.id === guess ||
            cat.name.toLowerCase() === guess ||
            cat.syns.some((syn) => syn.toLowerCase() === guess || guess.includes(syn.toLowerCase()))
        );

        if (matched) {
          const confidence = Math.max(78, 99 - i * 4);
          const topGuess = {
            id: matched.id,
            name: matched.name,
            icon: matched.icon,
            confidence,
            hints: matched.hints,
          };

          return {
            empty: false,
            topPrediction: topGuess,
            predictions: [
              topGuess,
              ...localResult.predictions.filter((p) => p.id !== matched.id),
            ].slice(0, 5),
            timestamp: Date.now(),
            drawnPixels: localResult.drawnPixels || 0,
          };
        }
      }
    }
  } catch {
    // Fallback to local prototypical matching
  }

  return localResult;
}
