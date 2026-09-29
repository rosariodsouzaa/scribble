import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserRepository } from "../models/User.js";
import { AdminRepository } from "../models/Admin.js";
import { OtpService } from "../services/auth/OtpService.js";
import { TokenService } from "../services/auth/TokenService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Helper to validate email string
function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const clean = email.trim();
  if (clean.includes("..")) return false; // Reject consecutive dots
  if (clean.length > 254) return false;
  return /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
}

// Helper to sanitize & validate warrior / admin name
function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>"'&]/g, "")
    .trim();
}

/**
 * POST /api/auth/send-otp
 * Dispatches an OTP verification code to the target email
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email, purpose = "signup", accountType = "player" } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = accountType === "admin";

    if (isAdmin) {
      const existing = await AdminRepository.findByEmail(cleanEmail);
      if (purpose === "signup" && existing) {
        return res.status(409).json({ error: "An Imperial Admin account already exists with this email address." });
      }
      if (purpose === "reset_password" && !existing) {
        return res.status(404).json({ error: "No Imperial Admin account found with this email." });
      }
    } else {
      const existing = await UserRepository.findByEmail(cleanEmail);
      if (purpose === "signup" && existing) {
        return res.status(409).json({ error: "A warrior account already exists with this email address." });
      }
      if (purpose === "reset_password" && !existing) {
        return res.status(404).json({ error: "No warrior account found with this email." });
      }
    }

    const result = await OtpService.sendOtp(cleanEmail, purpose);
    res.json(result);
  } catch (err) {
    console.error("[Auth] send-otp error:", err);
    res.status(500).json({ error: "Failed to dispatch verification code. Please try again." });
  }
});

/**
 * POST /api/auth/verify-otp
 * Pre-validates OTP without consuming or finalizing user creation
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, purpose = "signup" } = req.body;

    if (!isValidEmail(email) || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    // Pre-validate OTP without deleting it so final signup can consume it
    const verification = await OtpService.verifyOtp(email, otp, purpose, false);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || "Invalid code." });
    }

    res.json({ success: true, message: "Code verified successfully." });
  } catch (err) {
    console.error("[Auth] verify-otp error:", err);
    res.status(500).json({ error: "Failed to verify code." });
  }
});

/**
 * POST /api/auth/reset-password
 * Resets account passcode after verifying OTP
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, accountType = "player" } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (!otp) {
      return res.status(400).json({ error: "Verification code is required." });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: "New passcode must be at least 6 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = accountType === "admin";
    const repo = isAdmin ? AdminRepository : UserRepository;

    const account = await repo.findByEmail(cleanEmail);
    if (!account) {
      return res.status(404).json({
        error: isAdmin ? "No Imperial Admin account found with this email." : "No warrior account found with this email.",
      });
    }

    // Verify and consume OTP for reset_password
    const verification = await OtpService.verifyOtp(cleanEmail, otp, "reset_password", true);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || "Invalid or expired verification code." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update account password in database
    await repo.updateById(account.id || account._id, { passwordHash });

    console.log(`[Auth] Passcode reset successfully for ${account.name} (${cleanEmail}) [${isAdmin ? "ADMIN" : "PLAYER"}]`);

    res.json({
      success: true,
      message: "Passcode reset successfully! You may now enter the sanctuary.",
    });
  } catch (err) {
    console.error("[Auth] reset-password error:", err);
    res.status(500).json({ error: "Failed to reset passcode. Please try again." });
  }
});

/**
 * POST /api/auth/signup
 * Registers a new player into `users` table or admin into `admins` table after verifying OTP code
 */
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      otp,
      avatarColor,
      title,
      accountType = "player",
    } = req.body;

    const cleanName = sanitizeName(name);
    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Nickname must be at least 2 valid characters." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 non-space characters long." });
    }

    if (!otp) {
      return res.status(400).json({ error: "Email OTP verification code is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = accountType === "admin";

    if (isAdmin) {
      // Admin signup inserts into `admins` ONLY
      const existingAdmin = await AdminRepository.findByEmail(cleanEmail);
      if (existingAdmin) {
        return res.status(409).json({ error: "An Imperial Admin account already exists with this email." });
      }

      // Verify and consume OTP permanently
      const verification = await OtpService.verifyOtp(cleanEmail, otp, "signup", true);
      if (!verification.valid) {
        return res.status(400).json({ error: verification.error || "Invalid or expired OTP." });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create admin account in `admins` table
      const newAdmin = await AdminRepository.create({
        name: cleanName.slice(0, 30),
        email: cleanEmail,
        passwordHash,
        avatarColor: avatarColor || "#ef4444",
        bio: "Imperial Sovereign of the Dragon Dynasty.",
        title: title || "Imperial Grandmaster",
      });

      const token = TokenService.generateToken({
        ...newAdmin,
        role: "admin",
        accountType: "admin",
      });
      const adminJson = newAdmin.toPublicJSON ? newAdmin.toPublicJSON() : newAdmin;

      console.log(`[Auth] New Imperial Admin registered: ${newAdmin.name} (${cleanEmail})`);

      return res.status(201).json({
        success: true,
        message: "Imperial Admin registered successfully!",
        token,
        user: { ...adminJson, role: "admin", accountType: "admin" },
      });
    }

    // Player signup inserts into `users` ONLY
    const existingPlayer = await UserRepository.findByEmail(cleanEmail);
    if (existingPlayer) {
      return res.status(409).json({ error: "A warrior account already exists with this email." });
    }

    // Verify and consume OTP permanently
    const verification = await OtpService.verifyOtp(cleanEmail, otp, "signup", true);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || "Invalid or expired OTP." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create player account in `users` table
    const newPlayer = await UserRepository.create({
      name: cleanName.slice(0, 30),
      email: cleanEmail,
      passwordHash,
      role: "user",
      isVerified: true,
      coins: 2500,
      level: 1,
      xp: 0,
      wins: 0,
      matches: 0,
      avatarColor: avatarColor || "#f59e0b",
      bio: "Fierce dragon warrior ready for battle.",
      title: title || "Dragon Novice",
    });

    const token = TokenService.generateToken({
      ...newPlayer,
      role: "user",
      accountType: "player",
    });
    const playerJson = newPlayer.toPublicJSON ? newPlayer.toPublicJSON() : newPlayer;

    console.log(`[Auth] New warrior registered: ${newPlayer.name} (${cleanEmail})`);

    res.status(201).json({
      success: true,
      message: "Warrior registered successfully!",
      token,
      user: { ...playerJson, role: "user", accountType: "player" },
    });
  } catch (err) {
    console.error("[Auth] signup error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and issues JWT token
 * ADMIN query `admins` ONLY. PLAYER query `users` ONLY.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, accountType = "player" } = req.body;

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ error: "Please enter your email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdmin = accountType === "admin";

    if (isAdmin) {
      // Search ONLY admins table
      const admin = await AdminRepository.findByEmail(cleanEmail);
      if (!admin) {
        return res.status(401).json({ error: "Invalid admin email or password." });
      }

      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid admin email or password." });
      }

      // Update last login
      await AdminRepository.updateById(admin.id || admin._id, { lastLoginAt: new Date() });

      const token = TokenService.generateToken({
        ...admin,
        role: "admin",
        accountType: "admin",
      });
      const adminJson = admin.toPublicJSON ? admin.toPublicJSON() : admin;

      console.log(`[Auth] Imperial Admin logged in: ${admin.name} [Role: admin]`);

      return res.json({
        success: true,
        token,
        user: { ...adminJson, role: "admin", accountType: "admin" },
      });
    }

    // Search ONLY users (player) table
    const player = await UserRepository.findByEmail(cleanEmail);
    if (!player) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (player.isBanned) {
      return res.status(403).json({
        error: `Your account has been banished: ${player.banReason || "Terms of Service violation."}`,
        isBanned: true,
      });
    }

    const isMatch = await bcrypt.compare(password, player.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Update last login
    await UserRepository.updateById(player.id || player._id, { lastLoginAt: new Date() });

    const token = TokenService.generateToken({
      ...player,
      role: "user",
      accountType: "player",
    });
    const playerJson = player.toPublicJSON ? player.toPublicJSON() : player;

    console.log(`[Auth] Warrior logged in: ${player.name} [Role: ${player.role}]`);

    return res.json({
      success: true,
      token,
      user: { ...playerJson, role: player.role || "user", accountType: "player" },
    });
  } catch (err) {
    console.error("[Auth] login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user session
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userJson = req.user.toPublicJSON ? req.user.toPublicJSON() : req.user;
    const isAdm = req.user.role === "admin" || req.user.accountType === "admin";
    res.json({
      user: {
        ...userJson,
        role: isAdm ? "admin" : (userJson.role || "user"),
        accountType: isAdm ? "admin" : "player",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user session." });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user/admin profile details
 */
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, bio, title, avatarColor } = req.body;
    const updates = {};

    if (name !== undefined) {
      const cleanName = sanitizeName(name);
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({ error: "Nickname must be at least 2 valid characters." });
      }
      if (cleanName.length > 30) {
        return res.status(400).json({ error: "Nickname cannot exceed 30 characters." });
      }
      updates.name = cleanName;
    }
    if (bio !== undefined) {
      updates.bio = sanitizeName(bio).slice(0, 160);
    }
    if (title !== undefined) {
      updates.title = sanitizeName(title).slice(0, 40);
    }
    if (avatarColor) {
      updates.avatarColor = String(avatarColor).slice(0, 10);
    }

    const isAdm = req.user.role === "admin" || req.user.accountType === "admin";
    const repo = isAdm ? AdminRepository : UserRepository;

    const updated = await repo.updateById(req.user.id || req.user._id, updates);
    const userJson = updated.toPublicJSON ? updated.toPublicJSON() : updated;

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...userJson,
        role: isAdm ? "admin" : (userJson.role || "user"),
        accountType: isAdm ? "admin" : "player",
      },
    });
  } catch (err) {
    console.error("[Auth] update profile error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

/**
 * PATCH /api/auth/change-password
 * Allows an authenticated account to change their passcode
 */
router.patch("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current passcode and new passcode are required." });
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      return res.status(400).json({ error: "New passcode must be at least 6 non-space characters long." });
    }

    const isAdm = req.user.role === "admin" || req.user.accountType === "admin";
    const repo = isAdm ? AdminRepository : UserRepository;

    const account = await repo.findById(req.user.id || req.user._id);
    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Current passcode is incorrect. Verification failed." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await repo.updateById(account.id || account._id, { passwordHash });

    console.log(`[Auth] Passcode updated securely for: ${account.name} (${account.email})`);

    res.json({
      success: true,
      message: "Battle passcode successfully changed! Your vault is now guarded by your new key.",
    });
  } catch (err) {
    console.error("[Auth] change password error:", err);
    res.status(500).json({ error: "Failed to change passcode." });
  }
});

/**
 * POST /api/auth/seed-demo
 * Seeds initial demo admin in `admins` table and warrior in `users` table
 */
router.post("/seed-demo", async (_req, res) => {
  try {
    // Seed Admin in admins table
    let admin = await AdminRepository.findByEmail("admin@scribbleroyale.io");
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("admin123", salt);
      admin = await AdminRepository.create({
        name: "Dragon Grandmaster",
        email: "admin@scribbleroyale.io",
        passwordHash: hash,
        avatarColor: "#ef4444",
        bio: "Supreme Sovereign of the Dragon Dynasty.",
        title: "Imperial Grandmaster",
      });
    }

    // Seed Demo User in users table
    let demoUser = await UserRepository.findByEmail("warrior@scribbleroyale.io");
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("warrior123", salt);
      demoUser = await UserRepository.create({
        name: "Vedansh Dragon",
        email: "warrior@scribbleroyale.io",
        passwordHash: hash,
        role: "user",
        isVerified: true,
        coins: 4500,
        level: 14,
        xp: 3200,
        wins: 28,
        matches: 35,
        avatarColor: "#f59e0b",
        bio: "Master of brush strokes and blazing speed.",
        title: "Dragon Knight",
      });
    }

    res.json({
      success: true,
      message: "Demo accounts ready!",
      demoAccounts: {
        admin: { email: "admin@scribbleroyale.io", password: "admin123", role: "admin", accountType: "admin" },
        user: { email: "warrior@scribbleroyale.io", password: "warrior123", role: "user", accountType: "player" },
      },
    });
  } catch (err) {
    console.error("[Auth] seed-demo error:", err);
    res.status(500).json({ error: "Failed to seed demo accounts." });
  }
});

export default router;
