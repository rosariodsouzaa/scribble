// The React projection of the server's authoritative state. Only low-frequency
// events flow through here; high-frequency draw events are handled imperatively
// in Canvas.jsx and never touch this reducer.
export const initialState = {
  connected: false,
  error: null,
  myId: null,

  code: null,
  hostId: null,
  state: "idle", // idle | waiting | playing | roundEnd | gameEnd
  settings: { maxRounds: 3, roundDurationSec: 60 },
  players: [],
  chat: [], // { id, type: 'system'|'guess'|'correct', username?, text }

  round: {
    number: 0,
    maxRounds: 3,
    drawerId: null,
    drawerName: null,
    endsAt: 0,
    maskedWord: "",
    wordLength: 0,
  },
  myWord: null, // set only from the drawer-only `new-word` event
  remaining: 0,
  guessedCorrect: false, // did *I* already guess correctly this round?

  roundEnd: null, // last round-end payload (drives the summary overlay)
  gameEnd: null, // final standings + winner

  _seq: 1, // monotonic id source for chat keys
};

function pushChat(state, entry) {
  return {
    ...state,
    _seq: state._seq + 1,
    chat: [...state.chat, { id: state._seq, ...entry }].slice(-120),
  };
}

const secondsLeft = (endsAt) => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

export function gameReducer(state, action) {
  switch (action.type) {
    case "CONNECTED":
      return { ...state, connected: true, myId: action.id };
    case "DISCONNECTED":
      return { ...state, connected: false };
    case "ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "ROOM_STATE": {
      const r = action.room;
      const isWaiting = r.state === "waiting";
      return {
        ...state,
        error: null,
        code: r.code,
        hostId: r.hostId,
        state: r.state,
        settings: r.settings,
        players: r.players,
        gameEnd: isWaiting ? null : state.gameEnd,
        roundEnd: isWaiting ? null : state.roundEnd,
        myWord: isWaiting ? null : (r.round.word ?? state.myWord),
        guessedCorrect: isWaiting ? false : state.guessedCorrect,
        round: {
          number: r.round.number,
          maxRounds: r.settings.maxRounds,
          drawerId: r.round.drawerId,
          drawerName: r.round.drawerName,
          endsAt: r.round.endsAt,
          maskedWord: r.round.maskedWord || "",
          wordLength: r.round.wordLength || 0,
        },
        remaining: r.round.endsAt ? secondsLeft(r.round.endsAt) : 0,
      };
    }

    case "PLAYER_JOINED":
      return pushChat(
        { ...state, players: action.players, hostId: action.hostId ?? state.hostId },
        { type: "system", text: `${action.player.username} joined` }
      );

    case "PLAYER_LEFT": {
      const left = state.players.find((p) => p.id === action.playerId);
      return pushChat(
        { ...state, players: action.players, hostId: action.hostId ?? state.hostId },
        { type: "system", text: `${left ? left.username : "A player"} left` }
      );
    }

    case "PLAYER_UPDATED":
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId ? { ...p, isReady: action.isReady } : p
        ),
      };

    case "GAME_STARTED":
      return { ...state, state: "playing", settings: action.settings, gameEnd: null };

    case "ROUND_START": {
      const amDrawer = action.drawerId === state.myId;
      return {
        ...state,
        state: "playing",
        roundEnd: null,
        guessedCorrect: false,
        myWord: amDrawer ? state.myWord : null, // guessers cleared; drawer waits for new-word
        remaining: secondsLeft(action.endsAt),
        round: {
          number: action.number,
          maxRounds: action.maxRounds,
          drawerId: action.drawerId,
          drawerName: action.drawerName,
          endsAt: action.endsAt,
          maskedWord: action.maskedWord || "",
          wordLength: action.wordLength || 0,
        },
      };
    }

    case "NEW_WORD":
      return { ...state, myWord: action.word };

    case "GUESS_RESULT": {
      if (action.isSystem) {
        return pushChat(state, {
          type: "system",
          text: action.text,
        });
      }
      if (action.correct) {
        const mine = action.playerId === state.myId;
        const pts = action.points ? ` (+${action.points} pts)` : "";
        const rankLabel = action.rank === 1 ? "🥇 1st" : action.rank === 2 ? "🥈 2nd" : action.rank === 3 ? "🥉 3rd" : "";
        const rankPrefix = rankLabel ? `[${rankLabel}] ` : "";
        return pushChat(mine ? { ...state, guessedCorrect: true } : state, {
          type: "correct",
          username: action.username,
          points: action.points,
          rank: action.rank,
          text: `${rankPrefix}${action.username} guessed the word!${pts}`,
        });
      }
      return pushChat(state, {
        type: "guess",
        username: action.username,
        text: action.text,
      });
    }

    case "HINT_UPDATE":
      return {
        ...state,
        round: {
          ...state.round,
          maskedWord: action.maskedWord,
        },
      };

    case "SCORE_UPDATE":
      return { ...state, players: action.players };

    case "TIMER_TICK":
      return { ...state, remaining: action.remaining };

    case "ROUND_END":
      return pushChat(
        { ...state, state: "roundEnd", roundEnd: action, players: action.players, remaining: 0 },
        { type: "system", text: `Round over! The secret rune was "${action.word}"` }
      );

    case "GAME_END":
      return { ...state, state: "gameEnd", gameEnd: action };

    case "GAME_ABORTED":
      return pushChat(
        {
          ...state,
          state: "waiting",
          roundEnd: null,
          myWord: null,
          guessedCorrect: false,
          remaining: 0,
          players: action.players || state.players.map((p) => ({ ...p, isReady: false })),
        },
        {
          type: "system",
          text: `⚠️ ${action.message || "Match aborted: Not enough players to continue."}`,
        }
      );

    case "RESET":
      return { ...initialState, connected: state.connected, myId: state.myId };

    default:
      return state;
  }
}
