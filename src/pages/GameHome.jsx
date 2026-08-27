import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, LogIn, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

const GameHome = () => {
  const navigate = useNavigate();
  const { createRoom } = useGame();

  const handlePlayNow = () => {
    createRoom();
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    navigate('/join-room');
  };

  return (
    <div className="game-home-container">
      <div className="game-home-card">
        <div className="game-home-header">
          <div className="season-badge" style={{ margin: '0 auto 1.25rem auto' }}>
            <Sparkles size={14} />
            <span>Multiplayer Arena</span>
          </div>
          <h1>Scribble Royale</h1>
          <p>Ready to play?</p>
        </div>

        <div className="game-home-actions">
          <Button
            variant="primary"
            size="lg"
            className="btn-game-action"
            onClick={handlePlayNow}
            icon={<Play size={22} fill="currentColor" />}
          >
            Play Now
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="btn-game-action"
            onClick={handleJoinRoom}
            icon={<LogIn size={22} />}
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHome;
