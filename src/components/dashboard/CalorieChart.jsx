import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export const CalorieChart = ({ consumed, goal }) => {
  const remaining = Math.max(goal - consumed, 0);
  const percentage = Math.min((consumed / goal) * 100, 100) || 0;
  
  const data = [
    { name: 'Consumed', value: consumed || 0.01 },
    { name: 'Remaining', value: remaining }
  ];

  const COLORS = ['url(#calorieGradient)', 'var(--color-bg-tertiary)'];

  return (
    <div className="calorie-chart-container">
      <div className="chart-container" style={{ height: 200, width: 200, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="calorieGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <motion.div 
          className="chart-center-content"
          initial={{ scale: 0.8, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          transition={{ delay: 0.3, duration: 0.4, ease: "backOut" }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Flame size={18} className="chart-flame-icon" />
          <span className="chart-value gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, display: 'block', lineHeight: 1 }}>
            {Math.round(consumed)}
          </span>
          <span className="chart-label" style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
            / {goal} kcal
          </span>
        </motion.div>
      </div>
      
      <div className="chart-stats">
        <div className="chart-stat-item">
          <div className="chart-stat-dot" style={{ background: 'var(--color-primary)' }}></div>
          <div>
            <span className="chart-stat-label">Consumed</span>
            <span className="chart-stat-value" style={{ color: 'var(--color-primary)' }}>{Math.round(consumed)}</span>
          </div>
        </div>
        <div className="chart-stat-item">
          <div className="chart-stat-dot" style={{ background: 'var(--color-text-tertiary)' }}></div>
          <div>
            <span className="chart-stat-label">Remaining</span>
            <span className="chart-stat-value">{Math.round(remaining)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
