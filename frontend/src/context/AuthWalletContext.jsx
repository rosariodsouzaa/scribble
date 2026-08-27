import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Connect via real MetaMask extension
  const connectMetaMask = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        let balance = "1.50 ETH";
        try {
          const rawBalance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          });
          const ethVal = (parseInt(rawBalance, 16) / 1e18).toFixed(3);
          balance = `${ethVal} ETH`;
        } catch {}

        const newWallet = {
          isConnected: true,
          address,
          balance,
          network: "Ethereum Mainnet",
          isMetaMask: true,
        };
        setWallet(newWallet);
        return { success: true, wallet: newWallet };
      } catch (err) {
        return { success: false, error: err.message || "User rejected connection." };
      }
    } else {
      // Fallback to Instant Dragon Vault (Demo Mode) if MetaMask extension isn't found
      return connectDemoWallet();
    }
  };

  // Instant Demo Dragon Vault Wallet (One-click for testing/mobile)
  const connectDemoWallet = () => {
    const demoAddress = "0x71C" + Math.random().toString(16).substring(2, 8).toUpperCase() + "3A9E8";
    const demoWallet = {
      isConnected: true,
      address: demoAddress,
      balance: "2.45 ETH",
      network: "Ethereum Sepolia (Testnet)",
      isMetaMask: false,
    };
    setWallet(demoWallet);
    return { success: true, wallet: demoWallet };
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: "0.00 ETH",
      network: "Ethereum Mainnet",
      isMetaMask: false,
    });
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
      localStorage.setItem("skribl_username", clean);
    } catch {}
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
      }}
    >
      {children}
    </AuthWalletContext.Provider>
  );
}
