import React from 'react';
import { useDailyInsight } from '../../hooks/useDailyInsight';
import { Sparkles, Loader2, Bot, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const AIInsightCard = ({ profile, todaysMeals, totals }) => {
  const { data, isLoading, error } = useDailyInsight(profile, todaysMeals, totals);

  return (
    <div className="ai-insight-container">
      <div className="ai-insight-header">
        <div className="ai-header-left">
          <motion.div 
            className="ai-icon-badge"
            animate={{ boxShadow: ['0 0 12px rgba(99, 102, 241, 0.3)', '0 0 24px rgba(16, 185, 129, 0.3)', '0 0 12px rgba(99, 102, 241, 0.3)'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Bot size={18} />
          </motion.div>
          <div>
            <span className="ai-title gradient-text">AI Dietitian</span>
            <span className="ai-subtitle">Powered by Gemini</span>
          </div>
        </div>
        {!isLoading && !error && (
          <div className="ai-status-chip">
            <Sparkles size={12} />
            <span>Live</span>
          </div>
        )}
      </div>
      
      <div className="ai-insight-body">
        {isLoading ? (
          <div className="ai-loading-state">
            <div className="ai-loading-dots">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="ai-dot"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="ai-loading-text">Analyzing your nutrition data...</span>
          </div>
        ) : error ? (
          <div className="ai-error-state">
            <RefreshCw size={16} />
            <span>Unable to load insights. Try refreshing.</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="ai-insight-text"
          >
            <p>
              {data?.insight || "Start logging your meals to unlock personalized AI insights tailored to your goals!"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
