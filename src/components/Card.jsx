import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = false,
  glow = null, // 'purple' | 'gold' | null
  ...props
}) => {
  const hoverClass = hoverable ? 'card-hoverable' : '';
  const glowClass = glow ? `card-glow-${glow}` : '';

  return (
    <div className={`card ${hoverClass} ${glowClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
