import { TokenService } from "../services/auth/TokenService.js";
import { UserRepository } from "../models/User.js";
import { AdminRepository } from "../models/Admin.js";

/**
 * Middleware to require valid JWT authentication
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Missing or malformed token." });
  }

  const token = authHeader.split(" ")[1];
  const decoded = TokenService.verifyToken(token);

  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: "Invalid or expired authentication session. Please log in again." });
  }

  const isAdminAccount = decoded.accountType === "admin" || decoded.role === "admin";
  let user = null;

  if (isAdminAccount) {
    user = await AdminRepository.findById(decoded.id);
  } else {
    user = await UserRepository.findById(decoded.id);
  }

  if (!user) {
    return res.status(401).json({ error: "Account not found." });
  }

  if (user.isBanned) {
    return res.status(403).json({
      error: `Your warrior account has been banished: ${user.banReason || "Terms of Service violation."}`,
      isBanned: true,
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware to require Admin role
 */
export function requireAdmin(req, res, next) {
  const isAllowedAdmin =
    req.user &&
    (req.user.role === "admin" || req.user.accountType === "admin") &&
    req.user.email?.toLowerCase().trim() === "rohansalkar02@gmail.com";

  if (!isAllowedAdmin) {
    return res.status(403).json({
      error: "Access denied. Only the authorized Imperial Administrator (rohansalkar02@gmail.com) can access this sanctuary.",
    });
  }
  next();
}

/**
 * Optional Auth middleware (populates req.user if token present)
 */
export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = TokenService.verifyToken(token);
    if (decoded && decoded.id) {
      const isAdminAccount = decoded.accountType === "admin" || decoded.role === "admin";
      const user = isAdminAccount
        ? await AdminRepository.findById(decoded.id)
        : await UserRepository.findById(decoded.id);
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
  }
  next();
}

export default { requireAuth, requireAdmin, optionalAuth };
