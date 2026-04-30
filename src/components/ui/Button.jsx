import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  ({ children, variant = 'primary', size = 'md', isLoading, className = '', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="btn-spinner" size={16} />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
