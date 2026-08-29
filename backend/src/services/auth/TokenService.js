import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export class TokenService {
  /**
   * Generates a signed JWT token containing user identity & role
   * @param {object} user 
   * @returns {string}
   */
  static generateToken(user) {
    const payload = {
      id: user.id || (user._id ? user._id.toString() : ""),
      email: user.email,
      name: user.name,
      role: user.role || "user",
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
