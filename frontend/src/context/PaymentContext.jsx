import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthWallet } from "./AuthWalletContext.jsx";
import { sound } from "../lib/sound.js";
import confetti from "canvas-confetti";
import { PaymentProcessorFactory } from "../services/payment/index.js";
import { storeCatalog } from "../services/store/index.js";

const PaymentContext = createContext(null);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};

export function PaymentProvider({ children }) {
  const { addCoins, user } = useAuthWallet();

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

  // Buy with Dragon Gold directly using GoldVaultPaymentStrategy
  const buyWithGold = async (item) => {
    const strategy = PaymentProcessorFactory.getStrategy("gold");
    const result = await strategy.process(item, { currentCoins: user.coins });

    if (!result.success) {
      return result;
    }

    addCoins(-item.goldCost);
    setOwnedItems((prev) => [...new Set([...prev, item.id])]);
    setEquippedBrush(item.id);

    if (result.transaction) {
      setTransactions((prev) => [result.transaction, ...prev]);
    }

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      sound.playVictoryFanfare();
    } catch {}

    return { success: true };
  };

  // Process payment across multiple rails using Strategy pattern
  const processPayment = async ({ item, method, cardDetails, upiId }) => {
    const strategy = PaymentProcessorFactory.getStrategy(method);
    const result = await strategy.process(item, {
      cardNumber: cardDetails?.number,
      upiId,
    });

    if (!result.success) {
      return result;
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
    if (result.transaction) {
      setTransactions((prev) => [result.transaction, ...prev]);
    }

    try {
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.55 } });
      sound.playVictoryFanfare();
    } catch {}

    return result;
  };

  return (
    <PaymentContext.Provider
      value={{
        items: storeCatalog.getAllItems(),
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
