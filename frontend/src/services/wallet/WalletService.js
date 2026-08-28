import { MetaMaskAdapter } from "./MetaMaskAdapter.js";
import { DemoVaultAdapter } from "./DemoVaultAdapter.js";

/**
 * WalletService Singleton & Facade
 * Coordinates active adapter, persistence, and state changes.
 */
export class WalletService {
  constructor() {
    this.adapters = {
      metamask: new MetaMaskAdapter(),
      demo: new DemoVaultAdapter(),
    };
    this.activeAdapter = null;
  }

  getAdapter(type) {
    return this.adapters[type] || this.adapters.demo;
  }

  async connect(type = "metamask") {
    const adapter = this.getAdapter(type);
    const available = await adapter.isAvailable();

    if (!available && type === "metamask") {
      // Fallback to demo adapter if MetaMask is not installed
      this.activeAdapter = this.adapters.demo;
      return this.adapters.demo.connect();
    }

    this.activeAdapter = adapter;
    return adapter.connect();
  }

  async disconnect() {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
      this.activeAdapter = null;
    }
    return {
      isConnected: false,
      address: null,
      balance: "0.00 ETH",
      network: "Ethereum Mainnet",
      isMetaMask: false,
    };
  }
}

export const walletService = new WalletService();
