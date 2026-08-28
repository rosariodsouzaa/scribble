/**
 * Player Domain Model
 * Encapsulates player identity, state, readiness, score accumulation, and anti-leak serialization.
 */
export class Player {
  /**
   * @param {string} id - Socket ID
   * @param {string} username - Display name
   * @param {string|null} clientId - Persistent client identity UUID
   * @param {boolean} isHost - Whether this player created/hosts the chamber
   */
  constructor(id, username, clientId = null, isHost = false) {
    this.id = id;
    this.clientId = clientId;
    this.username = Player.sanitizeName(username);
    this.score = 0;
    this.isReady = false;
    this.connected = true;
    this.isHost = isHost;
  }

  /**
   * Sanitizes and bounds username input
   * @param {string} name 
   * @returns {string}
   */
  static sanitizeName(name) {
    const clean = String(name || "").trim().slice(0, 20);
    return clean || "Warrior";
  }

  /**
   * Adds points to player score
   * @param {number} points 
   * @returns {number} updated score
   */
  addScore(points) {
    if (typeof points === "number" && Number.isFinite(points)) {
      this.score += points;
    }
    return this.score;
  }

  /**
   * Resets score to 0
   */
  resetScore() {
    this.score = 0;
  }

  /**
   * Sets player readiness
   * @param {boolean} ready 
   */
  setReady(ready) {
    this.isReady = Boolean(ready);
  }

  /**
   * Updates socket ID upon client reconnection
   * @param {string} newSocketId 
   */
  updateSocketId(newSocketId) {
    this.id = newSocketId;
    this.connected = true;
  }

  /**
   * Sets player connection status
   * @param {boolean} connected 
   */
  setConnected(connected) {
    this.connected = Boolean(connected);
  }

  /**
   * Promotes or demotes host status
   * @param {boolean} isHost 
   */
  setHost(isHost) {
    this.isHost = Boolean(isHost);
  }

  /**
   * Returns a safe JSON-serializable representation of the player
   * @returns {object}
   */
  serialize() {
    return {
      id: this.id,
      username: this.username,
      score: this.score,
      isReady: this.isReady,
      connected: this.connected,
      isHost: this.isHost,
    };
  }
}
