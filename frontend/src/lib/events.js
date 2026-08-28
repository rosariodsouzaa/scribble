// Socket event names shared across the client. Mirrors the backend contract.
export const C2S = {
  JOIN: "join-room",
  LEAVE: "leave-room",
  READY: "player-ready",
  START: "start-game",
  DRAW_START: "draw-start",
  DRAW_MOVE: "draw-move",
  DRAW_END: "draw-end",
  CLEAR: "clear-canvas",
  GUESS: "submit-guess",
};

export const S2C = {
  ROOM_STATE: "room-state",
  PLAYER_JOINED: "player-joined",
  PLAYER_LEFT: "player-left",
  PLAYER_UPDATED: "player-updated",
  GAME_STARTED: "game-started",
  ROUND_START: "round-start",
  NEW_WORD: "new-word",
  DRAW_UPDATE: "draw-update",
  CLEAR: "clear-canvas",
  GUESS_RESULT: "guess-result",
  SCORE_UPDATE: "score-update",
  TIMER_TICK: "timer-tick",
  HINT_UPDATE: "hint-update",
  ROUND_END: "round-end",
  GAME_END: "game-end",
  GAME_ABORTED: "game-aborted",
  ERROR: "game-error",
};
