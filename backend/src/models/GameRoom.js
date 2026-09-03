import { config } from "../config.js";
import { Player } from "./Player.js";
import { Round } from "./Round.js";
import { StandardScoringStrategy } from "../services/scoring/StandardScoringStrategy.js";
import { WordDictionary } from "../services/words/WordDictionary.js";

/**
 * GameRoom Domain Aggregate & State Machine
 * Encapsulates game lifecycle, player management, round progression, timer execution,
 * dynamic scoring, anti-leak state serialization, and session reconnection.
 */
export class GameRoom {
  /**
   * @param {string} code - Unique 6-character room code
   * @param {object} options - Initial room settings
   * @param {import("socket.io").Server} [io] - Socket.io Server instance
   */
  constructor(code, options = {}, io = null) {
    this.code = code.toUpperCase();
    this.io = io;
    this.hostId = null;
    this.state = "waiting"; // waiting | playing | roundEnd | gameEnd
    this.settings = {
      maxRounds: Number(options.maxRounds) || config.maxRoundsDefault,
      roundDurationSec: Number(options.roundDurationSec) || config.roundDurationSec,
      theme: options.theme || "all",
      customWords: Array.isArray(options.customWords) ? options.customWords : null,
    };
    this.players = new Map(); // socketId -> Player
    this.round = null;
    this.roundNumber = 0;
    this.usedWords = new Set();
    this.scoringStrategy = new StandardScoringStrategy();
    this.timers = { tick: null, nextRound: null };
    this.emptySince = Date.now();
  }

  /**
   * Set Socket.io server reference
   * @param {import("socket.io").Server} io 
   */
  setIo(io) {
    this.io = io;
  }

  /**
   * Room broadcast channel name
   */
  get channel() {
    return `room:${this.code}`;
  }

  /**
   * Broadcast an event to all connected sockets in this room
   * @param {string} event 
   * @param {object} payload 
   */
  broadcast(event, payload) {
    if (this.io) {
      this.io.to(this.channel).emit(event, payload);
    }
  }

  /**
   * Find an existing player by persistent clientId
   * @param {string} clientId 
   * @returns {Player|null}
   */
  findPlayerByClientId(clientId) {
    if (!clientId) return null;
    for (const player of this.players.values()) {
      if (player.clientId === clientId) return player;
    }
    return null;
  }

  /**
   * Add or re-attach a player to the room
   * @param {import("socket.io").Socket} socket 
   * @param {object} param1 
   * @returns {Player|null}
   */
  addPlayer(socket, { username, clientId }) {
    // 1. Check if the exact socket is already registered
    if (this.players.has(socket.id)) {
      socket.emit("room-state", this.serialize(socket.id));
      return this.players.get(socket.id);
    }

    // 2. Check for session reconnection by clientId
    const existingPlayer = this.findPlayerByClientId(clientId);
    if (existingPlayer) {
      const oldSocketId = existingPlayer.id;
      this.players.delete(oldSocketId);

      existingPlayer.updateSocketId(socket.id);
      if (username) {
        existingPlayer.username = Player.sanitizeName(username);
      }
      this.players.set(socket.id, existingPlayer);

      // Transfer host status if applicable
      if (this.hostId === oldSocketId) {
        this.hostId = socket.id;
      }

      // Transfer drawer status if currently drawing
      if (this.round && this.round.drawerId === oldSocketId) {
        this.round.drawerId = socket.id;
      }

      this.emptySince = null;
      socket.join(this.channel);
      socket.data.roomCode = this.code;

      // Deliver state and secret word if drawer
      socket.emit("room-state", this.serialize(socket.id));
      if (this.state === "playing" && this.round && this.round.drawerId === socket.id) {
        socket.emit("new-word", { word: this.round.word });
      }

      this.broadcast("player-updated", {
        playerId: socket.id,
        isReady: existingPlayer.isReady,
        players: this.serializePlayers(),
      });

      return existingPlayer;
    }

    // 3. New player joining during active match -> reject
    if (this.state !== "waiting") {
      socket.emit("game-error", {
        code: "game-in-progress",
        message: "This dragon battle has already started.",
      });
      return null;
    }

    // 4. New player joining in waiting room
    const isHost = this.players.size === 0;
    const player = new Player(socket.id, username, clientId, isHost);
    this.players.set(socket.id, player);

    if (isHost) {
      this.hostId = socket.id;
    }
    this.emptySince = null;

    socket.join(this.channel);
    socket.data.roomCode = this.code;

    socket.emit("room-state", this.serialize(socket.id));
    this.broadcast("player-joined", {
      player: player.serialize(),
      players: this.serializePlayers(),
      hostId: this.hostId,
    });

    return player;
  }

  /**
   * Toggle or set player readiness
   * @param {string} socketId 
   * @param {boolean} ready 
   */
  setPlayerReady(socketId, ready) {
    const player = this.players.get(socketId);
    if (!player || this.state !== "waiting") return;

    player.setReady(ready);
    this.broadcast("player-updated", {
      playerId: socketId,
      isReady: player.isReady,
    });
  }

  /**
   * Remove a player from the room
   * @param {string} socketId 
   * @param {string} reason 
   */
  removePlayer(socketId, reason = "left") {
    const wasDrawer = this.round && this.round.drawerId === socketId;
    const wasHost = this.hostId === socketId;

    if (!this.players.delete(socketId)) return;

    if (this.players.size === 0) {
      this.emptySince = Date.now();
      this.clearTimers();
      return;
    }

    if (wasHost) {
      const nextHost = this.players.values().next().value;
      if (nextHost) {
        this.hostId = nextHost.id;
        nextHost.setHost(true);
      }
    }

    this.broadcast("player-left", {
      playerId: socketId,
      players: this.serializePlayers(),
      hostId: this.hostId,
      reason,
    });

    // Check if player count dropped below minPlayers during an active match
    if ((this.state === "playing" || this.state === "roundEnd") && this.getConnectedPlayersCount() < config.minPlayers) {
      this.abortGame("not-enough-players", "Battle paused: Not enough clan warriors to continue.");
      return;
    }

    if (this.state === "playing") {
      if (wasDrawer) {
        this.endRound("drawer-left");
      } else if (this.round && this.round.isAllGuessed(this.getConnectedNonDrawersCount())) {
        this.endRound("all-guessed");
      }
    }
  }

  /**
   * Abort game match when players drop out, restoring waiting lobby
   * @param {string} code 
   * @param {string} message 
   */
  abortGame(code, message) {
    this.clearTimers();
    this.state = "waiting";
    this.round = null;
    this.roundNumber = 0;

    for (const p of this.players.values()) {
      p.setReady(false);
    }

    this.broadcast("game-aborted", {
      code,
      message,
      players: this.serializePlayers(),
    });

    this.broadcast("room-state", this.serialize());
  }

  /**
   * Start the multiplayer game
   * @param {string} socketId 
   * @returns {boolean}
   */
  startGame(socketId) {
    if (this.state !== "waiting") {
      this.emitError(socketId, "not-waiting", "Game cannot start now.");
      return false;
    }
    if (socketId !== this.hostId) {
      this.emitError(socketId, "not-host", "Only the host can start.");
      return false;
    }
    if (this.players.size < config.minPlayers) {
      this.emitError(
        socketId,
        "not-enough-players",
        `Need at least ${config.minPlayers} players to ignite the battle.`
      );
      return false;
    }
    if (![...this.players.values()].every((p) => p.isReady)) {
      this.emitError(socketId, "not-ready", "All clan members must be ready.");
      return false;
    }

    for (const player of this.players.values()) {
      player.resetScore();
    }
    this.usedWords.clear();
    this.roundNumber = 0;
    this.state = "playing";

    this.broadcast("game-started", { settings: this.settings });
    this.startRound();
    return true;
  }

  /**
   * Start a new drawing round
   */
  startRound() {
    this.clearTimers();

    this.roundNumber += 1;
    if (this.roundNumber > this.settings.maxRounds) {
      this.endGame();
      return;
    }

    const drawerId = this.getNextDrawerId();
    const word = WordDictionary.pickWord(this.usedWords, this.settings);
    this.usedWords.add(word.toLowerCase());

    this.round = new Round(this.roundNumber, drawerId, word, this.settings.roundDurationSec);
    this.state = "playing";

    const drawerName = this.players.get(drawerId)?.username ?? "Unknown Warrior";

    this.broadcast("clear-canvas", {});
    this.broadcast("round-start", {
      number: this.round.number,
      maxRounds: this.settings.maxRounds,
      drawerId,
      drawerName,
      endsAt: this.round.endsAt,
      roundDurationSec: this.settings.roundDurationSec,
      maskedWord: this.round.maskedWord,
      wordLength: this.round.wordLength,
    });

    // Reveal secret word exclusively to drawer
    if (this.io && drawerId) {
      this.io.to(drawerId).emit("new-word", { word });
    }

    // Interval ticker for progressive hints & timer synchronization
    this.timers.tick = setInterval(() => {
      if (!this.round) return;

      const totalSec = this.settings.roundDurationSec;
      const remaining = this.round.timeRemainingSec();

      // Progressive hint reveal
      if (this.round.canRevealProgressiveHint(totalSec)) {
        this.revealHint();
      }

      this.broadcast("timer-tick", { remaining });

      if (remaining <= 0) {
        this.endRound("timeout");
      }
    }, 1000);
  }

  /**
   * Reveal progressive hint letter
   */
  revealHint() {
    if (!this.round) return;
    const hint = this.round.revealHintLetter();
    if (hint) {
      this.broadcast("hint-update", {
        maskedWord: this.round.maskedWord,
        hintsGiven: this.round.hintsGiven,
        letter: hint.letter,
        index: hint.index,
      });
      this.broadcast("guess-result", {
        correct: false,
        isSystem: true,
        text: `💡 Hint: Letter "${hint.letter}" revealed!`,
      });
    }
  }

  /**
   * Process a guess submitted by a player
   * @param {string} socketId 
   * @param {string} rawText 
   */
  handleGuess(socketId, rawText) {
    if (this.state !== "playing" || !this.round) return;

    const guesser = this.players.get(socketId);
    if (!guesser) return;
    if (socketId === this.round.drawerId) return; // Drawer cannot guess
    if (this.round.hasGuessed(socketId)) return; // Already guessed

    const text = String(rawText || "");
    const normalized = GameRoom.normalizeText(text);
    if (!normalized) return;

    if (normalized === GameRoom.normalizeText(this.round.word)) {
      const remaining = Math.max(1, this.round.timeRemainingSec());
      const rankIndex = this.round.correctGuessers.size;
      const totalSec = this.settings.roundDurationSec;

      const guesserPoints = this.scoringStrategy.calculateGuesserPoints(remaining, totalSec, rankIndex);
      const drawerPoints = this.scoringStrategy.calculateDrawerPoints(remaining, totalSec);

      this.round.recordGuess(socketId, guesserPoints);
      guesser.addScore(guesserPoints);

      const drawer = this.players.get(this.round.drawerId);
      if (drawer) {
        drawer.addScore(drawerPoints);
        this.round.addRoundScore(drawer.id, drawerPoints);
      }

      // First guess time-shortening
      if (!this.round.firstGuessHappened) {
        this.round.firstGuessHappened = true;
        if (remaining > config.firstGuessMaxTimeSec) {
          this.round.capRemainingTime(config.firstGuessMaxTimeSec);
          this.broadcast("timer-tick", { remaining: config.firstGuessMaxTimeSec });
        }
      }

      this.broadcast("guess-result", {
        correct: true,
        playerId: socketId,
        username: guesser.username,
        points: guesserPoints,
        rank: rankIndex + 1,
        drawerPoints,
        drawerName: drawer?.username,
      });

      this.broadcast("score-update", {
        players: this.serializePlayers(),
      });

      if (this.round.isAllGuessed(this.getConnectedNonDrawersCount())) {
        if (drawer) {
          const allBonus = this.scoringStrategy.getAllGuessedBonus();
          drawer.addScore(allBonus);
          this.round.addRoundScore(drawer.id, allBonus);
        }
        this.endRound("all-guessed");
      }
    } else {
      this.broadcast("guess-result", {
        correct: false,
        playerId: socketId,
        username: guesser.username,
        text: text.slice(0, 120),
      });
    }
  }

  /**
   * Complete the round and schedule the next
   * @param {string} reason 
   */
  endRound(reason) {
    if (this.state !== "playing" || !this.round) return;

    // Atomic state mutation prevents concurrent timer races
    this.state = "roundEnd";
    this.clearTickTimer();

    const isLastRound = this.roundNumber >= this.settings.maxRounds;
    const playersWithDelta = [...this.players.values()].map((p) => ({
      ...p.serialize(),
      roundDelta: this.round.getRoundScore(p.id),
    }));

    this.broadcast("round-end", {
      word: this.round.word,
      reason,
      players: playersWithDelta,
      number: this.round.number,
      maxRounds: this.settings.maxRounds,
      nextIn: isLastRound ? 0 : config.roundEndDelayMs,
    });

    clearTimeout(this.timers.nextRound);
    this.timers.nextRound = setTimeout(() => {
      if (this.players.size === 0) return;
      if (isLastRound) this.endGame();
      else this.startRound();
    }, config.roundEndDelayMs);
  }

  /**
   * Finalize the match and compute podium standings
   */
  endGame() {
    this.clearTimers();
    this.state = "gameEnd";

    const standings = [...this.players.values()]
      .map((p) => p.serialize())
      .sort((a, b) => b.score - a.score);

    this.broadcast("game-end", {
      standings,
      winnerId: standings.length > 0 ? standings[0].id : null,
    });
  }

  /**
   * Reset the chamber back to waiting state so all teammates stay in the room for another match
   * @param {string} [socketId]
   */
  resetToWaiting(socketId = null) {
    this.clearTimers();
    this.round = null;
    this.roundNumber = 0;
    this.usedWords.clear();
    this.state = "waiting";

    for (const player of this.players.values()) {
      player.resetScore();
      player.setReady(false);
    }

    console.log(`[GameRoom] 🔄 Chamber ${this.code} returned to waiting room. Teammates retained: ${this.players.size}`);

    this.broadcast("room-state", this.serialize());
    this.broadcast("player-updated", {
      players: this.serializePlayers(),
    });
    return true;
  }

  /**
   * Clean up all timers and resources
   */
  destroy() {
    this.clearTimers();
    this.players.clear();
  }

  clearTickTimer() {
    if (this.timers.tick) {
      clearInterval(this.timers.tick);
      this.timers.tick = null;
    }
  }

  clearTimers() {
    this.clearTickTimer();
    if (this.timers.nextRound) {
      clearTimeout(this.timers.nextRound);
      this.timers.nextRound = null;
    }
  }

  /**
   * Determine the next drawer using rotation
   * @returns {string|null}
   */
  getNextDrawerId() {
    const ids = [...this.players.keys()];
    if (ids.length === 0) return null;
    const prev = this.round?.drawerId;
    const start = prev && ids.includes(prev) ? ids.indexOf(prev) + 1 : 0;
    for (let i = 0; i < ids.length; i++) {
      const p = this.players.get(ids[(start + i) % ids.length]);
      if (p && p.connected) return p.id;
    }
    return ids[0];
  }

  /**
   * Number of total connected players
   * @returns {number}
   */
  getConnectedPlayersCount() {
    let count = 0;
    for (const p of this.players.values()) {
      if (p.connected) count++;
    }
    return count;
  }

  /**
   * Number of non-drawer active players
   * @returns {number}
   */
  getConnectedNonDrawersCount() {
    let count = 0;
    const currentDrawerId = this.round?.drawerId;
    for (const p of this.players.values()) {
      if (p.connected && p.id !== currentDrawerId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Helper to serialize all players in room
   */
  serializePlayers() {
    return [...this.players.values()].map((p) => p.serialize());
  }

  /**
   * Serialize room for client with anti-leak protection
   * @param {string} [forSocketId] 
   */
  serialize(forSocketId = null) {
    const amDrawer = Boolean(forSocketId && this.round && forSocketId === this.round.drawerId);
    const drawerName = this.round?.drawerId
      ? this.players.get(this.round.drawerId)?.username ?? null
      : null;

    return {
      code: this.code,
      hostId: this.hostId,
      state: this.state,
      settings: this.settings,
      players: this.serializePlayers(),
      round: this.round
        ? this.round.serialize(amDrawer, drawerName)
        : {
            number: 0,
            drawerId: null,
            drawerName: null,
            endsAt: 0,
            maskedWord: null,
            wordLength: 0,
          },
    };
  }

  emitError(socketId, code, message) {
    if (this.io && socketId) {
      this.io.to(socketId).emit("game-error", { code, message });
    }
  }

  static normalizeText(str) {
    return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }
}
