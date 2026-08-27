// Central place for all game + server tunables.
export const config = {
  port: Number(process.env.PORT) || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",

  // Game rules
  roundDurationSec: 60, // seconds a drawer has per turn
  maxRoundsDefault: 3, // total drawer-turns per game (low for fast testing)
  minPlayers: 2, // needed to start
  points: {
    correctGuesser: 10, // awarded to each player who guesses correctly
    drawerPerGuesser: 5, // awarded to the drawer for each correct guesser
  },

  // Pacing
  roundEndDelayMs: 5000, // how long the round summary shows before next round

  // Housekeeping for in-memory rooms
  emptyRoomGraceMs: 60_000, // delete rooms that stay empty this long (e.g. created but never joined)
  sweepIntervalMs: 30_000, // how often the sweeper runs
};
