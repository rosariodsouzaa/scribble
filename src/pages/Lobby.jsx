import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Clock, Users, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import RoomCode from '../components/RoomCode';
import PlayerCard from '../components/PlayerCard';
import Button from '../components/Button';

const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, startGame, toggleReady } = useGame();

  const isHost = room?.isHost;
  const you = players.find((p) => p.isYou);
  const isYouReady = you?.isReady;

  const handleStart = () => {
    startGame();
    navigate('/game/play');
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="season-badge">
            <Sparkles size={14} />
            <span>Multiplayer Lobby</span>
          </div>
          <h1 className="lobby-title">Scribble Royale</h1>
          <p className="lobby-subtitle">Waiting for everyone to get ready...</p>
        </div>

        {/* Room Code with Copy */}
        <RoomCode code={room?.code || 'S3MX3X'} />

        {/* Players Section */}
        <div className="players-section">
          <div className="players-section-header">
            <span className="players-section-title">Players</span>
            <span className="players-count-badge">
              <Users size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {players.length}/8 Players
            </span>
          </div>

          <div className="players-list">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} showReadyStatus={true} />
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="lobby-status-banner">
          <Clock size={16} className="animate-spin" />
          <span>Waiting for everyone to get ready...</span>
        </div>

        {/* Action Controls */}
        <div className="lobby-actions">
          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              icon={<Play size={22} fill="currentColor" />}
            >
              Start Game
            </Button>
          ) : (
            <Button
              variant={isYouReady ? 'emerald' : 'primary'}
              size="lg"
              onClick={() => toggleReady()}
              icon={<CheckCircle2 size={20} />}
            >
              {isYouReady ? "I'm Ready (Click to Unready)" : "I'm Ready"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
