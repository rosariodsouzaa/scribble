import { StoreItem } from "./StoreItem.js";

/**
 * StoreCatalog Service
 * Encapsulates the inventory of available relics, cosmetics, gold packs, and queries.
 */
export class StoreCatalog {
  constructor() {
    this.items = [
      // Gold Bundles
      new StoreItem({
        id: "gold_5000",
        category: "gold",
        name: "Novice Pouch",
        description: "5,000 Dragon Gold coins to unlock custom avatars and brush trails.",
        goldAmount: 5000,
        priceUsd: 4.99,
        priceEth: "0.002",
        badge: "POPULAR",
        icon: "🪙",
        color: "#f59e0b",
      }),
      new StoreItem({
        id: "gold_15000",
        category: "gold",
        name: "Warrior Chest",
        description: "15,000 Dragon Gold coins (+20% bonus). Ideal for tournament wagers.",
        goldAmount: 15000,
        priceUsd: 11.99,
        priceEth: "0.005",
        badge: "+20% BONUS",
        icon: "💎",
        color: "#ffd700",
      }),
      new StoreItem({
        id: "gold_50000",
        category: "gold",
        name: "Emperor's Vault",
        description: "50,000 Dragon Gold coins (+40% bonus). Rule the Dynasty arena.",
        goldAmount: 50000,
        priceUsd: 29.99,
        priceEth: "0.012",
        badge: "BEST VALUE",
        icon: "👑",
        color: "#dc2626",
      }),

      // Season Pass
      new StoreItem({
        id: "season4_pass",
        category: "pass",
        name: "Season 4 VIP Dragon Pass",
        description:
          "Unlock all 20 tiers of Season 4 cosmetics, 2x Gold victory boost, and exclusive golden crown title.",
        priceUsd: 9.99,
        priceEth: "0.004",
        badge: "SEASON 4",
        icon: "📜",
        color: "#8b5cf6",
      }),

      // Legendary Brush Cosmetics
      new StoreItem({
        id: "brush_phoenix",
        category: "brush",
        name: "Phoenix Flame Brush",
        description: "Leaves a crackling flame trail with ember sparks as you draw on canvas.",
        priceUsd: 6.99,
        priceEth: "0.003",
        goldCost: 4000,
        badge: "LEGENDARY",
        icon: "🔥",
        color: "#ef4444",
        effect: "fire",
      }),
      new StoreItem({
        id: "brush_nebula",
        category: "brush",
        name: "Celestial Nebula Ink",
        description: "Draw with shifting cosmic stardust gradients and violet radiance.",
        priceUsd: 8.99,
        priceEth: "0.004",
        goldCost: 6000,
        badge: "MYTHIC",
        icon: "🌌",
        color: "#a855f7",
        effect: "nebula",
      }),
      new StoreItem({
        id: "brush_thunder",
        category: "brush",
        name: "Neon Thunderstroke",
        description: "Electric cyan strokes with high-voltage lightning discharge glow.",
        priceUsd: 5.99,
        priceEth: "0.0025",
        goldCost: 3500,
        badge: "RARE",
        icon: "⚡",
        color: "#06b6d4",
        effect: "lightning",
      }),
      new StoreItem({
        id: "brush_emperor",
        category: "brush",
        name: "Golden Emperor Dragon Aura",
        description: "Pure molten gold calligraphy ink with imperial dragon rune particles.",
        priceUsd: 14.99,
        priceEth: "0.006",
        goldCost: 10000,
        badge: "DYNASTY RELIC",
        icon: "🐉",
        color: "#ffd700",
        effect: "gold",
      }),
    ];
  }

  getAllItems() {
    return [...this.items];
  }

  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }

  getItemsByCategory(category) {
    return this.items.filter((item) => item.category === category);
  }
}

export const storeCatalog = new StoreCatalog();
