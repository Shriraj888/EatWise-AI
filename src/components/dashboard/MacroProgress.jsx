import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { motion } from 'framer-motion';

export const MacroProgress = ({ totals, goals }) => {
  const macros = [
    { label: 'Protein', value: totals.protein || 0, max: goals.protein, color: 'var(--color-protein)', emoji: '💪' },
    { label: 'Carbs', value: totals.carbs || 0, max: goals.carbs, color: 'var(--color-carbs)', emoji: '⚡' },
    { label: 'Fat', value: totals.fat || 0, max: goals.fat, color: 'var(--color-fat)', emoji: '🫧' },
  ];

  return (
    <div className="macro-progress-container">
      <h3 className="macro-progress-title">Macros Daily Goal</h3>
      <div className="macro-progress-list">
        {macros.map((macro, i) => (
          <motion.div 
            key={macro.label}
            className="macro-row"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
          >
            <div className="macro-row-header">
              <span className="macro-emoji">{macro.emoji}</span>
              <span className="macro-label">{macro.label}</span>
              <span className="macro-value" style={{ color: macro.color }}>
                {Math.round(macro.value)}
                <span className="macro-max">/{macro.max}g</span>
              </span>
            </div>
            <ProgressBar
              value={macro.value}
              max={macro.max}
              color={macro.color}
              height="6px"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
