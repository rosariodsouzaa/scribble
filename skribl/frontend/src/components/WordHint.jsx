import { useMemo } from "react";
import { useGame } from "../state/useGame.js";

export default function WordHint() {
  const { state, amDrawer } = useGame();

  // If Drawer: show the full secret word
  if (amDrawer && state.myWord) {
    return (
      <div className="wordhint dragon-wordhint drawer">
        <span className="scroll-tag">📜 Secret Scroll:</span>
        <strong className="secret-word">{state.myWord}</strong>
        <span className="wl dragon-wl">({state.round.wordLength || state.myWord.length} letters)</span>
      </div>
    );
  }

  // If Guesser: render Skribbl-style character rune slots
  const maskedStr = state.round.maskedWord || "";

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

  return (
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
            💡 {revealedCount} hint{revealedCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
