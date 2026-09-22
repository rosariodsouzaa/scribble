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
    return this.adapters[type] || this.adapters.metamask;
  }

  async connect(type = "metamask") {
    const adapter = this.getAdapter(type);
    const available = await adapter.isAvailable();

    if (!available && type === "metamask") {
      return {
        success: false,
        error: "MetaMask extension not detected in this browser. Please ensure MetaMask is installed and enabled.",
      };
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
