import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, Trophy, Sparkles, HelpCircle, Palette } from 'lucide-react';
import { useGame } from '../context/GameContext';
import DrawingCanvas from '../components/DrawingCanvas';
import Avatar from '../components/Avatar';
import Button from '../components/Button';

const Game = () => {
  const { players, gameState, chatMessages, submitGuess, user } = useGame();

  const [timeLeft, setTimeLeft] = useState(gameState.timer || 45);
  const [guessInput, setGuessInput] = useState('');
  const chatEndRef = useRef(null);

  // Active Countdown Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 45; // loop/reset round
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendGuess = (e) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    submitGuess(guessInput);
    setGuessInput('');
  };

  // Format time display as 00:XX
  const formattedTime = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="game-screen-container">
      {/* TOP STATUS BAR */}
      <div className="game-top-bar">
        <div className="game-top-pill">
          <span className="round-badge">Round {gameState.round} of {gameState.maxRounds}</span>
        </div>

        <div className="draw-word-badge">
          <span className="draw-word-label">Draw:</span>
          <span className="draw-word-text">{gameState.currentWord}</span>
        </div>

        <div className={`timer-pill ${timeLeft <= 10 ? 'warning' : ''}`}>
          <Clock size={18} />
          <span>Timer: {formattedTime}</span>
        </div>
      </div>

      {/* MAIN GAME GRID: CANVAS (LEFT) & SIDEBAR (RIGHT) */}
      <div className="game-main-grid">
        {/* LEFT: Large Drawing Canvas */}
        <DrawingCanvas isDrawer={true} />

        {/* RIGHT: Player Leaderboard & Live Guessing Chat */}
        <div className="game-right-sidebar">
          {/* Scoreboard */}
          <div className="scoreboard-card">
            <div className="scoreboard-header">
              <span>Leaderboard</span>
              <Trophy size={16} style={{ color: 'var(--gold)' }} />
            </div>

            <div className="scoreboard-list">
              {sortedPlayers.map((p, index) => (
                <div key={p.id} className={`score-row ${index === 0 ? 'rank-1' : ''}`}>
                  <div className="score-player-meta">
                    <Avatar name={p.name} initial={p.initial} size={28} color={p.color || '#8b5cf6'} />
                    <span style={{ fontWeight: p.isYou ? 800 : 600, color: p.isYou ? 'var(--primary-light)' : 'inherit' }}>
                      {p.name} {p.isYou && '(You)'}
                    </span>
                  </div>
                  <span className="score-points">{p.score ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chat & Guess Feed */}
          <div className="game-chat-card">
            <div className="chat-header">
              <span>Live Guess Feed</span>
            </div>

            <div className="chat-messages-box">
              {chatMessages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="chat-bubble system-msg">
                      <span>{msg.text}</span>
                    </div>
                  );
                }

                if (msg.type === 'correct') {
                  return (
                    <div key={msg.id} className="chat-bubble correct-guess">
                      <span>{msg.text}</span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="chat-bubble">
                    <span className="chat-author">{msg.author}:</span>
                    <span>{msg.text}</span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Bottom Guess Input */}
            <form className="guess-input-bar" onSubmit={handleSendGuess}>
              <input
                type="text"
                className="guess-field"
                placeholder="Type your guess..."
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<Send size={16} />}
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
