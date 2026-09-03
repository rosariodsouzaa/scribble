import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserRepository } from "../models/User.js";
import { OtpService } from "../services/auth/OtpService.js";
import { TokenService } from "../services/auth/TokenService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// Helper to validate email string
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * POST /api/auth/send-otp
 * Dispatches an OTP verification code to the target email
 */
router.post("/send-otp", async (req, res) => {
  try {
    const { email, purpose = "signup" } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(cleanEmail);

    if (purpose === "signup" && existing) {
      return res.status(409).json({ error: "A warrior account already exists with this email address." });
    }

    if (purpose === "reset_password" && !existing) {
      return res.status(404).json({ error: "No warrior account found with this email." });
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
 * Resets user battle passcode after verifying OTP
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

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
    const user = await UserRepository.findByEmail(cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "No warrior account found with this email." });
    }

    // Verify and consume OTP for reset_password
    const verification = await OtpService.verifyOtp(cleanEmail, otp, "reset_password", true);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error || "Invalid or expired verification code." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user password in database
    await UserRepository.updateById(user.id || user._id, { passwordHash });

    console.log(`[Auth] 🔑 Passcode reset successfully for warrior: ${user.name} (${cleanEmail})`);

    res.json({
      success: true,
      message: "Battle passcode reset successfully! You may now enter the battle arena.",
    });
  } catch (err) {
    console.error("[Auth] reset-password error:", err);
    res.status(500).json({ error: "Failed to reset passcode. Please try again." });
  }
});

/**
 * POST /api/auth/signup
 * Registers a new user after verifying OTP code
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp, avatarColor = "#f59e0b", title = "Dragon Novice" } = req.body;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: "Warrior nickname must be at least 2 characters." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (!otp) {
      return res.status(400).json({ error: "Email OTP verification code is required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserRepository.findByEmail(cleanEmail);
    if (existing) {
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

    // Create user
    const newUser = await UserRepository.create({
      name: String(name).trim().slice(0, 30),
      email: cleanEmail,
      passwordHash,
      role: "user",
      isVerified: true,
      coins: 2500,
      level: 1,
      xp: 0,
      wins: 0,
      matches: 0,
      avatarColor,
      bio: "Fierce dragon warrior ready for battle.",
      title,
    });

    const token = TokenService.generateToken(newUser);
    const userJson = newUser.toPublicJSON ? newUser.toPublicJSON() : newUser;

    console.log(`[Auth] 🐉 New warrior registered: ${newUser.name} (${cleanEmail})`);

    res.status(201).json({
      success: true,
      message: "Warrior registered successfully!",
      token,
      user: userJson,
    });
  } catch (err) {
    console.error("[Auth] signup error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and issues JWT token
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ error: "Please enter your email and password." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: `Your account has been banished: ${user.banReason || "Terms of Service violation."}`,
        isBanned: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Update last login
    await UserRepository.updateById(user.id || user._id, { lastLoginAt: new Date() });

    const token = TokenService.generateToken(user);
    const userJson = user.toPublicJSON ? user.toPublicJSON() : user;

    console.log(`[Auth] ⚔️ Warrior logged in: ${user.name} [Role: ${user.role}]`);

    res.json({
      success: true,
      token,
      user: userJson,
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
    res.json({ user: userJson });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user session." });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user profile details
 */
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, bio, title, avatarColor } = req.body;
    const updates = {};

    if (name && String(name).trim().length >= 2) {
      updates.name = String(name).trim().slice(0, 30);
    }
    if (bio !== undefined) {
      updates.bio = String(bio).trim().slice(0, 160);
    }
    if (title !== undefined) {
      updates.title = String(title).trim().slice(0, 40);
    }
    if (avatarColor) {
      updates.avatarColor = String(avatarColor).slice(0, 10);
    }

    const updatedUser = await UserRepository.updateById(req.user.id || req.user._id, updates);
    const userJson = updatedUser.toPublicJSON ? updatedUser.toPublicJSON() : updatedUser;

    res.json({
      success: true,
      message: "Warrior profile updated successfully.",
      user: userJson,
    });
  } catch (err) {
    console.error("[Auth] update profile error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

/**
 * POST /api/auth/seed-demo
 * Seeds initial demo admin and warrior accounts if absent
 */
router.post("/seed-demo", async (_req, res) => {
  try {
    // Seed Admin
    let admin = await UserRepository.findByEmail("admin@scribbleroyale.io");
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("admin123", salt);
      admin = await UserRepository.create({
        name: "Dragon Grandmaster",
        email: "admin@scribbleroyale.io",
        passwordHash: hash,
        role: "admin",
        isVerified: true,
        coins: 99999,
        level: 50,
        xp: 15000,
        wins: 142,
        matches: 160,
        avatarColor: "#ef4444",
        bio: "Supreme Sovereign of the Dragon Dynasty.",
        title: "Imperial Grandmaster",
      });
    }

    // Seed Demo User
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
        admin: { email: "admin@scribbleroyale.io", password: "admin123", role: "admin" },
        user: { email: "warrior@scribbleroyale.io", password: "warrior123", role: "user" },
      },
    });
  } catch (err) {
    console.error("[Auth] seed-demo error:", err);
    res.status(500).json({ error: "Failed to seed demo accounts." });
  }
});

export default router;
