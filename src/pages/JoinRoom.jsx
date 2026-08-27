import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogIn, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { joinRoom } = useGame();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setError('Please enter a room code.');
      return;
    }

    joinRoom(cleanCode);
    navigate('/lobby');
  };

  return (
    <div className="join-room-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <div className="season-badge">
            <Sparkles size={14} />
            <span>Join Existing Match</span>
          </div>
          <h1 className="lobby-title">Join a Room</h1>
          <p className="lobby-subtitle">Enter the room code given by your friend.</p>
        </div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Large Search-bar Styled Room Code Input */}
          <div className="join-search-box">
            <Search size={22} className="join-search-icon" />
            <input
              type="text"
              className="join-search-input"
              placeholder="Enter room code (e.g. S3MX3X)"
              value={code}
              maxLength={8}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
            icon={<LogIn size={20} />}
          >
            Join Room
          </Button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
