import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export class TokenService {
  /**
   * Generates a signed JWT token containing user identity & role
   * @param {object} user 
   * @returns {string}
   */
  static generateToken(user) {
    const isAdm = user.accountType === "admin" || user.role === "admin";
    const payload = {
      id: user.id || (user._id ? user._id.toString() : ""),
      email: user.email,
      name: user.name,
      role: isAdm ? "admin" : (user.role || "user"),
      accountType: isAdm ? "admin" : "player",
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  }

  /**
   * Verifies and decodes a JWT token
   * @param {string} token 
   * @returns {object|null}
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (err) {
      return null;
    }
  }
}

export default TokenService;
