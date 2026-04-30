import React, { useId } from 'react';
import './Input.css';

export const Input = React.forwardRef(
  ({ label, error, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`input-container ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          {Icon && (
            <div className="input-icon">
              <Icon size={18} />
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`input-field ${Icon ? 'has-icon' : ''} ${error ? 'is-error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ label, error, options, className = '', containerClassName = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className={`input-container ${containerClassName}`}>
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={`input-select ${error ? 'is-error' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
