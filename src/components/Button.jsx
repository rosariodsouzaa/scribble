import React from 'react';

const Button = ({
  children,
  variant = 'primary', // primary | secondary | gold | emerald | icon
  size = 'md', // sm | md | lg
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
