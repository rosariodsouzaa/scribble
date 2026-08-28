import { PaymentStrategy } from "./PaymentStrategy.js";

/**
 * In-Game Dragon Gold Vault Payment Strategy
 */
export class GoldVaultPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("Dragon Gold Vault");
  }

  async process(item, { currentCoins = 0 } = {}) {
    if (!item.goldCost) {
      return { success: false, error: "This relic cannot be purchased with Gold." };
    }
    if (currentCoins < item.goldCost) {
      return {
        success: false,
        error: `Insufficient Gold. You need ${item.goldCost - currentCoins} more Dragon Gold.`,
      };
    }

    return {
      success: true,
      transaction: {
        id: this.generateTxHash("TX"),
        date: this.formatTimestamp(),
        item: item.name,
        amount: `🪙 ${item.goldCost.toLocaleString()} Gold`,
        method: "Dragon Gold Vault",
        status: "COMPLETED",
        hash: "INTERNAL-ROYALE",
      },
    };
  }
}
