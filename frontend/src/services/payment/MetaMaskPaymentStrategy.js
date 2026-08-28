import { PaymentStrategy } from "./PaymentStrategy.js";

/**
 * Web3 MetaMask Crypto Payment Strategy
 */
export class MetaMaskPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("MetaMask (ETH)");
  }

  async process(item, details = {}) {
    await new Promise((r) => setTimeout(r, 1000));

    const hash = this.generateEthHash();
    return {
      success: true,
      transaction: {
        id: this.generateTxHash("TX"),
        date: this.formatTimestamp(),
        item: item.name,
        amount: `${item.priceEth} ETH ($${item.priceUsd})`,
        method: `MetaMask (${item.priceEth} ETH)`,
        status: "COMPLETED",
        hash,
      },
    };
  }
}
