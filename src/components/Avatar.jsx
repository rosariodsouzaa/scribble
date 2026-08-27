import React from 'react';

const Avatar = ({
  name = 'Player',
  initial,
  size = 36,
  color = '#8b5cf6',
  className = ''
}) => {
  const displayInitial = initial || (name ? name.charAt(0).toUpperCase() : 'P');

  return (
    <div
      className={`user-avatar-circle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        fontSize: `${size * 0.42}px`,
        boxShadow: `0 0 10px ${color}55`
      }}
    >
      {displayInitial}
    </div>
  );
};

export default Avatar;
