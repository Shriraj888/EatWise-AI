import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, ScanSearch, ChefHat, Info, ArrowRight, Sparkles, HeartPulse } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { GreetingCard } from '../components/dashboard/GreetingCard';
import { CalorieChart } from '../components/dashboard/CalorieChart';
import { MacroProgress } from '../components/dashboard/MacroProgress';
import { AIInsightCard } from '../components/dashboard/AIInsightCard';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import useAppStore from '../store/useAppStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { formatDateKey, formatTime } from '../utils/formatters';
import { MEAL_TYPES, HEALTH_BADGES } from '../utils/constants';

import './Dashboard.css';

gsap.registerPlugin(ScrollTrigger);

const QUICK_ACTIONS = [
  { icon: Plus, title: 'Log Meal', desc: 'Track a new entry', path: '/meals', color: 'var(--color-primary)' },
  { icon: ScanSearch, title: 'AI Analyzer', desc: 'Estimate from text', path: '/analyzer', color: 'var(--color-accent)' },
  { icon: ChefHat, title: 'Recipes', desc: 'AI generated ideas', path: '/recipes', color: 'var(--color-warning)' },
  { icon: HeartPulse, title: 'Wellness', desc: 'SDG 3 Health Hub', path: '/wellness', color: '#ef4444' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = useAppStore((state) => state.userProfile);
  const getMealsForDate = useAppStore((state) => state.getMealsForDate);
  const toggleStreakDay = useAppStore((state) => state.toggleStreakDay);
  const streakDays = useAppStore((state) => state.streakDays);

  const containerRef = useRef(null);

  const todayStr = formatDateKey();
  const todaysMeals = getMealsForDate(todayStr);
  const totals = useDailyNutrition(todaysMeals);

  // Generate week days
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    const dateStr = formatDateKey(d);
    return {
      date: d,
      dateStr,
      isToday: dateStr === todayStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      active: !!streakDays[dateStr] || getMealsForDate(dateStr).length > 0,
    };
  });

  useGSAP(() => {
    gsap.from('.dashboard-header-row', {
      y: -40, opacity: 0, duration: 0.9, ease: 'expo.out'
    });
    gsap.from('.hero-stats-grid', {
      y: 60, opacity: 0, duration: 1, delay: 0.2, ease: 'expo.out'
    });
    gsap.from('.bento-item', {
      y: 80, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.bento-grid', start: 'top 88%' }
    });
  }, { scope: containerRef });

  return (
    <div className="dashboard-page" ref={containerRef}>
      {/* ── Hero Section ── */}
      <div className="dashboard-header-row">
        <GreetingCard
          name={profile.name}
          totals={{ ...totals, mealCount: todaysMeals.length }}
          calorieGoal={profile.calorieGoal}
        />

        <div className="streak-card">
          <div className="streak-header">
            <span className="streak-label">This Week</span>
          </div>
          <div className="streak-body">
            {weekDays.map((day) => (
              <motion.div
                key={day.dateStr}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.85 }}
                className={`streak-day ${day.active ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                onClick={() => day.isToday && toggleStreakDay(day.dateStr)}
                title={day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              >
                {day.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SDG 3 Impact Banner ── */}
      <motion.div 
        className="hero-sdg-banner glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
        onClick={() => navigate('/wellness')}
      >
        <div className="sdg-banner-icon">
          <HeartPulse size={20} />
        </div>
        <div className="sdg-banner-content">
          <span className="sdg-banner-title">UN SDG 3 Impact</span>
          <span className="sdg-banner-text">
            EatWise promotes Good Health & Well-being through mindful nutrition and AI insights to prevent non-communicable diseases.
          </span>
        </div>
        <div className="sdg-banner-arrow">
          <ArrowRight size={18} />
        </div>
      </motion.div>

      {/* ── Stats Hero Grid ── */}
      <div className="hero-stats-grid">
        <Card className="hero-insight-card glass-panel" animate={true}>
          <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AIInsightCard profile={profile} todaysMeals={todaysMeals} totals={totals} />
          </CardBody>
        </Card>

        <Card className="hero-macros-card glass-panel" noPadding animate={true}>
          <CardBody className="hero-macros-body">
            <div className="hero-chart-section">
              <CalorieChart consumed={totals.calories} goal={profile.calorieGoal} />
            </div>
            <div className="hero-macro-section">
              <MacroProgress totals={totals} goals={profile.macroGoals} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bento-grid">
        <div className="bento-item bento-span-4">
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map(({ icon: Icon, title, desc, path, color }, index) => (
              <motion.div
                className="action-card"
                key={path}
                onClick={() => navigate(path)}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
              >
                <div className="action-icon" style={{ '--action-color': color }}>
                  <Icon size={26} strokeWidth={2} />
                </div>
                <h3 className="action-title">{title}</h3>
                <p className="action-desc">{desc}</p>
                <div className="action-arrow">
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today's Meal Log */}
        <Card className="bento-item bento-span-4 glass-panel" style={{ maxHeight: 500 }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} className="gradient-text" />
              Today's Log
            </CardTitle>
            {todaysMeals.length > 0 && (
              <Badge variant="neutral">{todaysMeals.length} meal{todaysMeals.length > 1 ? 's' : ''}</Badge>
            )}
          </CardHeader>
          <CardBody className="meals-list-bento">
            {todaysMeals.length === 0 ? (
              <div className="empty-state-slim">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Info size={44} opacity={0.2} />
                </motion.div>
                <p>No meals logged today yet.</p>
                <button className="start-tracking-btn" onClick={() => navigate('/meals')}>
                  Start Tracking
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="meals-grid">
                {todaysMeals.map((meal, index) => {
                  const mealType = MEAL_TYPES.find(m => m.value === meal.type) || MEAL_TYPES[3];
                  const badgeInfo = HEALTH_BADGES[meal.healthBadge?.toLowerCase()] || null;

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
                      key={meal.id}
                      className="meal-item-compact"
                    >
                      <div className="meal-icon-wrapper">{mealType.icon}</div>
                      <div className="meal-details">
                        <div className="meal-item-header">
                          <h4>{meal.name}</h4>
                          <span className="meal-time">{formatTime(meal.createdAt)}</span>
                        </div>
                        <div className="meal-item-meta">
                          <span className="meal-calories gradient-text">{Math.round(meal.calories)} kcal</span>
                          {badgeInfo && (
                            <Badge className="ml-2" style={{ backgroundColor: badgeInfo.bg, color: badgeInfo.color }}>
                              {badgeInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
