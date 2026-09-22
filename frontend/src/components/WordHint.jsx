import { useMemo } from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { useGame } from "../state/useGame.js";
import { useAuthWallet } from "../context/AuthWalletContext.jsx";

export default function WordHint() {
  const { state, actions, amDrawer } = useGame();
  const { user, addCoins } = useAuthWallet();

  const maskedStr = state.round?.maskedWord || "";

  // Split multiple words (separated by triple spaces "   ")
  const wordGroups = useMemo(() => {
    if (!maskedStr) return [];
    return maskedStr.split(/\s{3,}/).map((group) => {
      return group.split(/\s+/).filter(Boolean);
    });
  }, [maskedStr]);

  // Count revealed letters
  const revealedCount = useMemo(() => {
    let count = 0;
    for (const group of wordGroups) {
      for (const token of group) {
        if (token !== "_" && /[A-Z0-9]/i.test(token)) count++;
      }
    }
    return count;
  }, [wordGroups]);

  // Special hint (Oracle Clue) calculation
  const maxHints = state.maxSpecialHints || 2;
  const hintsUsed = state.specialHintsUsed || 0;
  const hintsRemaining = Math.max(0, maxHints - hintsUsed);
  const hintCost = 1000;
  const userCoins = Number(user?.coins) || 0;
  const hasCoins = userCoins >= hintCost;

  const canRequestOracleHint =
    !amDrawer &&
    state.state === "playing" &&
    !state.guessedCorrect &&
    hintsRemaining > 0 &&
    hasCoins &&
    !state.activeSpecialHint;

  const handleRequestOracleHint = () => {
    if (!canRequestOracleHint) return;
    actions.requestSpecialHint({
      userId: user?._id || user?.id,
      clientCoins: userCoins,
    });
    // Optimistically deduct coins in local identity & profile
    addCoins(-hintCost);
  };

  // If Drawer: show the full secret word
  if (amDrawer && state.myWord) {
    return (
      <div className="wordhint dragon-wordhint drawer">
        <span className="scroll-tag">📜 Secret Scroll:</span>
        <strong className="secret-word">{state.myWord}</strong>
        <span className="wl dragon-wl">({state.round?.wordLength || state.myWord.length} letters)</span>
      </div>
    );
  }

  return (
    <div className="wordhint-container">
      <div className="wordhint dragon-wordhint">
        <span className="masked-label">Riddle:</span>
        <div className="rune-tiles-wrapper">
          {wordGroups.length > 0 ? (
            wordGroups.map((wordTokens, gIdx) => (
              <div key={gIdx} className="rune-word-group">
                {wordTokens.map((token, tIdx) => {
                  const isRevealed = token !== "_" && /[A-Z0-9]/i.test(token);
                  return (
                    <span
                      key={tIdx}
                      className={`rune-tile ${isRevealed ? "is-revealed" : "is-blank"}`}
                    >
                      {isRevealed ? token : "_"}
                    </span>
                  );
                })}
              </div>
            ))
          ) : (
            <span className="dragon-masked">_ _ _</span>
          )}
        </div>

        <div className="word-meta-pills">
          {state.round.wordLength > 0 && (
            <span className="wl dragon-wl">{state.round.wordLength} letters</span>
          )}
          {revealedCount > 0 && (
            <span className="hint-pill" title={`${revealedCount} letters revealed`}>
              {revealedCount} letter hint{revealedCount > 1 ? "s" : ""}
            </span>
          )}

          {/* Special Oracle Hint (Buyable with Coins, max 2 per match) */}
          {!amDrawer && state.state === "playing" && !state.guessedCorrect && (
            <button
              type="button"
              className={`dragon-oracle-btn ${canRequestOracleHint ? "ready" : "disabled"} ${
                state.activeSpecialHint ? "active-clue" : ""
              }`}
              onClick={handleRequestOracleHint}
              disabled={!canRequestOracleHint}
              title={
                state.activeSpecialHint
                  ? "Oracle Clue active for this riddle"
                  : hintsRemaining <= 0
                  ? "Match limit reached: 2 Oracle Clues used"
                  : !hasCoins
                  ? `Need ${hintCost} Dragon Gold (You have ${userCoins})`
                  : `Consult the Dragon Oracle for a secret clue (Costs ${hintCost} Gold • ${hintsRemaining}/${maxHints} left)`
              }
            >
              <Sparkles size={13} className="oracle-sparkle-icon" />
              <span className="oracle-btn-label">
                {state.activeSpecialHint ? "Oracle Clue Active" : `Oracle Hint (${hintCost} 🪙)`}
              </span>
              <span className="oracle-btn-counter">{hintsRemaining}/{maxHints}</span>
            </button>
          )}
        </div>
      </div>

      {/* Illuminated Oracle Clue Banner */}
      {state.activeSpecialHint && (
        <div className="oracle-clue-banner animate-fade-in">
          <div className="oracle-clue-badge">
            <Sparkles size={14} className="sparkle-pulse" />
            <span>DRAGON ORACLE CLUE</span>
          </div>
          <p className="oracle-clue-text">"{state.activeSpecialHint}"</p>
        </div>
      )}
    </div>
  );
}
