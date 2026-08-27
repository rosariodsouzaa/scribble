import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Button from './Button';

const RoomCode = ({ code = 'S3MX3X', showLabel = true, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`room-code-wrapper ${className}`}>
      {showLabel && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
          ROOM CODE
        </div>
      )}
      <div className="room-code-container">
        <div className="room-code-display">{code}</div>
        <Button
          variant={copied ? 'emerald' : 'gold'}
          size="sm"
          onClick={handleCopy}
          icon={copied ? <Check size={16} /> : <Copy size={16} />}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
};

export default RoomCode;
