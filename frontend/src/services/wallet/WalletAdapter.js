/**
 * Abstract Base Wallet Adapter
 * Defines the common abstraction contract for all Web3 wallet providers.
 */
export class WalletAdapter {
  /**
   * @param {string} name - Display name of the wallet provider
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Checks if this wallet provider is available in the current environment
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    return false;
  }

  /**
   * Connects to the wallet provider
   * @returns {Promise<{ success: boolean, wallet?: object, error?: string }>}
   */
  async connect() {
    throw new Error("connect() must be implemented by concrete adapter");
  }

  /**
   * Disconnects from the wallet provider
   * @returns {Promise<void>}
   */
  async disconnect() {
    // Subclass hook
  }

  /**
   * Retrieves active balance for the given address
   * @param {string} address 
   * @returns {Promise<string>}
   */
  async getBalance(address) {
    return "0.00 ETH";
  }

  /**
   * Subscribes to account switch events
   * @param {function} callback 
   * @returns {function} unsubscribe handler
   */
  onAccountsChanged(callback) {
    return () => {};
  }

  /**
   * Subscribes to network/chain switch events
   * @param {function} callback 
   * @returns {function} unsubscribe handler
   */
  onChainChanged(callback) {
    return () => {};
  }
}
