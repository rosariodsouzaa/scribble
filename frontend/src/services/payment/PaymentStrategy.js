/**
 * Abstract Base Payment Strategy
 * Defines the contract for all multi-rail checkout processors.
 */
export class PaymentStrategy {
  /**
   * @param {string} name - Display name of the payment rail
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Process a purchase transaction
   * @param {object} item - Store item being bought
   * @param {object} details - Payment inputs (card, upiId, etc.)
   * @returns {Promise<{ success: boolean, transaction?: object, error?: string }>}
   */
  async process(item, details = {}) {
    throw new Error("process() must be implemented by concrete strategy");
  }

  generateTxHash(prefix = "TX") {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  generateEthHash() {
    return `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
  }

  formatTimestamp() {
    return new Date().toISOString().replace("T", " ").substring(0, 16);
  }
}
