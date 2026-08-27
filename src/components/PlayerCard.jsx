import React from 'react';
import Avatar from './Avatar';
import { Crown, CheckCircle2, Clock } from 'lucide-react';

const PlayerCard = ({
  player,
  showReadyStatus = true,
  showScore = false,
  className = ''
}) => {
  const { name, initial, isHost, isYou, isReady, score, color } = player;

  return (
    <div className={`player-card ${isYou ? 'is-you' : ''} ${className}`}>
      <div className="player-info-left">
        <Avatar name={name} initial={initial} size={36} color={color || '#8b5cf6'} />
        <div className="player-name-wrap">
          <span className="player-name-text">
            {name} {isYou && <span className="you-badge">(You)</span>}
          </span>
          {isHost && (
            <span className="host-badge">
              <Crown size={12} strokeWidth={2.5} /> HOST
            </span>
          )}
        </div>
      </div>

      <div className="player-info-right">
        {showScore && (
          <span className="score-points">{score ?? 0} pts</span>
        )}

        {showReadyStatus && (
          <div className={`status-badge ${isReady ? 'ready' : 'waiting'}`}>
            {isReady ? (
              <>
                <CheckCircle2 size={13} />
                <span>Ready</span>
              </>
            ) : (
              <>
                <Clock size={13} />
                <span>Waiting...</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
