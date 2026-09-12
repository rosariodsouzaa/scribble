/**
 * AuthService
 * Handles REST API communications for authentication, user sessions, OTPs, and Admin operations.
 */
export class AuthService {
  static TOKEN_KEY = "sr_token";

  static getToken() {
    try {
      return localStorage.getItem(AuthService.TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }

  static setToken(token) {
    try {
      if (token) {
        localStorage.setItem(AuthService.TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AuthService.TOKEN_KEY);
      }
    } catch {}
  }

  static getAuthHeaders() {
    const token = AuthService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async _parseResponse(res, fallbackErrMsg = "Request failed") {
    let data = {};
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }
    if (!res.ok) {
      throw new Error(data.error || data.message || `${fallbackErrMsg} (Status ${res.status})`);
    }
    return data;
  }

  // --- Auth API ---

  static async sendOtp(email, purpose = "signup") {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });
    return AuthService._parseResponse(res, "Failed to send verification code");
  }

  static async verifyOtp(email, otp, purpose = "signup") {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, purpose }),
    });
    return AuthService._parseResponse(res, "Invalid verification code");
  }

  static async resetPassword({ email, otp, newPassword }) {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return AuthService._parseResponse(res, "Failed to reset passcode");
  }

  static async signup({ name, email, password, otp, avatarColor, title }) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, otp, avatarColor, title }),
    });
    const data = await AuthService._parseResponse(res, "Signup failed");
    if (data.token) AuthService.setToken(data.token);
    return data;
  }

  static async login({ email, password }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await AuthService._parseResponse(res, "Login failed");
    if (data.token) AuthService.setToken(data.token);
    return data;
  }

  static async getMe() {
    const token = AuthService.getToken();
    if (!token) return null;

    try {
      const res = await fetch("/api/auth/me", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!res.ok) {
        AuthService.setToken(null);
        return null;
      }
      const data = await AuthService._parseResponse(res, "Session expired");
      return data.user || null;
    } catch {
      return null;
    }
  }

  static async updateProfile(profileUpdates) {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify(profileUpdates),
    });
    const data = await AuthService._parseResponse(res, "Failed to update profile");
    return data.user;
  }

  static async seedDemoAccounts() {
    const res = await fetch("/api/auth/seed-demo", { method: "POST" });
    return AuthService._parseResponse(res, "Failed to seed demo accounts");
  }

  // --- Admin API ---

  static async getAdminStats() {
    const res = await fetch("/api/admin/stats", {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await AuthService._parseResponse(res, "Failed to fetch admin stats");
    return data.stats;
  }

  static async getAdminUsers(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/admin/users?${query}`, {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await AuthService._parseResponse(res, "Failed to fetch users");
    return data.users;
  }

  static async updateUserRole(userId, role) {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await AuthService._parseResponse(res, "Failed to update user role");
    return data.user;
  }

  static async toggleUserBan(userId, isBanned, banReason) {
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: "PATCH",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ isBanned, banReason }),
    });
    const data = await AuthService._parseResponse(res, "Failed to update ban status");
    return data.user;
  }

  static async grantUserGold(userId, amount) {
    const res = await fetch(`/api/admin/users/${userId}/grant-gold`, {
      method: "POST",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    const data = await AuthService._parseResponse(res, "Failed to grant gold");
    return data.user;
  }

  static async getAdminRooms() {
    const res = await fetch("/api/admin/rooms", {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await AuthService._parseResponse(res, "Failed to fetch live rooms");
    return data.rooms;
  }

  static async terminateRoom(roomCode) {
    const res = await fetch(`/api/admin/rooms/${roomCode}`, {
      method: "DELETE",
      headers: AuthService.getAuthHeaders(),
    });
    return AuthService._parseResponse(res, "Failed to terminate room");
  }

  static async getWordPacks() {
    const res = await fetch("/api/admin/wordpacks", {
      headers: AuthService.getAuthHeaders(),
    });
    const data = await AuthService._parseResponse(res, "Failed to fetch word packs");
    return data.packs;
  }

  static async addWordPack(category, words) {
    const res = await fetch("/api/admin/wordpacks", {
      method: "POST",
      headers: AuthService.getAuthHeaders(),
      body: JSON.stringify({ category, words }),
    });
    return AuthService._parseResponse(res, "Failed to add word pack");
  }
}

export default AuthService;
