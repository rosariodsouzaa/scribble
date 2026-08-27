import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import RoomCode from '../components/RoomCode';
import PlayerCard from '../components/PlayerCard';
import Button from '../components/Button';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { room, players, user, toggleReady } = useGame();
  const [isReady, setIsReady] = useState(false);

  const handleReadyClick = () => {
    setIsReady(true);
    toggleReady();
    setTimeout(() => {
      navigate('/lobby');
    }, 450);
  };

  // Find current user's player entry
  const currentPlayer = players.find((p) => p.isYou) || {
    name: user?.name || 'Bhakti',
    initial: 'B',
    isHost: true,
    isYou: true,
    isReady: true,
    color: '#8b5cf6',
  };

  return (
    <div className="room-created-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="season-badge">
            <Sparkles size={14} />
            <span>Room Created</span>
          </div>
          <h1 className="lobby-title">Room Created</h1>
          <p className="lobby-subtitle">Share this code with your friends.</p>
        </div>

        {/* Large Room Code with Copy */}
        <RoomCode code={room?.code || 'S3MX3X'} showLabel={false} />

        {/* Players Section */}
        <div className="players-section">
          <div className="players-section-header">
            <span className="players-section-title">Players</span>
            <span className="players-count-badge">1/8 Players</span>
          </div>

          <div className="players-list">
            <PlayerCard player={currentPlayer} showReadyStatus={false} />
          </div>
        </div>

        {/* Waiting Status */}
        <div className="lobby-status-banner">
          <Clock size={16} className="animate-spin" />
          <span>Waiting for players...</span>
        </div>

        {/* Action Button */}
        <div className="lobby-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleReadyClick}
            icon={isReady ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
          >
            {isReady ? "Ready! Entering Lobby..." : "I'm Ready"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
