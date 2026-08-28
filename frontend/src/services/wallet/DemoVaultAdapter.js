import { WalletAdapter } from "./WalletAdapter.js";

/**
 * Concrete Demo Dragon Vault Adapter
 * Provides testnet mock wallet for development/demonstration without browser extensions.
 */
export class DemoVaultAdapter extends WalletAdapter {
  constructor() {
    super("Demo Dragon Vault");
  }

  async isAvailable() {
    return true;
  }

  async connect() {
    const demoAddress =
      "0x71C" + Math.random().toString(16).substring(2, 8).toUpperCase() + "3A9E8";

    return {
      success: true,
      wallet: {
        isConnected: true,
        address: demoAddress,
        balance: "2.45 ETH",
        network: "Ethereum Sepolia (Testnet)",
        isMetaMask: false,
        adapterType: "demo",
      },
    };
  }

  async getBalance() {
    return "2.45 ETH";
  }
}
