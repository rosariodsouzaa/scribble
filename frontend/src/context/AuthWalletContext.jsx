import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { walletService } from "../services/wallet/index.js";
import { IdentityManager } from "../services/identity/index.js";
import { AuthService } from "../services/auth/AuthService.js";

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
  const [user, setUser] = useState(() => IdentityManager.getWarriorProfile());
  const [token, setToken] = useState(() => AuthService.getToken());
  const [authLoading, setAuthLoading] = useState(true);

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

  // Synchronize authenticated session from backend on startup
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        // Seed demo accounts in background if needed
        AuthService.seedDemoAccounts().catch(() => {});

        const savedToken = AuthService.getToken();
        if (savedToken) {
          const backendUser = await AuthService.getMe();
          if (backendUser && isMounted) {
            setUser({
              ...backendUser,
              isAuthenticated: true,
            });
            IdentityManager.saveWarriorProfile(backendUser);
          }
        }
      } catch (err) {
        console.warn("[AuthWallet] Session restore failed:", err.message);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync profile to local storage
  useEffect(() => {
    if (user && user.name) {
      IdentityManager.saveWarriorProfile(user);
    }
  }, [user]);

  // Sync wallet state to storage
  useEffect(() => {
    try {
      localStorage.setItem("sr_wallet", JSON.stringify(wallet));
    } catch {}
  }, [wallet]);

  // MetaMask wallet event listeners
  useEffect(() => {
    const metaMaskAdapter = walletService.getAdapter("metamask");

    const cleanupAccounts = metaMaskAdapter.onAccountsChanged(({ accounts, address, balance }) => {
      if (!accounts || accounts.length === 0 || !address) {
        disconnectWallet();
      } else if (wallet.isConnected && wallet.isMetaMask) {
        setWallet((prev) => ({
          ...prev,
          address,
          balance: balance || prev.balance,
        }));
      }
    });

    const cleanupChain = metaMaskAdapter.onChainChanged(() => {});

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
  const addCoins = useCallback(
    (amount) => {
      setUser((prev) => {
        const nextCoins = Math.max(0, (Number(prev.coins) || 0) + Number(amount));
        const updated = { ...prev, coins: nextCoins };
        IdentityManager.saveWarriorProfile(updated);
        return updated;
      });
    },
    []
  );

  // Update warrior name locally
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

  // Login via Email & Password with JWT
  const loginWithCredentials = async (email, password) => {
    const res = await AuthService.login({ email, password });
    if (res.user && res.token) {
      setToken(res.token);
      const userProfile = {
        ...res.user,
        isAuthenticated: true,
      };
      setUser(userProfile);
      IdentityManager.saveWarriorProfile(userProfile);
      if (res.user.name) {
        localStorage.setItem("skribl:username", res.user.name);
      }
    }
    return res;
  };

  // Signup with OTP verification and JWT
  const signupWithOtp = async ({ name, email, password, otp, avatarColor, title }) => {
    const res = await AuthService.signup({ name, email, password, otp, avatarColor, title });
    if (res.user && res.token) {
      setToken(res.token);
      const userProfile = {
        ...res.user,
        isAuthenticated: true,
      };
      setUser(userProfile);
      IdentityManager.saveWarriorProfile(userProfile);
      if (res.user.name) {
        localStorage.setItem("skribl:username", res.user.name);
      }
    }
    return res;
  };

  // Update warrior profile on backend
  const updateUserProfile = async (updates) => {
    try {
      const updatedUser = await AuthService.updateProfile(updates);
      if (updatedUser) {
        const fullUser = {
          ...user,
          ...updatedUser,
          isAuthenticated: true,
        };
        setUser(fullUser);
        IdentityManager.saveWarriorProfile(fullUser);
        if (updatedUser.name) {
          localStorage.setItem("skribl:username", updatedUser.name);
        }
        return fullUser;
      }
    } catch (err) {
      // Fallback local update if offline
      const fullUser = { ...user, ...updates };
      setUser(fullUser);
      IdentityManager.saveWarriorProfile(fullUser);
      return fullUser;
    }
  };

  // Legacy quick login support
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

  // Complete Logout action
  const logout = () => {
    AuthService.setToken(null);
    setToken("");
    const guest = {
      name: "Guest Warrior",
      email: "",
      role: "user",
      title: "Novice Warrior",
      level: 1,
      coins: 0,
      wins: 0,
      matches: 0,
      avatarColor: "#64748b",
      bio: "A wandering warrior of the realm.",
      isAuthenticated: false,
    };
    setUser(guest);
    disconnectWallet();
    localStorage.removeItem("sr_warrior");
    localStorage.removeItem("skribl:username");
  };

  const isAdmin = Boolean(user && user.role === "admin");

  return (
    <AuthWalletContext.Provider
      value={{
        user,
        token,
        isAdmin,
        authLoading,
        wallet,
        soundEnabled,
        setSoundEnabled,
        connectMetaMask,
        connectDemoWallet,
        disconnectWallet,
        addCoins,
        setWarriorName,
        loginWithCredentials,
        signupWithOtp,
        updateUserProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthWalletContext.Provider>
  );
}

export default AuthWalletContext;
