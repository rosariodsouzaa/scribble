import { PaymentStrategy } from "./PaymentStrategy.js";

/**
 * PayPal 1-Click Payment Strategy
 */
export class PayPalPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("PayPal 1-Click");
  }

  async process(item, details = {}) {
    await new Promise((r) => setTimeout(r, 900));

    return {
      success: true,
      transaction: {
        id: this.generateTxHash("TX"),
        date: this.formatTimestamp(),
        item: item.name,
        amount: `$${item.priceUsd}`,
        method: "PayPal 1-Click",
        status: "COMPLETED",
        hash: `PAYPAL-${Math.floor(100000 + Math.random() * 900000)}`,
      },
    };
  }
}
