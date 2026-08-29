/**
 * IdentityManager
 * Encapsulates client UUID generation, username validation, anti-tamper profile validation,
 * and persistent storage.
 */
export class IdentityManager {
  static USERNAME_KEY = "skribl:username";
  static WARRIOR_KEY = "sr_warrior";
  static CLIENT_ID_KEY = "skribl:clientId";

  static DEFAULT_WARRIOR = {
    name: "",
    email: "",
    role: "user",
    title: "Novice Warrior",
    level: 1,
    coins: 0,
    wins: 0,
    matches: 0,
    avatarColor: "#64748b",
    bio: "",
    isAuthenticated: false,
  };

  /**
   * Retrieves or initializes persistent warrior username
   * @returns {string}
   */
  static getUsername() {
    if (typeof localStorage === "undefined") return "Warrior";

    const direct = localStorage.getItem(IdentityManager.USERNAME_KEY);
    if (direct && direct.trim()) return direct.trim().slice(0, 20);

    const profile = IdentityManager.getWarriorProfile();
    return profile.name;
  }

  /**
   * Sets warrior username and updates profile
   * @param {string} name 
   */
  static setUsername(name) {
    if (typeof localStorage === "undefined") return;

    const clean = String(name || "").trim().slice(0, 20) || "Warrior";
    localStorage.setItem(IdentityManager.USERNAME_KEY, clean);

    const profile = IdentityManager.getWarriorProfile();
    profile.name = clean;
    IdentityManager.saveWarriorProfile(profile);
  }

  /**
   * Retrieves, sanitizes, and bounds warrior profile from storage
   * @returns {object}
   */
  static getWarriorProfile() {
    if (typeof localStorage === "undefined") return { ...IdentityManager.DEFAULT_WARRIOR };

    try {
      const raw = localStorage.getItem(IdentityManager.WARRIOR_KEY);
      if (!raw) return { ...IdentityManager.DEFAULT_WARRIOR };

      const parsed = JSON.parse(raw);
      return IdentityManager.sanitizeWarriorProfile(parsed);
    } catch {
      return { ...IdentityManager.DEFAULT_WARRIOR };
    }
  }

  /**
   * Validates and saves warrior profile
   * @param {object} profile 
   */
  static saveWarriorProfile(profile) {
    if (typeof localStorage === "undefined") return;
    const sanitized = IdentityManager.sanitizeWarriorProfile(profile);
    localStorage.setItem(IdentityManager.WARRIOR_KEY, JSON.stringify(sanitized));
  }

  /**
   * Bounds and sanitizes profile fields against corrupt/tampered values
   * @param {object} data 
   * @returns {object}
   */
  static sanitizeWarriorProfile(data) {
    if (!data || typeof data !== "object") return { ...IdentityManager.DEFAULT_WARRIOR };

    const name = String(data.name || "Warrior").trim().slice(0, 20) || "Warrior";
    const role = String(data.role || "Dragon Warrior").slice(0, 30);
    const level = Math.max(1, Math.min(100, Number(data.level) || 1));
    const coins = Math.max(0, Math.min(10_000_000, Number(data.coins) || 0));
    const wins = Math.max(0, Math.min(100_000, Number(data.wins) || 0));
    const matches = Math.max(wins, Math.min(200_000, Number(data.matches) || wins));
    const avatarColor = typeof data.avatarColor === "string" ? data.avatarColor.slice(0, 10) : "#f59e0b";
    const isAuthenticated = Boolean(data.isAuthenticated);

    return {
      name,
      role,
      level,
      coins,
      wins,
      matches,
      avatarColor,
      isAuthenticated,
    };
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
