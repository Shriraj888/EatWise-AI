import React from 'react';
import './ProgressBar.css';

export const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  color = 'var(--color-primary)', 
  label, 
  showValue = false,
  height = '8px'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="progress-container">
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{value} / {max}</span>}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div 
          className="progress-fill" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
};
