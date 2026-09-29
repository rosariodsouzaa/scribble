import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthWallet } from "./AuthWalletContext.jsx";
import { sound } from "../lib/sound.js";
import confetti from "canvas-confetti";
import { PaymentProcessorFactory } from "../services/payment/index.js";
import { storeCatalog } from "../services/store/index.js";
import { AuthService } from "../services/auth/AuthService.js";

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

  // Get active account identifier
  const getAccountKey = useCallback(() => {
    if (user?.id) return `user_${user.id}`;
    if (user?.email) return `email_${String(user.email).toLowerCase().trim()}`;
    if (wallet?.isConnected && wallet?.address) return `wallet_${String(wallet.address).toLowerCase().trim()}`;
    return null;
  }, [user?.id, user?.email, wallet?.isConnected, wallet?.address]);

  const currentAccountKey = getAccountKey();

  // Transaction history - strictly scoped to current account
  const [transactions, setTransactions] = useState(() => {
    try {
      localStorage.removeItem("sr_transactions"); // Purge legacy un-scoped cache
      const key = (user?.id ? `user_${user.id}` : (user?.email ? `email_${String(user.email).toLowerCase().trim()}` : (wallet?.isConnected && wallet?.address ? `wallet_${String(wallet.address).toLowerCase().trim()}` : null)));
      if (!key) return [];
      const saved = localStorage.getItem(`sr_tx_${key}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loadingTransactions, setLoadingTransactions] = useState(false);

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

  // Sync transactions to account-scoped local storage
  useEffect(() => {
    try {
      if (currentAccountKey) {
        localStorage.setItem(`sr_tx_${currentAccountKey}`, JSON.stringify(transactions));
      }
    } catch {}
  }, [transactions, currentAccountKey]);

  // When active account changes, reload account-specific transactions
  useEffect(() => {
    if (!currentAccountKey) {
      setTransactions([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`sr_tx_${currentAccountKey}`);
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    }
  }, [currentAccountKey]);

  // Fetch transactions from backend API (strictly scoped for players, overall kingdom for Admins)
  const fetchTransactions = useCallback(async () => {
    const isAdm = Boolean(user?.role === "admin" || user?.accountType === "admin");

    if (isAdm) {
      setLoadingTransactions(true);
      try {
        const allTx = await AuthService.getAdminTransactions();
        setTransactions(Array.isArray(allTx) ? allTx : []);
      } catch (err) {
        console.warn("[PaymentContext] Could not fetch admin overall transactions:", err.message);
      } finally {
        setLoadingTransactions(false);
      }
      return;
    }

    const accKey = getAccountKey();
    if (!accKey) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    try {
      const params = new URLSearchParams();
      if (user?.id) params.append("userId", String(user.id));
      if (user?.email) params.append("email", String(user.email));
      if (wallet?.address) params.append("walletAddress", String(wallet.address));

      const res = await fetch(`/api/payments/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const serverTransactions = Array.isArray(data.transactions) ? data.transactions : [];

        // Strict verification: only retain transactions belonging to this current account
        const filteredServer = serverTransactions.filter((tx) => {
          const matchUser = user?.id && String(tx.userId || "") === String(user.id);
          const matchEmail = user?.email && String(tx.email || "").toLowerCase().trim() === String(user.email).toLowerCase().trim();
          const matchWallet = wallet?.address && String(tx.walletAddress || "").toLowerCase().trim() === String(wallet.address).toLowerCase().trim();
          return Boolean(matchUser || matchEmail || matchWallet);
        });

        setTransactions((prev) => {
          const map = new Map();
          // Insert verified server transactions
          filteredServer.forEach((tx) => map.set(tx.id || tx.receiptId, tx));

          // Retain local transactions only if they belong to this current account
          prev.forEach((tx) => {
            const id = tx.id || tx.receiptId;
            const matchUser = user?.id && String(tx.userId || "") === String(user.id);
            const matchEmail = user?.email && String(tx.email || "").toLowerCase().trim() === String(user.email).toLowerCase().trim();
            const matchWallet = wallet?.address && String(tx.walletAddress || "").toLowerCase().trim() === String(wallet.address).toLowerCase().trim();
            if (id && (matchUser || matchEmail || matchWallet) && !map.has(id)) {
              map.set(id, tx);
            }
          });

          const merged = Array.from(map.values());
          return merged.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || 0).getTime();
            const dateB = new Date(b.createdAt || b.date || 0).getTime();
            return dateB - dateA;
          });
        });
      }
    } catch (err) {
      console.warn("[PaymentContext] Could not fetch server transactions:", err.message);
    } finally {
      setLoadingTransactions(false);
    }
  }, [getAccountKey, user?.id, user?.email, user?.role, user?.accountType, wallet?.address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

    // Record on backend ledger
    try {
      const resp = await fetch("/api/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          userName: user?.name || "Warrior",
          email: user?.email || "",
          walletAddress: wallet?.address || "",
          item,
          amount: `🪙 ${item.goldCost?.toLocaleString()} Gold`,
          paymentMethod: "Dragon Gold Vault",
          status: "COMPLETED",
          txHash: "VAULT-SETTLED",
          initialBalance: `${user?.coins?.toLocaleString() || 0} Gold`,
          remainingBalance: `${Math.max(0, (user?.coins || 0) - item.goldCost).toLocaleString()} Gold`,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.transaction) {
          result.transaction = data.transaction;
        }
      }
    } catch (err) {
      console.warn("[PaymentContext] Failed to record gold transaction on server:", err);
    }

    if (result.transaction) {
      const finalTx = {
        ...result.transaction,
        receiptId: result.transaction.id,
        userId: user?.id || null,
        email: user?.email || "",
        walletAddress: wallet?.address || "",
        item: item.name,
        itemName: item.name,
        category: item.category || "brush",
        method: "Dragon Gold Vault",
        paymentMethod: "Dragon Gold Vault",
        amount: `🪙 ${item.goldCost?.toLocaleString()} Gold`,
        date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        status: "COMPLETED",
      };
      setTransactions((prev) => [finalTx, ...prev]);
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
    let backendTx = null;
    try {
      const resp = await fetch("/api/payments/verify-and-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          userName: user?.name || "Warrior",
          email: email || user?.email || "",
          walletAddress: wallet?.address || result.transaction?.walletAddress || "",
          txHash: result.transaction?.hash,
          network: wallet?.network || result.transaction?.network,
          item,
          amountPaid: result.transaction?.amount || `${costEth.toFixed(4)} ETH`,
          initialBalance: initialWalletBalance,
          remainingBalance,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        backendReceipt = data.receipt;
        backendTx = data.transaction;
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
    const finalTx = backendTx || {
      id: result.receipt.id,
      receiptId: result.receipt.id,
      userId: user?.id || null,
      email: email || user?.email || "",
      walletAddress: wallet?.address || result.transaction?.walletAddress || "",
      item: item.name,
      itemName: item.name,
      category: item.category || "gold",
      amount: result.transaction?.amount || `${costEth.toFixed(4)} ETH`,
      goldAmount: item.goldAmount || 0,
      method: wallet?.isMetaMask ? "MetaMask (ETH)" : "Web3 Native Tokens",
      paymentMethod: wallet?.isMetaMask ? "MetaMask (ETH)" : "Web3 Native Tokens",
      status: "COMPLETED",
      hash: result.transaction?.hash || result.receipt?.txHash,
      txHash: result.transaction?.hash || result.receipt?.txHash,
      network: wallet?.network || result.transaction?.network,
      initialBalance: initialWalletBalance,
      remainingBalance,
      date: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
    };

    setTransactions((prev) => [finalTx, ...prev]);

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
        loadingTransactions,
        fetchTransactions,
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
