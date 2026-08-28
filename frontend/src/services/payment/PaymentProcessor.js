/**
 * Object-Oriented Payment Processing System
 * Implements Strategy Pattern and Factory Pattern for multi-rail checkout.
 */

/**
 * Base Payment Strategy Class
 */
export class PaymentStrategy {
  constructor(name) {
    this.name = name;
  }

  /**
   * Process a purchase transaction
   * @param {object} item - Store item to buy
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

/**
 * Web3 MetaMask Crypto Payment Strategy
 */
export class MetaMaskPaymentStrategy extends PaymentStrategy {
  constructor() {
    super("MetaMask (ETH)");
  }

  async process(item, details = {}) {
    // Simulate web3 wallet prompt & network confirmation
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

/**
 * Payment Processor Factory
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
   * Factory method to get the strategy for the given payment rail
   * @param {string} method 
   * @returns {PaymentStrategy}
   */
  static getStrategy(method) {
    return this.strategies[method] || this.strategies.card;
  }
}
