import { WalletAdapter } from "./WalletAdapter.js";

/**
 * Concrete MetaMask Wallet Adapter
 * Encapsulates communication with window.ethereum provider, live network resolution,
 * auto-balance syncing, and reactive listener management.
 */
export class MetaMaskAdapter extends WalletAdapter {
  static NETWORK_MAP = {
    "0x1": "Ethereum Mainnet",
    "0x5": "Goerli Testnet",
    "0xaa36a7": "Ethereum Sepolia (Testnet)",
    "0x89": "Polygon Mainnet",
    "0x13881": "Polygon Mumbai",
    "0x13882": "Polygon Amoy",
    "0xa4b1": "Arbitrum One",
    "0xa": "Optimism Mainnet",
    "0x38": "BNB Smart Chain",
    "0x61": "BNB Testnet",
    "0x539": "Localhost (Hardhat)",
    "0x7a69": "Localhost (Anvil)",
  };

  static getNetworkName(chainId) {
    if (!chainId) return "Ethereum Mainnet";
    const hex = String(chainId).toLowerCase();
    return MetaMaskAdapter.NETWORK_MAP[hex] || `Chain ${hex}`;
  }

  /**
   * Safely resolves the injected MetaMask provider even if multiple web3 wallet extensions exist
   */
  static getProvider() {
    if (typeof window === "undefined") return null;
    if (window.ethereum?.providers?.length) {
      return (
        window.ethereum.providers.find((p) => p.isMetaMask && !p.isPhantom) ||
        window.ethereum.providers.find((p) => p.isMetaMask) ||
        window.ethereum.providers[0]
      );
    }
    return window.ethereum || null;
  }

  constructor() {
    super("MetaMask");
  }

  async isAvailable() {
    if (typeof window === "undefined") return false;
    if (MetaMaskAdapter.getProvider()) return true;
    await new Promise((r) => setTimeout(r, 150));
    return Boolean(MetaMaskAdapter.getProvider());
  }

  async connect() {
    const provider = MetaMaskAdapter.getProvider();
    if (!provider) {
      return {
        success: false,
        error: "MetaMask extension not detected in this browser. Please install MetaMask to continue.",
      };
    }

    try {
      if (typeof provider.setMaxListeners === "function") {
        provider.setMaxListeners(25);
      }
    } catch {}

    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return { success: false, error: "No Ethereum accounts authorized in MetaMask." };
      }

      const address = accounts[0];
      const balance = await this.getBalance(address);
      const chainId = await provider.request({ method: "eth_chainId" }).catch(() => "0x1");
      const network = MetaMaskAdapter.getNetworkName(chainId);

      return {
        success: true,
        wallet: {
          isConnected: true,
          address,
          balance,
          network,
          chainId,
          isMetaMask: true,
          adapterType: "metamask",
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || "User rejected MetaMask connection request.",
      };
    }
  }

  async getBalance(address) {
    const provider = MetaMaskAdapter.getProvider();
    if (!address || !provider) {
      return "0.0000 ETH";
    }
    try {
      const rawBalance = await provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const wei = BigInt(rawBalance || "0x0");
      const ethVal = (Number(wei) / 1e18).toFixed(4);
      return `${ethVal} ETH`;
    } catch {
      return "0.0000 ETH";
    }
  }

  async refreshBalance(address) {
    return this.getBalance(address);
  }

  onAccountsChanged(callback) {
    const provider = MetaMaskAdapter.getProvider();
    if (!provider?.on) return () => {};

    const handler = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        callback({ accounts: [], address: null, balance: "0.0000 ETH" });
        return;
      }
      const address = accounts[0];
      const balance = await this.getBalance(address);
      const chainId = await provider.request({ method: "eth_chainId" }).catch(() => "0x1");
      const network = MetaMaskAdapter.getNetworkName(chainId);
      callback({ accounts, address, balance, network, chainId });
    };

    provider.on("accountsChanged", handler);

    return () => {
      if (provider?.removeListener) {
        provider.removeListener("accountsChanged", handler);
      }
    };
  }

  onChainChanged(callback) {
    const provider = MetaMaskAdapter.getProvider();
    if (!provider?.on) return () => {};

    const handler = async (chainId) => {
      const network = MetaMaskAdapter.getNetworkName(chainId);
      callback({ chainId, network });
    };

    provider.on("chainChanged", handler);

    return () => {
      if (provider?.removeListener) {
        provider.removeListener("chainChanged", handler);
      }
    };
  }
}
