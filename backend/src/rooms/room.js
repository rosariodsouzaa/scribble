// Authoritative game state machine & scoring engine for Scribble Royale.
// Owns word selection, timers, progressive hints, dynamic time-based point distribution,
// and anti-leak room serialization.

import { config } from "../config.js";
import { store } from "./store.js";
import { pickWord } from "./words.js";
import { maskWord, getEligibleHintIndices, getMaxHints } from "./mask.js";

const roomChannel = (code) => `room:${code}`;

// ---------------------------------------------------------------------------
// Dynamic Scoring Calculations
// ---------------------------------------------------------------------------
function calculateGuesserPoints(remainingSec, totalSec, rankIndex) {
  const ratio = Math.max(0, Math.min(1, remainingSec / totalSec));
  const base = config.scoring.guesser.base;
  const speedBonus = Math.round(ratio * config.scoring.guesser.speedMax);
  const rankBonus = config.scoring.guesser.rankBonuses[rankIndex] ?? 10;
  return base + speedBonus + rankBonus;
}

function calculateDrawerPoints(remainingSec, totalSec) {
  const ratio = Math.max(0, Math.min(1, remainingSec / totalSec));
  const base = config.scoring.drawer.basePerGuesser;
  const speedBonus = Math.round(ratio * config.scoring.drawer.speedMaxPerGuesser);
  return base + speedBonus;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
export function createRoom(code, options = {}) {
  const room = {
    code,
    hostId: null,
    state: "waiting", // waiting | playing | roundEnd | gameEnd
    settings: {
      maxRounds: Number(options.maxRounds) || config.maxRoundsDefault,
      roundDurationSec: Number(options.roundDurationSec) || config.roundDurationSec,
      theme: options.theme || "all",
      customWords: Array.isArray(options.customWords) ? options.customWords : null,
    },
    players: new Map(), // socketId -> player (insertion order drives drawer rotation)
    round: {
      number: 0,
      drawerId: null,
      word: null, // SERVER-ONLY — never broadcast except to drawer / at round end
      maskedWord: null,
      wordLength: 0,
      endsAt: 0,
      revealedIndices: new Set(),
      hintsGiven: 0,
      firstGuessHappened: false,
      correctGuessers: new Set(),
      roundScores: new Map(), // playerId -> points earned this round
    },
    usedWords: new Set(),
    timers: { tick: null, nextRound: null },
    emptySince: Date.now(),
  };
  store.set(code, room);
  return room;
}

function makePlayer(socketId, username, clientId, isHost) {
  return {
    id: socketId,
    clientId: clientId || null,
    username,
    score: 0,
    isReady: false,
    connected: true,
    isHost,
  };
}

// ---------------------------------------------------------------------------
// Serialization — Anti-Leak Protection
// ---------------------------------------------------------------------------
export function serializePlayer(p) {
  return {
    id: p.id,
    username: p.username,
    score: p.score,
    isReady: p.isReady,
    connected: p.connected,
    isHost: p.isHost,
  };
}

export function serializeRoom(room, forSocketId) {
  const amDrawer = !!forSocketId && forSocketId === room.round.drawerId;
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    settings: room.settings,
    players: [...room.players.values()].map(serializePlayer),
    round: {
      number: room.round.number,
      drawerId: room.round.drawerId,
      drawerName: room.round.drawerId
        ? room.players.get(room.round.drawerId)?.username ?? null
        : null,
      endsAt: room.round.endsAt,
      maskedWord: room.round.maskedWord,
      wordLength: room.round.wordLength,
      word: amDrawer ? room.round.word : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------
export function addPlayer(io, room, socket, { username, clientId }) {
  if (room.players.has(socket.id)) {
    socket.emit("room-state", serializeRoom(room, socket.id));
    return room.players.get(socket.id);
  }
  if (room.state !== "waiting") {
    socket.emit("game-error", {
      code: "game-in-progress",
      message: "This dragon battle has already started.",
    });
    return null;
  }

  const cleanName = String(username || "").trim().slice(0, 20) || "Warrior";
  const isHost = room.players.size === 0;
  const player = makePlayer(socket.id, cleanName, clientId, isHost);
  room.players.set(socket.id, player);
  if (isHost) room.hostId = socket.id;
  room.emptySince = null;

  socket.join(roomChannel(room.code));
  socket.data.roomCode = room.code;

  socket.emit("room-state", serializeRoom(room, socket.id));
  io.to(roomChannel(room.code)).emit("player-joined", {
    player: serializePlayer(player),
    players: [...room.players.values()].map(serializePlayer),
    hostId: room.hostId,
  });
  return player;
}

export function setReady(io, room, socketId, ready) {
  const p = room.players.get(socketId);
  if (!p || room.state !== "waiting") return;
  p.isReady = !!ready;
  io.to(roomChannel(room.code)).emit("player-updated", {
    playerId: socketId,
    isReady: p.isReady,
  });
}

export function removePlayer(io, room, socketId, reason) {
  const wasDrawer = room.round.drawerId === socketId;
  const wasHost = room.hostId === socketId;
  if (!room.players.delete(socketId)) return;

  if (room.players.size === 0) {
    destroyRoom(room);
    return;
  }

  if (wasHost) {
    const first = room.players.values().next().value;
    room.hostId = first.id;
    first.isHost = true;
  }

  io.to(roomChannel(room.code)).emit("player-left", {
    playerId: socketId,
    players: [...room.players.values()].map(serializePlayer),
    hostId: room.hostId,
    reason,
  });

  if (room.state === "playing") {
    if (wasDrawer) {
      endRound(io, room, "drawer-left");
    } else if (allGuessed(room)) {
      endRound(io, room, "all-guessed");
    }
  }
}

// ---------------------------------------------------------------------------
// Game & Round Lifecycle
// ---------------------------------------------------------------------------
export function startGame(io, room, socketId) {
  if (room.state !== "waiting") return err(io, socketId, "not-waiting", "Game cannot start now.");
  if (socketId !== room.hostId) return err(io, socketId, "not-host", "Only the host can start.");
  if (room.players.size < config.minPlayers)
    return err(io, socketId, "not-enough-players", `Need at least ${config.minPlayers} players to ignite the battle.`);
  if (![...room.players.values()].every((p) => p.isReady))
    return err(io, socketId, "not-ready", "All clan members must be ready.");

  for (const p of room.players.values()) p.score = 0;
  room.usedWords.clear();
  room.round.number = 0;
  room.round.drawerId = null;
  room.state = "playing";

  io.to(roomChannel(room.code)).emit("game-started", { settings: room.settings });
  startRound(io, room);
}

export function startRound(io, room) {
  clearTimeout(room.timers.nextRound);
  room.timers.nextRound = null;

  room.round.number += 1;
  if (room.round.number > room.settings.maxRounds) {
    endGame(io, room);
    return;
  }

  const drawerId = nextDrawer(room);
  const word = pickWord(room.usedWords, room.settings);
  room.usedWords.add(word.toLowerCase());

  room.round.drawerId = drawerId;
  room.round.word = word;
  room.round.revealedIndices = new Set();
  room.round.hintsGiven = 0;
  room.round.firstGuessHappened = false;
  room.round.maskedWord = maskWord(word, room.round.revealedIndices);
  room.round.wordLength = word.replace(/\s/g, "").length;
  room.round.endsAt = Date.now() + room.settings.roundDurationSec * 1000;
  room.round.correctGuessers = new Set();
  room.round.roundScores = new Map();
  room.state = "playing";

  const channel = roomChannel(room.code);
  io.to(channel).emit("clear-canvas", {});
  io.to(channel).emit("round-start", {
    number: room.round.number,
    maxRounds: room.settings.maxRounds,
    drawerId,
    drawerName: room.players.get(drawerId)?.username ?? "Unknown Warrior",
    endsAt: room.round.endsAt,
    roundDurationSec: room.settings.roundDurationSec,
    maskedWord: room.round.maskedWord,
    wordLength: room.round.wordLength,
  });

  // Reveal the secret word solely to the drawer
  io.to(drawerId).emit("new-word", { word });

  clearInterval(room.timers.tick);
  room.timers.tick = setInterval(() => {
    const totalSec = room.settings.roundDurationSec;
    const remaining = Math.max(0, Math.ceil((room.round.endsAt - Date.now()) / 1000));
    
    // Progressive Letter Hint Unlocks (Skribbl-style)
    const wordLen = room.round.wordLength;
    const maxHints = getMaxHints(wordLen);
    
    if (maxHints >= 1 && room.round.hintsGiven === 0 && remaining <= totalSec * 0.65) {
      revealHintLetter(io, room);
    } else if (maxHints >= 2 && room.round.hintsGiven === 1 && remaining <= totalSec * 0.40) {
      revealHintLetter(io, room);
    } else if (maxHints >= 3 && room.round.hintsGiven === 2 && remaining <= totalSec * 0.20) {
      revealHintLetter(io, room);
    }

    io.to(channel).emit("timer-tick", { remaining });
    if (remaining <= 0) {
      endRound(io, room, "timeout");
    }
  }, 1000);
}

function revealHintLetter(io, room) {
  const eligible = getEligibleHintIndices(room.round.word, room.round.revealedIndices);
  if (eligible.length > 0) {
    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    room.round.revealedIndices.add(chosen.index);
    room.round.hintsGiven += 1;
    room.round.maskedWord = maskWord(room.round.word, room.round.revealedIndices);
    
    const channel = roomChannel(room.code);
    io.to(channel).emit("hint-update", {
      maskedWord: room.round.maskedWord,
      hintsGiven: room.round.hintsGiven,
      letter: chosen.letter,
      index: chosen.index,
    });

    // Notify players in the chat stream
    io.to(channel).emit("guess-result", {
      correct: false,
      isSystem: true,
      text: `💡 Hint: Letter "${chosen.letter}" revealed!`,
    });
  }
}

export function endRound(io, room, reason) {
  if (room.state !== "playing") return;
  clearInterval(room.timers.tick);
  room.timers.tick = null;
  room.state = "roundEnd";

  const isLastRound = room.round.number >= room.settings.maxRounds;
  const players = [...room.players.values()].map((p) => ({
    ...serializePlayer(p),
    roundDelta: room.round.roundScores.get(p.id) || 0,
  }));

  io.to(roomChannel(room.code)).emit("round-end", {
    word: room.round.word, // Now safe to broadcast to all
    reason,
    players,
    number: room.round.number,
    maxRounds: room.settings.maxRounds,
    nextIn: isLastRound ? 0 : config.roundEndDelayMs,
  });

  clearTimeout(room.timers.nextRound);
  room.timers.nextRound = setTimeout(() => {
    if (!store.has(room.code)) return;
    if (isLastRound) endGame(io, room);
    else startRound(io, room);
  }, config.roundEndDelayMs);
}

export function endGame(io, room) {
  clearInterval(room.timers.tick);
  clearTimeout(room.timers.nextRound);
  room.timers.tick = null;
  room.timers.nextRound = null;
  room.state = "gameEnd";

  const standings = [...room.players.values()]
    .map(serializePlayer)
    .sort((a, b) => b.score - a.score);

  io.to(roomChannel(room.code)).emit("game-end", {
    standings,
    winnerId: standings.length ? standings[0].id : null,
  });
}

// ---------------------------------------------------------------------------
// Dynamic Time & Rank-Based Guessing Logic
// ---------------------------------------------------------------------------
export function handleGuess(io, room, socketId, text) {
  if (room.state !== "playing") return;
  const guesser = room.players.get(socketId);
  if (!guesser) return;
  if (socketId === room.round.drawerId) return; // Drawer cannot guess their own word
  if (room.round.correctGuessers.has(socketId)) return; // Already solved

  const raw = String(text || "");
  const normalized = normalize(raw);
  if (!normalized) return;

  const channel = roomChannel(room.code);

  if (normalized === normalize(room.round.word)) {
    const remaining = Math.max(1, Math.ceil((room.round.endsAt - Date.now()) / 1000));
    const rankIndex = room.round.correctGuessers.size; // 0 for 1st, 1 for 2nd, etc.
    const guesserPoints = calculateGuesserPoints(remaining, room.settings.roundDurationSec, rankIndex);
    const drawerPoints = calculateDrawerPoints(remaining, room.settings.roundDurationSec);

    room.round.correctGuessers.add(socketId);
    guesser.score += guesserPoints;
    bumpRoundScore(room, socketId, guesserPoints);

    const drawer = room.players.get(room.round.drawerId);
    if (drawer) {
      drawer.score += drawerPoints;
      bumpRoundScore(room, drawer.id, drawerPoints);
    }

    // Time-shortening acceleration: If first person guesses and timer > 30s, cap timer to 30s
    if (!room.round.firstGuessHappened) {
      room.round.firstGuessHappened = true;
      if (remaining > config.firstGuessMaxTimeSec) {
        room.round.endsAt = Date.now() + config.firstGuessMaxTimeSec * 1000;
        io.to(channel).emit("timer-tick", { remaining: config.firstGuessMaxTimeSec });
      }
    }

    // Broadcast guess success with points earned and rank
    io.to(channel).emit("guess-result", {
      correct: true,
      playerId: socketId,
      username: guesser.username,
      points: guesserPoints,
      rank: rankIndex + 1,
      drawerPoints,
      drawerName: drawer?.username,
    });

    io.to(channel).emit("score-update", {
      players: [...room.players.values()].map(serializePlayer),
    });

    // Check if all non-drawers have solved
    if (allGuessed(room)) {
      // Award Master Clan bonus to the drawer
      if (drawer) {
        drawer.score += config.scoring.drawer.allGuessedBonus;
        bumpRoundScore(room, drawer.id, config.scoring.drawer.allGuessedBonus);
      }
      endRound(io, room, "all-guessed");
    }
  } else {
    // Regular chat guess broadcast
    io.to(channel).emit("guess-result", {
      correct: false,
      playerId: socketId,
      username: guesser.username,
      text: raw.slice(0, 120),
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function nextDrawer(room) {
  const ids = [...room.players.keys()];
  if (ids.length === 0) return null;
  const prev = room.round.drawerId;
  const start = prev && ids.includes(prev) ? ids.indexOf(prev) + 1 : 0;
  for (let i = 0; i < ids.length; i++) {
    const p = room.players.get(ids[(start + i) % ids.length]);
    if (p && p.connected) return p.id;
  }
  return ids[0];
}

function connectedNonDrawers(room) {
  let n = 0;
  for (const p of room.players.values()) {
    if (p.connected && p.id !== room.round.drawerId) n++;
  }
  return n;
}

function allGuessed(room) {
  const need = connectedNonDrawers(room);
  return need > 0 && room.round.correctGuessers.size >= need;
}

function bumpRoundScore(room, id, delta) {
  room.round.roundScores.set(id, (room.round.roundScores.get(id) || 0) + delta);
}

function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // Strips spaces/punctuation for forgiving matching (e.g. "ice-cream" vs "ice cream")
}

function err(io, socketId, code, message) {
  io.to(socketId).emit("game-error", { code, message });
  return null;
}

// ---------------------------------------------------------------------------
// Teardown & Room Sweeper
// ---------------------------------------------------------------------------
export function destroyRoom(room) {
  clearInterval(room.timers.tick);
  clearTimeout(room.timers.nextRound);
  room.timers.tick = null;
  room.timers.nextRound = null;
  store.delete(room.code);
}

export function startSweeper() {
  return setInterval(() => {
    const now = Date.now();
    for (const room of [...store.values()]) {
      if (room.players.size === 0) {
        if (room.emptySince == null) room.emptySince = now;
        else if (now - room.emptySince > config.emptyRoomGraceMs) destroyRoom(room);
      }
    }
  }, config.sweepIntervalMs);
}
