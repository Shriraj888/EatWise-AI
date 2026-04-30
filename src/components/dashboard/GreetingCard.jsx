import React from 'react';
import { getGreeting, formatDisplayDate } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Target } from 'lucide-react';

export const GreetingCard = ({ name, totals, calorieGoal }) => {
  const percentage = calorieGoal > 0 ? Math.round((totals.calories / calorieGoal) * 100) : 0;
  const mealsLogged = totals.mealCount || 0;

  return (
    <div className="greeting-card">
      <motion.div 
        className="greeting-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="greeting-top-row">
          <div className="greeting-date-badge">
            <span className="live-dot"></span>
            {formatDisplayDate()}
          </div>
        </div>

        <h1 className="greeting-text">
          {getGreeting()},
          <br />
          <span className="greeting-name">{name}</span>
          <motion.span 
            className="waving-hand"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 2, ease: "easeInOut" }}
            style={{ display: 'inline-block', originX: 0.7, originY: 0.7, marginLeft: '10px' }}
          >
            👋
          </motion.span>
        </h1>

        <p className="greeting-subtext">Here's your nutrition snapshot for today.</p>

        {/* Quick Stats Row */}
        <motion.div 
          className="hero-quick-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="hero-stat-pill">
            <div className="hero-stat-icon" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
              <Zap size={16} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value">{Math.round(totals.calories)}</span>
              <span className="hero-stat-label">kcal today</span>
            </div>
          </div>

          <div className="hero-stat-pill">
            <div className="hero-stat-icon" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>
              <Target size={16} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value">{percentage}%</span>
              <span className="hero-stat-label">goal hit</span>
            </div>
          </div>

          <div className="hero-stat-pill">
            <div className="hero-stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
              <TrendingUp size={16} />
            </div>
            <div className="hero-stat-info">
              <span className="hero-stat-value">{Math.round(totals.protein)}g</span>
              <span className="hero-stat-label">protein</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
