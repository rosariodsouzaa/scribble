import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthWallet } from "./AuthWalletContext.jsx";
import { sound } from "../lib/sound.js";
import confetti from "canvas-confetti";

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};

export const STORE_ITEMS = [
  // Gold Bundles
  {
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
  },
  {
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
  },
  {
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
  },

  // Season Pass
  {
    id: "season4_pass",
    category: "pass",
    name: "Season 4 VIP Dragon Pass",
    description: "Unlock all 20 tiers of Season 4 cosmetics, 2x Gold victory boost, and exclusive golden crown title.",
    priceUsd: 9.99,
    priceEth: "0.004",
    badge: "SEASON 4",
    icon: "📜",
    color: "#8b5cf6",
  },

  // Legendary Brush Cosmetics
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export function PaymentProvider({ children }) {
  const { addCoins, user, wallet } = useAuthWallet();

  // Owned item IDs
  const [ownedItems, setOwnedItems] = useState(() => {
    try {
      const saved = localStorage.getItem("sr_owned_items");
      return saved ? JSON.parse(saved) : ["brush_default"];
    } catch {
      return ["brush_default"];
    }
  });

  // Equipped brush skin
  const [equippedBrush, setEquippedBrush] = useState(() => {
    try {
      return localStorage.getItem("sr_equipped_brush") || "brush_default";
    } catch {
      return "brush_default";
    }
  });

  // Transaction history
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("sr_transactions");
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: "TX-94821",
              date: "2026-08-26 14:22",
              item: "Novice Pouch (5,000 Gold)",
              amount: "$4.99",
              method: "MetaMask (ETH)",
              status: "COMPLETED",
              hash: "0x3f8a...9e41",
            },
          ];
    } catch {
      return [];
    }
  });

  // Active checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("sr_owned_items", JSON.stringify(ownedItems));
    } catch {}
  }, [ownedItems]);

  useEffect(() => {
    try {
      localStorage.setItem("sr_equipped_brush", equippedBrush);
    } catch {}
  }, [equippedBrush]);

  useEffect(() => {
    try {
      localStorage.setItem("sr_transactions", JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  // Open checkout for an item
  const openCheckout = (item) => {
    setActiveItem(item);
    setCheckoutModalOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutModalOpen(false);
    setActiveItem(null);
  };

  // Equip a brush skin
  const equipBrush = (brushId) => {
    setEquippedBrush(brushId);
    sound.playCoinCollect();
  };

  // Buy with Dragon Gold directly
  const buyWithGold = (item) => {
    if (!item.goldCost) return { success: false, error: "Not purchasable with Gold." };
    if (user.coins < item.goldCost) {
      return { success: false, error: `Insufficient Gold. You need ${item.goldCost - user.coins} more Gold.` };
    }

    addCoins(-item.goldCost);
    setOwnedItems((prev) => [...new Set([...prev, item.id])]);
    setEquippedBrush(item.id);

    const newTx = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      item: item.name,
      amount: `🪙 ${item.goldCost.toLocaleString()} Gold`,
      method: "Dragon Gold Vault",
      status: "COMPLETED",
      hash: "INTERNAL-ROYALE",
    };
    setTransactions((prev) => [newTx, ...prev]);

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      sound.playVictoryFanfare();
    } catch {}

    return { success: true };
  };

  // Process payment across multiple rails
  const processPayment = async ({ item, method, cardDetails, upiId }) => {
    // Artificial slight latency for realistic gateway processing
    await new Promise((r) => setTimeout(r, 1200));

    let txHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    let methodDisplay = "Credit Card (Stripe)";

    if (method === "web3") {
      methodDisplay = `MetaMask (${item.priceEth} ETH)`;
      txHash = `0x${Math.random().toString(16).substring(2, 12)}...${Math.random().toString(16).substring(2, 6)}`;
    } else if (method === "upi") {
      methodDisplay = `UPI / QR Scan (${upiId || "Instant QR"})`;
      txHash = `UPI-REF-${Math.floor(100000000 + Math.random() * 900000000)}`;
    } else if (method === "paypal") {
      methodDisplay = "PayPal 1-Click";
      txHash = `PAYPAL-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Award items
    if (item.category === "gold") {
      addCoins(item.goldAmount);
    } else {
      setOwnedItems((prev) => [...new Set([...prev, item.id])]);
      if (item.category === "brush") {
        setEquippedBrush(item.id);
      }
    }

    // Create transaction record
    const newTx = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      item: item.name,
      amount: `$${item.priceUsd}`,
      method: methodDisplay,
      status: "COMPLETED",
      hash: txHash,
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.55 } });
      sound.playVictoryFanfare();
    } catch {}

    return { success: true, transaction: newTx };
  };

  return (
    <PaymentContext.Provider
      value={{
        items: STORE_ITEMS,
        ownedItems,
        equippedBrush,
        transactions,
        checkoutModalOpen,
        activeItem,
        openCheckout,
        closeCheckout,
        equipBrush,
        buyWithGold,
        processPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}
