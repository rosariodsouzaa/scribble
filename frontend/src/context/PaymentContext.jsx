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
  const { addCoins, user, wallet, refreshWalletBalance, deductWalletBalance } = useAuthWallet();

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

  // Process Web3 token payment with real-time on-chain progression and official receipt delivery
  const processPayment = async ({ item, method = "metamask", email, onStepChange }) => {
    const initialWalletBalance = wallet?.balance || "0.0000 ETH";
    const costEth = parseFloat(item.priceEth || "0.002");

    const strategy = PaymentProcessorFactory.getStrategy(method);
    const result = await strategy.process(item, {
      walletAddress: wallet?.address,
      network: wallet?.network,
      isMetaMask: wallet?.isMetaMask,
      onStepChange,
    });

    if (!result.success) {
      return result;
    }

    // Immediately deduct tokens from client wallet state and storage
    if (typeof deductWalletBalance === "function") {
      deductWalletBalance(costEth);
    }

    // Calculate deducted and remaining balance values
    const curVal = parseFloat(String(initialWalletBalance).replace(/[^0-9.]/g, "")) || 0;
    const remainingBalance = `${Math.max(0, curVal - costEth).toFixed(4)} ETH`;

    // Call backend to credit gold in DB and dispatch professional email receipt
    let backendReceipt = null;
    try {
      const resp = await fetch("/api/payments/verify-and-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || "Warrior",
          email: email || user?.email,
          walletAddress: wallet?.address || result.transaction?.walletAddress,
          txHash: result.transaction?.hash,
          network: wallet?.network || result.transaction?.network,
          item,
          amountPaid: result.transaction?.amount,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        backendReceipt = data.receipt;
        result.receipt = {
          ...data.receipt,
          initialBalance: initialWalletBalance,
          remainingBalance,
          deductedAmount: `${costEth.toFixed(4)} ETH`,
        };
      }
    } catch (err) {
      console.warn("[PaymentContext] Backend receipt service failed:", err);
    }

    // If backend didn't return a receipt object, generate a fallback receipt object for UI
    if (!result.receipt) {
      result.receipt = {
        id: `RCP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        item: item.name,
        amount: result.transaction?.amount || `${costEth.toFixed(4)} ETH`,
        goldAmount: item.goldAmount,
        walletAddress: wallet?.address || result.transaction?.walletAddress,
        txHash: result.transaction?.hash,
        network: wallet?.network || result.transaction?.network,
        email: email || user?.email,
        initialBalance: initialWalletBalance,
        remainingBalance,
        deductedAmount: `${costEth.toFixed(4)} ETH`,
      };
    } else {
      result.receipt.initialBalance = initialWalletBalance;
      result.receipt.remainingBalance = remainingBalance;
      result.receipt.deductedAmount = `${costEth.toFixed(4)} ETH`;
    }

    // Award in-game items
    if (item.category === "gold") {
      addCoins(item.goldAmount);
    } else {
      setOwnedItems((prev) => [...new Set([...prev, item.id])]);
      if (item.category === "brush") {
        setEquippedBrush(item.id);
      }
    }

    // Create transaction record with balance changes
    if (result.transaction) {
      const finalTx = {
        ...result.transaction,
        receiptId: result.receipt.id,
        email: email || user?.email,
        initialBalance: initialWalletBalance,
        remainingBalance,
      };
      setTransactions((prev) => [finalTx, ...prev]);
    }

    // Refresh on-chain balance after block mining interval
    if (wallet?.isMetaMask && typeof refreshWalletBalance === "function") {
      setTimeout(() => {
        refreshWalletBalance().catch(() => {});
      }, 2500);
    }

    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
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
