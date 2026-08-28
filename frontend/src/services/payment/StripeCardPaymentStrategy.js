import { PaymentStrategy } from "./PaymentStrategy.js";

/**
 * Stripe Credit Card Payment Strategy
 */
export class StripeCardPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("Credit Card (Stripe)");
  }

  async process(item, details = {}) {
    await new Promise((r) => setTimeout(r, 1100));

    const last4 = details.cardNumber ? details.cardNumber.slice(-4) : "4242";
    return {
      success: true,
      transaction: {
        id: this.generateTxHash("TX"),
        date: this.formatTimestamp(),
        item: item.name,
        amount: `$${item.priceUsd}`,
        method: `Credit Card (•••• ${last4})`,
        status: "COMPLETED",
        hash: `ch_${Math.random().toString(36).substring(2, 14)}`,
      },
    };
  }
}
