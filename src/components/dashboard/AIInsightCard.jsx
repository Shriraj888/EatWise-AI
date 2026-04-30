import React, { useState, useEffect, useMemo } from 'react';
import { useDailyInsight } from '../../hooks/useDailyInsight';
import { Sparkles, Bot, RefreshCw, TrendingUp, Utensils, Flame, Droplets, Activity, Zap, Heart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/useAppStore';
import { formatDateKey } from '../../utils/formatters';

// ── Generate smart local insights from user data (no API needed) ──
const generateLocalInsights = (profile, todaysMeals, totals, allMealLogs, waterIntake) => {
  const insights = [];
  const calPercent = profile.calorieGoal > 0 ? Math.round((totals.calories / profile.calorieGoal) * 100) : 0;
  const todayWater = waterIntake || 0;

  // Time-based greeting insight
  const hour = new Date().getHours();
  if (hour < 12 && todaysMeals.length === 0) {
    insights.push({ icon: '🌅', text: "Good morning! Start your day right — log your breakfast to stay on track.", mood: 'neutral' });
  } else if (hour >= 12 && hour < 17 && todaysMeals.length === 0) {
    insights.push({ icon: '☀️', text: "It's afternoon and no meals logged yet. Don't skip meals — it can slow your metabolism!", mood: 'warning' });
  } else if (hour >= 17 && todaysMeals.length === 0) {
    insights.push({ icon: '🌙', text: "Evening check-in: You haven't logged any meals today. Even a late start counts!", mood: 'warning' });
  }

  // Calorie progress
  if (calPercent > 0 && calPercent <= 50) {
    insights.push({ icon: '🎯', text: `You're at ${calPercent}% of your calorie goal. Keep logging to stay on track!`, mood: 'positive' });
  } else if (calPercent > 50 && calPercent <= 90) {
    insights.push({ icon: '🔥', text: `Great progress! ${calPercent}% of your daily calories consumed. You're almost there.`, mood: 'positive' });
  } else if (calPercent > 90 && calPercent <= 110) {
    insights.push({ icon: '✅', text: `You've hit ${calPercent}% of your calorie target — perfectly on track today!`, mood: 'positive' });
  } else if (calPercent > 110) {
    insights.push({ icon: '⚠️', text: `You're at ${calPercent}% of your calorie goal. Consider lighter choices for remaining meals.`, mood: 'warning' });
  }

  // Protein check
  if (totals.protein > 0 && profile.macroGoals?.protein > 0) {
    const protPercent = Math.round((totals.protein / profile.macroGoals.protein) * 100);
    if (protPercent < 30 && todaysMeals.length >= 2) {
      insights.push({ icon: '💪', text: `Only ${protPercent}% of your protein goal met. Try adding eggs, chicken, or legumes!`, mood: 'warning' });
    } else if (protPercent >= 80) {
      insights.push({ icon: '🏆', text: `Excellent protein intake at ${protPercent}%! Great for muscle health and satiety.`, mood: 'positive' });
    }
  }

  // Water intake
  if (todayWater === 0) {
    insights.push({ icon: '💧', text: "Don't forget to hydrate! Track your water intake in the Wellness tab.", mood: 'neutral' });
  } else if (todayWater >= 8) {
    insights.push({ icon: '💧', text: `Amazing! ${todayWater} glasses of water today. Proper hydration boosts metabolism.`, mood: 'positive' });
  }

  // Meal frequency
  if (todaysMeals.length >= 3) {
    insights.push({ icon: '🥗', text: `${todaysMeals.length} meals logged today! Regular eating helps maintain stable blood sugar.`, mood: 'positive' });
  }

  // Overall usage stats
  const totalDaysLogged = Object.keys(allMealLogs).filter(k => allMealLogs[k]?.length > 0).length;
  if (totalDaysLogged > 7) {
    insights.push({ icon: '📊', text: `You've been tracking for ${totalDaysLogged} days! Consistency is key to healthier habits.`, mood: 'positive' });
  } else if (totalDaysLogged >= 1) {
    insights.push({ icon: '🌱', text: `${totalDaysLogged} day${totalDaysLogged > 1 ? 's' : ''} of tracking so far. Keep the streak going!`, mood: 'neutral' });
  }

  // Goal-specific
  if (profile.goal === 'lose') {
    insights.push({ icon: '🏃', text: "Tip: High-protein, high-fiber meals help you feel full on fewer calories.", mood: 'neutral' });
  } else if (profile.goal === 'gain') {
    insights.push({ icon: '🍗', text: "Tip: Add calorie-dense healthy foods like nuts, avocado, and whole grains.", mood: 'neutral' });
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({ icon: '✨', text: "Welcome to EatWise! Start logging meals to unlock personalized AI insights.", mood: 'neutral' });
  }

  return insights;
};

// ── Typing animation component ──
const TypeWriter = ({ text, speed = 22, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="ai-cursor">|</span>}
    </span>
  );
};

// ── Stat mini card ──
const StatMini = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    className="ai-stat-mini"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
    style={{ '--stat-color': color }}
  >
    <div className="ai-stat-icon-sm">
      <Icon size={14} />
    </div>
    <div className="ai-stat-info">
      <span className="ai-stat-value">{value}</span>
      <span className="ai-stat-label">{label}</span>
    </div>
  </motion.div>
);

const TABS = [
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'stats', label: 'My Stats', icon: TrendingUp },
  { id: 'tips', label: 'Health Tips', icon: Heart },
];

const HEALTH_TIPS = [
  { icon: '🫀', tip: "Eating colorful vegetables daily reduces heart disease risk by up to 28%." },
  { icon: '🧠', tip: "Omega-3 fatty acids in fish and nuts support brain health and reduce inflammation." },
  { icon: '🩸', tip: "High-fiber foods help regulate blood sugar and reduce Type 2 diabetes risk." },
  { icon: '💤', tip: "Avoiding heavy meals 3 hours before sleep improves digestion and sleep quality." },
  { icon: '🥦', tip: "Cruciferous vegetables like broccoli contain compounds that may help prevent cancer." },
  { icon: '🏋️', tip: "Protein intake of 1.6g/kg body weight maximizes muscle protein synthesis." },
  { icon: '🍎', tip: "An apple a day provides 14% of your vitamin C needs and supports gut health." },
  { icon: '🥑', tip: "Healthy fats from avocado help absorb fat-soluble vitamins A, D, E, and K." },
];

export const AIInsightCard = ({ profile, todaysMeals, totals }) => {
  const { data, isLoading, error, refetch } = useDailyInsight(profile, todaysMeals, totals);
  const [activeTab, setActiveTab] = useState('insights');
  const [currentTipIndex, setCurrentTipIndex] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));
  const [isRetrying, setIsRetrying] = useState(false);

  const mealLogs = useAppStore((s) => s.mealLogs);
  const waterIntake = useAppStore((s) => s.getWaterIntake);
  const streakDays = useAppStore((s) => s.streakDays);
  const favorites = useAppStore((s) => s.favorites);

  const todayWater = waterIntake();
  const todayStr = formatDateKey();

  // ── Compute usage stats ──
  const usageStats = useMemo(() => {
    const totalDaysLogged = Object.keys(mealLogs).filter(k => mealLogs[k]?.length > 0).length;
    const totalMeals = Object.values(mealLogs).reduce((sum, meals) => sum + (meals?.length || 0), 0);
    const activeDaysThisWeek = Object.keys(streakDays).filter(k => streakDays[k]).length;
    const totalCaloriesAllTime = Object.values(mealLogs).reduce((sum, meals) => {
      return sum + (meals || []).reduce((s, m) => s + (m.calories || 0), 0);
    }, 0);

    return { totalDaysLogged, totalMeals, activeDaysThisWeek, totalCaloriesAllTime, savedRecipes: favorites.length };
  }, [mealLogs, streakDays, favorites]);

  // ── Local insights (always available) ──
  const localInsights = useMemo(() =>
    generateLocalInsights(profile, todaysMeals, totals, mealLogs, todayWater),
    [profile, todaysMeals, totals, mealLogs, todayWater]
  );

  // Cycle health tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % HEALTH_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const calPercent = profile.calorieGoal > 0 ? Math.round((totals.calories / profile.calorieGoal) * 100) : 0;

  return (
    <div className="ai-insight-container">
      {/* ── Header ── */}
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
        <div className="ai-header-actions">
          {data && !isLoading && !error && (
            <div className="ai-status-chip live">
              <Sparkles size={12} />
              <span>Live</span>
            </div>
          )}
          {!data && !isLoading && (
            <div className="ai-status-chip local">
              <Zap size={12} />
              <span>Smart</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="ai-tab-bar">
        {TABS.map(({ id, label, icon: TabIcon }) => (
          <motion.button
            key={id}
            className={`ai-tab ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
            whileTap={{ scale: 0.95 }}
          >
            <TabIcon size={13} />
            <span>{label}</span>
            {activeTab === id && (
              <motion.div className="ai-tab-indicator" layoutId="aiTabIndicator" />
            )}
          </motion.button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="ai-insight-body">
        <AnimatePresence mode="wait">
          {/* ─── INSIGHTS TAB ─── */}
          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="ai-tab-content"
            >
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
              ) : data?.insight ? (
                <div className="ai-insight-text">
                  <p><TypeWriter text={data.insight} speed={18} /></p>
                </div>
              ) : (
                <div className="ai-local-insights">
                  {localInsights.slice(0, 2).map((insight, idx) => (
                    <motion.div
                      key={idx}
                      className={`ai-local-insight-item ${insight.mood}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12 }}
                    >
                      <span className="ai-insight-emoji">{insight.icon}</span>
                      <p>{insight.text}</p>
                    </motion.div>
                  ))}
                  {error && (
                    <motion.button
                      className="ai-retry-btn"
                      onClick={handleRetry}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <RefreshCw size={14} className={isRetrying ? 'spinning' : ''} />
                      <span>{isRetrying ? 'Connecting...' : 'Get AI Insight'}</span>
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── STATS TAB ─── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="ai-tab-content"
            >
              {/* Today's Progress Bar */}
              <div className="ai-progress-section">
                <div className="ai-progress-header">
                  <span className="ai-progress-label">Today's Calories</span>
                  <span className="ai-progress-value">{Math.round(totals.calories)} / {profile.calorieGoal} kcal</span>
                </div>
                <div className="ai-progress-track">
                  <motion.div
                    className="ai-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(calPercent, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    style={{
                      background: calPercent > 110 ? 'var(--color-danger)' : 'var(--gradient-main)'
                    }}
                  />
                </div>
              </div>

              {/* Stat Grid */}
              <div className="ai-stats-grid">
                <StatMini icon={Utensils} label="Meals Today" value={todaysMeals.length} color="var(--color-primary)" delay={0.1} />
                <StatMini icon={Flame} label="Total Meals" value={usageStats.totalMeals} color="var(--color-warning)" delay={0.15} />
                <StatMini icon={Droplets} label="Water" value={`${todayWater} 🥛`} color="var(--color-info)" delay={0.2} />
                <StatMini icon={Activity} label="Days Active" value={usageStats.totalDaysLogged} color="var(--color-accent)" delay={0.25} />
              </div>

              {/* Overall summary */}
              {usageStats.totalMeals > 0 && (
                <motion.div
                  className="ai-usage-summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Zap size={14} />
                  <span>
                    {Math.round(usageStats.totalCaloriesAllTime).toLocaleString()} kcal tracked across {usageStats.totalDaysLogged} day{usageStats.totalDaysLogged !== 1 ? 's' : ''}
                    {usageStats.savedRecipes > 0 ? ` · ${usageStats.savedRecipes} saved recipe${usageStats.savedRecipes !== 1 ? 's' : ''}` : ''}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── TIPS TAB ─── */}
          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="ai-tab-content"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTipIndex}
                  className="ai-health-tip"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="ai-tip-emoji">{HEALTH_TIPS[currentTipIndex].icon}</span>
                  <p className="ai-tip-text">{HEALTH_TIPS[currentTipIndex].tip}</p>
                </motion.div>
              </AnimatePresence>

              <div className="ai-tip-dots">
                {HEALTH_TIPS.map((_, idx) => (
                  <motion.button
                    key={idx}
                    className={`ai-tip-dot ${idx === currentTipIndex ? 'active' : ''}`}
                    onClick={() => setCurrentTipIndex(idx)}
                    whileHover={{ scale: 1.3 }}
                  />
                ))}
              </div>

              <div className="ai-tip-footer">
                <Heart size={12} />
                <span>SDG 3: Good Health & Well-Being</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
