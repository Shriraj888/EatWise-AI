import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

export const Card = ({ children, className = '', noPadding = false, animate = false, onClick }) => {
  const Component = animate ? motion.div : 'div';
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component 
      className={`card ${noPadding ? 'card-no-padding' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>
    {children}
  </h3>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);
