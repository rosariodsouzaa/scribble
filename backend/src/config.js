// Central configuration for Scribble Royale game rules, scoring, and server settings.
export const config = {
  port: Number(process.env.PORT) || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  // Game rules
  roundDurationSec: 60, // Total seconds a drawer has per turn
  maxRoundsDefault: 3, // Default total rounds
  minPlayers: 2, // Minimum warriors needed to start

  // Dynamic Time-Based & Rank-Based Scoring System
  scoring: {
    guesser: {
      base: 100, // Base points for guessing correctly
      speedMax: 300, // Max speed bonus (scaled by timeLeft / totalDuration)
      rankBonuses: [100, 60, 30, 10], // 1st, 2nd, 3rd, 4th+ place guessers
    },
    drawer: {
      basePerGuesser: 50, // Base points per correct guesser
      speedMaxPerGuesser: 50, // Speed bonus per guesser
      allGuessedBonus: 100, // Bonus if 100% of warriors guess correctly
    },
  },

  // Pacing & Hints
  firstGuessMaxTimeSec: 30, // Cap timer to 30s when first player guesses correctly
  roundEndDelayMs: 4500, // Duration to show round summary before next turn

  // Housekeeping for in-memory rooms
  emptyRoomGraceMs: 60_000,
  sweepIntervalMs: 30_000,

  // Database & Auth Configuration (Loaded securely from .env)
  databaseUrl: process.env.DATABASE_URL || "",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "scribble_royale_dragon_secret_dev_key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiryMinutes: 10,
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFrom: process.env.RESEND_FROM || "Scribble Royale <noreply@bestere.in>",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Scribble Royale <noreply@scribbleroyale.io>",
  },
};
