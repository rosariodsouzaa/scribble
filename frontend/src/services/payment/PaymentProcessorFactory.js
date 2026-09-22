import { MetaMaskPaymentStrategy } from "./MetaMaskPaymentStrategy.js";
import { GoldVaultPaymentStrategy } from "./GoldVaultPaymentStrategy.js";

/**
 * Payment Processor Factory
 * Factory Pattern producing the appropriate PaymentStrategy based on selected payment rail.
 */
export class PaymentProcessorFactory {
  static strategies = {
    web3: new MetaMaskPaymentStrategy(),
    metamask: new MetaMaskPaymentStrategy(),
    gold: new GoldVaultPaymentStrategy(),
  };

  /**
   * Factory method to get strategy instance for a payment method
   * @param {string} method 
   * @returns {import("./PaymentStrategy.js").PaymentStrategy}
   */
  static getStrategy(method) {
    return this.strategies[method] || this.strategies.metamask;
  }
}
