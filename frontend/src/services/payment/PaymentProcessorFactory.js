import { MetaMaskPaymentStrategy } from "./MetaMaskPaymentStrategy.js";
import { StripeCardPaymentStrategy } from "./StripeCardPaymentStrategy.js";
import { UpiPaymentStrategy } from "./UpiPaymentStrategy.js";
import { PayPalPaymentStrategy } from "./PayPalPaymentStrategy.js";
import { GoldVaultPaymentStrategy } from "./GoldVaultPaymentStrategy.js";

/**
 * Payment Processor Factory
 * Factory Pattern producing the appropriate PaymentStrategy based on selected payment rail.
 */
export class PaymentProcessorFactory {
  static strategies = {
    web3: new MetaMaskPaymentStrategy(),
    card: new StripeCardPaymentStrategy(),
    upi: new UpiPaymentStrategy(),
    paypal: new PayPalPaymentStrategy(),
    gold: new GoldVaultPaymentStrategy(),
  };

  /**
   * Factory method to get strategy instance for a payment method
   * @param {string} method 
   * @returns {import("./PaymentStrategy.js").PaymentStrategy}
   */
  static getStrategy(method) {
    return this.strategies[method] || this.strategies.card;
  }
}
