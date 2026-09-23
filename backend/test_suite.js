import { GameRoom } from "./src/models/GameRoom.js";
import { Player } from "./src/models/Player.js";
import { Round } from "./src/models/Round.js";
import { maskWord } from "./src/rooms/mask.js";
import { WordDictionary } from "./src/services/words/WordDictionary.js";
import { StandardScoringStrategy } from "./src/services/scoring/StandardScoringStrategy.js";
import { OtpService } from "./src/services/auth/OtpService.js";
import { OtpRepository } from "./src/models/Otp.js";
import { UserRepository } from "./src/models/User.js";
import { TokenService } from "./src/services/auth/TokenService.js";
import { DrawRelayHandler } from "./src/socket/DrawRelayHandler.js";
import { roomRepository } from "./src/repositories/RoomRepository.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

async function runTests() {
  console.log("=== STARTING FULL BACKEND INTEGRATION & LOGIC TEST SUITE ===\n");

  // -------------------------------------------------------------
  // Test 1: WordDictionary & Hints
  // -------------------------------------------------------------
  console.log("[1] WordDictionary & Masking Tests:");
  const testWord = "Dragon";
  const masked = maskWord(testWord);
  assert(masked.replace(/\s/g, "") === "_".repeat(testWord.length), "Word is fully masked with spaced underscores");

  const pickedWord = WordDictionary.pickWord(new Set(), { theme: "all" });
  assert(typeof pickedWord === "string" && pickedWord.length > 0, `WordDictionary picks valid word: "${pickedWord}"`);

  const customWord = WordDictionary.pickWord(new Set(), { customWords: ["Phoenix"] });
  assert(customWord.toLowerCase() === "phoenix", `WordDictionary picks custom word: "${customWord}"`);

  // -------------------------------------------------------------
  // Test 2: Scoring Strategy
  // -------------------------------------------------------------
  console.log("\n[2] StandardScoringStrategy Tests:");
  const scorer = new StandardScoringStrategy();
  const guesserScoreFast = scorer.calculateGuesserPoints(60, 60, 0);
  const guesserScoreSlow = scorer.calculateGuesserPoints(5, 60, 2);
  assert(guesserScoreFast > guesserScoreSlow, `Fast 1st guess score (${guesserScoreFast}) > slow 3rd guess score (${guesserScoreSlow})`);

  const drawerScore = scorer.calculateDrawerPoints(40, 60);
  assert(drawerScore > 0, `Drawer points are awarded: ${drawerScore}`);

  const allBonus = scorer.getAllGuessedBonus();
  assert(allBonus === 100, `All-guessed bonus is correct: ${allBonus}`);

  // -------------------------------------------------------------
  // Test 3: OTP Service & Attempt Lockout
  // -------------------------------------------------------------
  console.log("\n[3] OtpService & Security Tests:");
  const testEmail = "testwarrior@example.com";
  const otpRes = await OtpService.sendOtp(testEmail, "signup");
  assert(otpRes.success === true, "OTP generated successfully");
  assert(typeof otpRes.simulatedOtp === "string" && otpRes.simulatedOtp.length === 6, `Generated 6-digit OTP: ${otpRes.simulatedOtp}`);

  // Pre-verification check without consume
  const preCheck = await OtpService.verifyOtp(testEmail, otpRes.simulatedOtp, "signup", false);
  assert(preCheck.valid === true, "Pre-verification succeeds");

  // Incorrect code check
  const badCheck = await OtpService.verifyOtp(testEmail, "000000", "signup", false);
  assert(badCheck.valid === false, "Bad OTP is rejected correctly");

  // Final consumption check
  const consumeCheck = await OtpService.verifyOtp(testEmail, otpRes.simulatedOtp, "signup", true);
  assert(consumeCheck.valid === true, "Final OTP consumption succeeds");

  // Re-check consumed OTP (should fail)
  const reuseCheck = await OtpService.verifyOtp(testEmail, otpRes.simulatedOtp, "signup", true);
  assert(reuseCheck.valid === false, "Consumed OTP cannot be reused");

  // -------------------------------------------------------------
  // Test 4: TokenService (JWT)
  // -------------------------------------------------------------
  console.log("\n[4] TokenService (JWT) Tests:");
  const dummyPayload = { id: "usr_123", email: "user@test.com", role: "user" };
  const token = TokenService.generateToken(dummyPayload);
  assert(typeof token === "string" && token.length > 20, "JWT token generated");

  const verified = TokenService.verifyToken(token);
  assert(verified && verified.id === "usr_123", "JWT token verified correctly");

  const invalidToken = TokenService.verifyToken("invalid.jwt.token");
  assert(invalidToken === null, "Invalid JWT returns null safely without throwing uncaught error");

  // -------------------------------------------------------------
  // Test 5: GameRoom Lifecycle, Turns & Guesses
  // -------------------------------------------------------------
  console.log("\n[5] GameRoom State Machine & Match Flow Tests:");
  const mockIo = {
    to: (channel) => ({
      emit: (event, data) => {},
    }),
  };

  const room = new GameRoom("TEST01", { maxRounds: 2, roundDurationSec: 60 }, mockIo);
  assert(room.code === "TEST01", `Room created with code ${room.code}`);
  assert(room.state === "waiting", "Room initial state is 'waiting'");

  // Mock Sockets
  const socketHost = { id: "sock_host", emit: () => {}, join: () => {}, data: {} };
  const socketP2 = { id: "sock_p2", emit: () => {}, join: () => {}, data: {} };

  const p1 = room.addPlayer(socketHost, { username: "HostPlayer", clientId: "c1" });
  assert(p1 !== null && p1.isHost === true, "Host added with host privileges");
  assert(room.hostId === "sock_host", "Room hostId assigned correctly");

  const p2 = room.addPlayer(socketP2, { username: "GuesserPlayer", clientId: "c2" });
  assert(p2 !== null && p2.isHost === false, "Second player added");

  // Starting game when not ready should fail
  const startFailNotReady = room.startGame("sock_host");
  assert(startFailNotReady === false, "Game start rejected when players are not ready");

  // Set ready
  room.setPlayerReady("sock_host", true);
  room.setPlayerReady("sock_p2", true);
  assert(p1.isReady === true && p2.isReady === true, "Both players marked ready");

  // Start game
  const startSuccess = room.startGame("sock_host");
  assert(startSuccess === true, "Game starts successfully with ready players");
  assert(room.state === "playing", "Room state transitioned to 'playing'");
  assert(room.round !== null, "Round object initialized");
  assert(room.round.drawerId === "sock_host", `Drawer assigned (${room.round.drawerId})`);

  const secretWord = room.round.word;
  assert(typeof secretWord === "string" && secretWord.length > 0, `Secret word assigned: ${secretWord}`);

  // Guesses
  // 1. Drawer trying to guess should be ignored
  room.handleGuess("sock_host", secretWord);
  assert(!room.round.hasGuessed("sock_host"), "Drawer cannot guess own word");

  // 2. Wrong guess
  room.handleGuess("sock_p2", "wrongguess");
  assert(!room.round.hasGuessed("sock_p2"), "Wrong guess does not credit points");

  // 3. Correct guess
  room.handleGuess("sock_p2", secretWord);
  assert(room.round.hasGuessed("sock_p2"), "Correct guess registered");
  assert(p2.score > 0, `Guesser awarded score: ${p2.score}`);
  assert(p1.score > 0, `Drawer awarded score: ${p1.score}`);

  // Test Rematch / ResetToWaiting
  room.resetToWaiting("sock_host");
  assert(room.state === "waiting", "Room reset to waiting for rematch");
  assert(room.players.size === 2, "Both teammates retained in room after match");
  assert(p1.score === 0 && p2.score === 0, "Scores reset for next match");

  // -------------------------------------------------------------
  // Test 6: Rate Limiting in DrawRelayHandler
  // -------------------------------------------------------------
  console.log("\n[6] DrawRelayHandler Rate Limiting Tests:");
  const relay = new DrawRelayHandler(mockIo, roomRepository);
  const testSockId = "rate_limit_test_sock";
  let allowedPackets = 0;
  for (let i = 0; i < 70; i++) {
    if (relay.checkRateLimit(testSockId)) {
      allowedPackets++;
    }
  }
  assert(allowedPackets === DrawRelayHandler.MAX_PACKETS_PER_SEC, `Rate limiter strictly caps at ${DrawRelayHandler.MAX_PACKETS_PER_SEC} packets/sec (got ${allowedPackets})`);

  // -------------------------------------------------------------
  // Cleanup & Summary
  // -------------------------------------------------------------
  room.destroy();
  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test Suite Runtime Error:", err);
  process.exit(1);
});
