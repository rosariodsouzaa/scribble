import { PaymentStrategy } from "./PaymentStrategy.js";

/**
 * UPI / Instant QR Payment Strategy
 */
export class UpiPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("UPI / Instant QR");
  }

  async process(item, details = {}) {
    await new Promise((r) => setTimeout(r, 1000));

    return {
      success: true,
      transaction: {
        id: this.generateTxHash("TX"),
        date: this.formatTimestamp(),
        item: item.name,
        amount: `$${item.priceUsd}`,
        method: `UPI / QR (${details.upiId || "Instant QR"})`,
        status: "COMPLETED",
        hash: `UPI-REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
      },
    };
  }
}
