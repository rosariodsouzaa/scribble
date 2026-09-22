import { WalletAdapter } from "./WalletAdapter.js";

/**
 * Concrete Demo Dragon Vault Adapter
 * Provides testnet mock wallet for development/demonstration without browser extensions,
 * with stateful balance tracking and deduction.
 */
export class DemoVaultAdapter extends WalletAdapter {
  static STORAGE_KEY = "sr_demo_balance";
  static DEFAULT_BALANCE = "1.5000";

  constructor() {
    super("Demo Dragon Vault");
  }

  async isAvailable() {
    return true;
  }

  static getRawBalance() {
    try {
      const saved = localStorage.getItem(DemoVaultAdapter.STORAGE_KEY);
      if (saved !== null && !isNaN(parseFloat(saved))) {
        return parseFloat(saved);
      }
      localStorage.setItem(DemoVaultAdapter.STORAGE_KEY, DemoVaultAdapter.DEFAULT_BALANCE);
      return parseFloat(DemoVaultAdapter.DEFAULT_BALANCE);
    } catch {
      return parseFloat(DemoVaultAdapter.DEFAULT_BALANCE);
    }
  }

  static setRawBalance(amount) {
    try {
      const val = Math.max(0, parseFloat(amount) || 0).toFixed(4);
      localStorage.setItem(DemoVaultAdapter.STORAGE_KEY, val);
      return val;
    } catch {
      return "0.0000";
    }
  }

  async connect() {
    const demoAddress =
      "0x71C" + Math.random().toString(16).substring(2, 8).toUpperCase() + "3A9E8";
    const balance = await this.getBalance();

    return {
      success: true,
      wallet: {
        isConnected: true,
        address: demoAddress,
        balance,
        network: "Ethereum Sepolia (Testnet)",
        isMetaMask: false,
        adapterType: "demo",
      },
    };
  }

  async getBalance() {
    const raw = DemoVaultAdapter.getRawBalance();
    return `${raw.toFixed(4)} ETH`;
  }

  async deduct(amountEth) {
    const current = DemoVaultAdapter.getRawBalance();
    const req = parseFloat(amountEth) || 0;
    if (current < req) {
      throw new Error(
        `Insufficient tokens in Demo Vault. Current balance: ${current.toFixed(4)} ETH. Required: ${req.toFixed(4)} ETH.`
      );
    }
    const next = Math.max(0, current - req);
    DemoVaultAdapter.setRawBalance(next);
    return `${next.toFixed(4)} ETH`;
  }
}
