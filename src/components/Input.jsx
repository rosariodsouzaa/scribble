import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  iconLeft,
  iconRight,
  error,
  required = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          <span>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</span>
        </label>
      )}
      <div className="input-wrapper">
        {iconLeft && <div className="input-icon-left">{iconLeft}</div>}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`input-field ${iconLeft ? 'with-icon-left' : ''} ${iconRight ? 'with-icon-right' : ''}`}
          {...props}
        />
        {iconRight && <div className="input-icon-right">{iconRight}</div>}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
