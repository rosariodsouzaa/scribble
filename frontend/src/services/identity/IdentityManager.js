/**
 * IdentityManager
 * Encapsulates client UUID generation, username validation, and warrior profile persistence.
 */
export class IdentityManager {
  static USERNAME_KEY = "skribl:username";
  static WARRIOR_KEY = "sr_warrior";
  static CLIENT_ID_KEY = "skribl:clientId";

  /**
   * Retrieves or initializes persistent warrior username
   * @returns {string}
   */
  static getUsername() {
    if (typeof localStorage === "undefined") return "Warrior";

    const direct = localStorage.getItem(IdentityManager.USERNAME_KEY);
    if (direct && direct.trim()) return direct.trim();

    try {
      const warrior = JSON.parse(localStorage.getItem(IdentityManager.WARRIOR_KEY) || "{}");
      if (warrior.name && warrior.name.trim()) {
        localStorage.setItem(IdentityManager.USERNAME_KEY, warrior.name.trim());
        return warrior.name.trim();
      }
    } catch {}

    const fallback = "Warrior_" + Math.floor(100 + Math.random() * 900);
    localStorage.setItem(IdentityManager.USERNAME_KEY, fallback);
    return fallback;
  }

  /**
   * Sets warrior username and updates profile
   * @param {string} name 
   */
  static setUsername(name) {
    if (typeof localStorage === "undefined") return;

    const clean = String(name || "").trim().slice(0, 20) || "Warrior";
    localStorage.setItem(IdentityManager.USERNAME_KEY, clean);

    try {
      const warrior = JSON.parse(localStorage.getItem(IdentityManager.WARRIOR_KEY) || "{}");
      warrior.name = clean;
      localStorage.setItem(IdentityManager.WARRIOR_KEY, JSON.stringify(warrior));
    } catch {}
  }

  /**
   * Retrieves or creates a persistent client UUID
   * @returns {string}
   */
  static getClientId() {
    if (typeof localStorage === "undefined") return "client_anon";

    let id = localStorage.getItem(IdentityManager.CLIENT_ID_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
        `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(IdentityManager.CLIENT_ID_KEY, id);
    }
    return id;
  }
}
