import React, { createContext, useContext, useState, useEffect } from "react";
import { walletService } from "../services/wallet/index.js";

const AuthWalletContext = createContext(null);

export const useAuthWallet = () => {
  const context = useContext(AuthWalletContext);
  if (!context) {
    throw new Error("useAuthWallet must be used within an AuthWalletProvider");
  }
  return context;
};

export function AuthWalletProvider({ children }) {
  // Warrior Profile State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sr_warrior");
      return saved
        ? JSON.parse(saved)
        : {
            name: "Vedansh",
            role: "Dragon Emperor",
            level: 14,
            coins: 3500,
            wins: 18,
            matches: 24,
            avatarColor: "#f59e0b",
            isAuthenticated: true,
          };
    } catch {
      return {
        name: "Vedansh",
        role: "Dragon Emperor",
        level: 14,
        coins: 3500,
        wins: 18,
        matches: 24,
        avatarColor: "#f59e0b",
        isAuthenticated: true,
      };
    }
  });

  // Web3 Wallet State
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = localStorage.getItem("sr_wallet");
      return saved
        ? JSON.parse(saved)
        : {
            isConnected: false,
            address: null,
            balance: "0.00 ETH",
            network: "Ethereum Mainnet",
            isMetaMask: false,
          };
    } catch {
      return {
        isConnected: false,
        address: null,
        balance: "0.00 ETH",
        network: "Ethereum Mainnet",
        isMetaMask: false,
      };
    }
  });

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem("sr_warrior", JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("sr_wallet", JSON.stringify(wallet));
    } catch {}
  }, [wallet]);

  // Hook into active wallet adapter event streams
  useEffect(() => {
    const metaMaskAdapter = walletService.getAdapter("metamask");

    const cleanupAccounts = metaMaskAdapter.onAccountsChanged((accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else if (wallet.isConnected && wallet.isMetaMask) {
        setWallet((prev) => ({
          ...prev,
          address: accounts[0],
        }));
      }
    });

    const cleanupChain = metaMaskAdapter.onChainChanged(() => {
      // Handled gracefully
    });

    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, [wallet.isConnected, wallet.isMetaMask]);

  // Connect via real MetaMask extension
  const connectMetaMask = async () => {
    const res = await walletService.connect("metamask");
    if (res.success) {
      setWallet(res.wallet);
    }
    return res;
  };

  // Instant Demo Dragon Vault Wallet
  const connectDemoWallet = async () => {
    const res = await walletService.connect("demo");
    if (res.success) {
      setWallet(res.wallet);
    }
    return res;
  };

  // Disconnect Wallet
  const disconnectWallet = async () => {
    const disconnectedState = await walletService.disconnect();
    setWallet(disconnectedState);
  };

  // Reward coins for winning or solving
  const addCoins = (amount) => {
    setUser((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  // Update warrior name
  const setWarriorName = (name) => {
    const clean = String(name || "").trim().slice(0, 20);
    if (!clean) return;
    setUser((prev) => ({
      ...prev,
      name: clean,
    }));
    try {
      localStorage.setItem("skribl:username", clean);
    } catch {}
  };

  // Login action
  const login = (name, role = "Dragon Warrior", color = "#f59e0b") => {
    const clean = String(name || "").trim().slice(0, 20) || "Warrior";
    const newUser = {
      name: clean,
      role,
      level: 12,
      coins: 2500,
      wins: 14,
      matches: 20,
      avatarColor: color,
      isAuthenticated: true,
    };
    setUser(newUser);
    localStorage.setItem("skribl:username", clean);
  };

  // Logout action
  const logout = () => {
    const guest = {
      name: "Guest Warrior",
      role: "Novice",
      level: 1,
      coins: 0,
      wins: 0,
      matches: 0,
      avatarColor: "#64748b",
      isAuthenticated: false,
    };
    setUser(guest);
    disconnectWallet();
    localStorage.removeItem("sr_warrior");
    localStorage.removeItem("skribl:username");
  };

  return (
    <AuthWalletContext.Provider
      value={{
        user,
        wallet,
        soundEnabled,
        setSoundEnabled,
        connectMetaMask,
        connectDemoWallet,
        disconnectWallet,
        addCoins,
        setWarriorName,
        login,
        logout,
      }}
    >
      {children}
    </AuthWalletContext.Provider>
  );
}
