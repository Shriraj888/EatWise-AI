import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Activity, Brain, Droplets, Droplet, Shield,
  Moon, CheckCircle2, AlertTriangle, Sparkles,
  TrendingUp, Apple
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import useAppStore from '../store/useAppStore';
import { calculateBMI } from '../utils/tdeeCalculator';
import {
  BMI_CATEGORIES, MOOD_OPTIONS, SLEEP_OPTIONS,
  SDG3_TARGETS, WATER_GOAL
} from '../utils/constants';
import { formatDateKey } from '../utils/formatters';
import toast from 'react-hot-toast';

import './HealthWellness.css';

const NCD_TIPS = [
  {
    title: 'Heart Health',
    desc: 'Reduce saturated fats, increase fiber & omega-3 intake to lower cardiovascular disease risk.',
    icon: Heart,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  {
    title: 'Diabetes Prevention',
    desc: 'Choose whole grains, limit refined sugars, and maintain a balanced glycemic index diet.',
    icon: Activity,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    title: 'Mental Well-being',
    desc: 'Gut-brain connection: Eat probiotic-rich foods, leafy greens, and stay hydrated for cognitive health.',
    icon: Brain,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
  },
  {
    title: 'Cancer Prevention',
    desc: 'Eat antioxidant-rich fruits & vegetables. Limit processed meats and ultra-processed foods.',
    icon: Shield,
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
  },
];

const HealthWellness = () => {
  const profile = useAppStore((s) => s.userProfile);
  const getMealsForDate = useAppStore((s) => s.getMealsForDate);
  const getWaterIntake = useAppStore((s) => s.getWaterIntake);
  const setWaterIntake = useAppStore((s) => s.setWaterIntake);
  const wellnessCheckins = useAppStore((s) => s.wellnessCheckins);
  const addWellnessCheckin = useAppStore((s) => s.addWellnessCheckin);
  const streakDays = useAppStore((s) => s.streakDays);

  const containerRef = useRef(null);
  const todayStr = formatDateKey();
  const todaysCheckin = wellnessCheckins[todayStr] || null;
  const todaysMeals = getMealsForDate(todayStr);
  const waterToday = getWaterIntake(todayStr);

  const [selectedMood, setSelectedMood] = useState(todaysCheckin?.mood || '');
  const [selectedSleep, setSelectedSleep] = useState(todaysCheckin?.sleep || '');

  // BMI calculation
  const bmi = useMemo(() => calculateBMI(profile.weight, profile.height), [profile.weight, profile.height]);
  const bmiCategory = useMemo(
    () => BMI_CATEGORIES.find((c) => bmi >= c.range[0] && bmi < c.range[1]) || BMI_CATEGORIES[3],
    [bmi]
  );

  // Wellness score calculation (0-100)
  const wellnessScore = useMemo(() => {
    let score = 0;

    // BMI factor (30 points)
    if (bmiCategory.key === 'normal') score += 30;
    else if (bmiCategory.key === 'overweight' || bmiCategory.key === 'underweight') score += 15;
    else score += 5;

    // Meals logged today (20 points)
    score += Math.min(todaysMeals.length * 5, 20);

    // Water intake (20 points)
    score += Math.min(Math.round((waterToday / WATER_GOAL) * 20), 20);

    // Mood check-in bonus (15 points)
    if (todaysCheckin?.mood) {
      if (['great', 'good'].includes(todaysCheckin.mood)) score += 15;
      else if (todaysCheckin.mood === 'okay') score += 10;
      else score += 5;
    }

    // Sleep check-in bonus (15 points)
    if (todaysCheckin?.sleep) {
      if (todaysCheckin.sleep === 'excellent') score += 15;
      else if (todaysCheckin.sleep === 'good') score += 12;
      else if (todaysCheckin.sleep === 'fair') score += 7;
      else score += 3;
    }

    return Math.min(score, 100);
  }, [bmiCategory, todaysMeals, waterToday, todaysCheckin]);

  // SVG ring calculations
  const bmiRadius = 85;
  const bmiCircumference = 2 * Math.PI * bmiRadius;
  const bmiProgress = Math.min(bmi / 40, 1); // Normalize BMI to 0-40 range
  const bmiOffset = bmiCircumference - bmiProgress * bmiCircumference;

  const wsRadius = 55;
  const wsCircumference = 2 * Math.PI * wsRadius;
  const wsOffset = wsCircumference - (wellnessScore / 100) * wsCircumference;

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    addWellnessCheckin({ mood });
    toast.success('Mood logged!');
  };

  const handleSleepSelect = (sleep) => {
    setSelectedSleep(sleep);
    addWellnessCheckin({ sleep });
    toast.success('Sleep quality logged!');
  };

  const handleWaterClick = (index) => {
    setWaterIntake(index + 1, todayStr);
  };

  // Streak count for the last 7 days
  const streakCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      if (streakDays[key] || getMealsForDate(key).length > 0) count++;
    }
    return count;
  }, [streakDays, getMealsForDate]);

  useGSAP(() => {
    gsap.fromTo('.sdg3-banner', 
      { y: -50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }
    );
    gsap.fromTo('.wellness-grid > *', 
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out', delay: 0.2, clearProps: 'all' }
    );
  }, { scope: containerRef });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="wellness-page"
      ref={containerRef}
    >
      {/* ── SDG 3 Mission Banner ── */}
      <div className="sdg3-banner">
        <span className="sdg3-badge">UN SDG 3</span>
        <div className="sdg3-banner-content">
          <div className="sdg3-icon-wrapper">🌍</div>
          <div className="sdg3-text">
            <h2>Good Health & Well-Being</h2>
            <p>
              EatWise aligns with <strong>UN Sustainable Development Goal 3</strong> — ensuring
              healthy lives and promoting well-being for all. Track your nutrition, monitor health
              indicators, and prevent non-communicable diseases through informed eating.
            </p>
          </div>
        </div>
      </div>

      <div className="wellness-grid">
        {/* ── BMI & Health Risk Indicator ── */}
        <Card className="bmi-card glass-panel">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} className="gradient-text" />
              BMI & Health Risk Indicator
            </CardTitle>
            <Badge variant="neutral">WHO Standard</Badge>
          </CardHeader>
          <CardBody>
            <div className="bmi-content">
              <div className="bmi-gauge-wrapper">
                <div className="bmi-gauge">
                  <svg viewBox="0 0 200 200">
                    <circle className="bmi-gauge-bg" cx="100" cy="100" r={bmiRadius} />
                    <circle
                      className="bmi-gauge-fill"
                      cx="100" cy="100" r={bmiRadius}
                      stroke={bmiCategory.color}
                      strokeDasharray={bmiCircumference}
                      strokeDashoffset={bmiOffset}
                    />
                  </svg>
                  <div className="bmi-center">
                    <div className="bmi-value" style={{ color: bmiCategory.color }}>{bmi}</div>
                    <div className="bmi-label">{bmiCategory.label}</div>
                  </div>
                </div>
              </div>

              <div className="bmi-categories">
                {BMI_CATEGORIES.map((cat) => {
                  const isActive = bmiCategory.key === cat.key;
                  return (
                    <div
                      key={cat.key}
                      className={`bmi-category ${isActive ? 'active' : ''}`}
                      style={isActive ? { 
                        backgroundColor: `${cat.color}1A`, 
                        borderColor: cat.color,
                        color: 'var(--color-text-primary)'
                      } : {}}
                    >
                      <div className="bmi-dot" style={{ background: cat.color, boxShadow: isActive ? `0 0 10px ${cat.color}80` : 'none' }} />
                      <div className="bmi-cat-info">
                        <div className="bmi-cat-name" style={{ color: isActive ? cat.color : 'inherit' }}>{cat.label}</div>
                        <div className="bmi-cat-range">
                          BMI {cat.range[0]} – {cat.range[1] >= 100 ? '40+' : cat.range[1]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div 
                className="bmi-advice-box" 
                style={{ 
                  backgroundColor: `${bmiCategory.color}15`, 
                  borderColor: `${bmiCategory.color}40`,
                  color: 'var(--color-text-primary)'
                }}
              >
                <AlertTriangle size={18} style={{ color: bmiCategory.color, flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.9rem' }}>{bmiCategory.advice}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Daily Wellness Score ── */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} className="gradient-text" />
              Wellness Score
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="wellness-score-section">
              <div className="wellness-score-ring">
                <svg viewBox="0 0 140 140">
                  <circle className="ws-bg" cx="70" cy="70" r={wsRadius} />
                  <circle
                    className="ws-fill"
                    cx="70" cy="70" r={wsRadius}
                    stroke={wellnessScore >= 70 ? '#22c55e' : wellnessScore >= 40 ? '#f59e0b' : '#ef4444'}
                    strokeDasharray={wsCircumference}
                    strokeDashoffset={wsOffset}
                  />
                </svg>
                <div className="ws-center">
                  <div className="ws-value" style={{ color: wellnessScore >= 70 ? '#22c55e' : wellnessScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {wellnessScore}
                  </div>
                  <div className="ws-label">out of 100</div>
                </div>
              </div>

              <div className="wellness-factors">
                <div className="ws-factor">
                  <div className="ws-factor-dot" style={{ background: bmiCategory.color }} />
                  <span>BMI: {bmi} ({bmiCategory.label})</span>
                </div>
                <div className="ws-factor">
                  <div className="ws-factor-dot" style={{ background: '#10b981' }} />
                  <span>Meals: {todaysMeals.length} logged</span>
                </div>
                <div className="ws-factor">
                  <div className="ws-factor-dot" style={{ background: '#3b82f6' }} />
                  <span>Water: {waterToday}/{WATER_GOAL} glasses</span>
                </div>
                <div className="ws-factor">
                  <div className="ws-factor-dot" style={{ background: '#f59e0b' }} />
                  <span>Streak: {streakCount}/7 days</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Mood Check-in ── */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={18} className="gradient-text" />
              Mental Wellbeing
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="wellness-section-header">
              <h3>How are you feeling today?</h3>
            </div>
            <p className="wellness-section-desc">SDG 3 includes mental health. Tracking your mood helps identify patterns.</p>

            <div className="mood-tracker-grid">
              {MOOD_OPTIONS.map((mood) => (
                <motion.button
                  key={mood.value}
                  className={`mood-btn ${selectedMood === mood.value ? 'selected' : ''}`}
                  style={{ color: mood.color }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </motion.button>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <div className="wellness-section-header">
                <h3>Sleep Quality</h3>
              </div>
              <p className="wellness-section-desc">Good sleep is crucial for immune function and disease prevention.</p>

              <div className="sleep-tracker-grid">
                {SLEEP_OPTIONS.map((sleep) => (
                  <motion.button
                    key={sleep.value}
                    className={`sleep-btn ${selectedSleep === sleep.value ? 'selected' : ''}`}
                    style={{ color: sleep.color }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSleepSelect(sleep.value)}
                  >
                    <span className="sleep-emoji">{sleep.emoji}</span>
                    <span className="sleep-label">{sleep.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {(selectedMood || selectedSleep) && (
              <motion.div
                className="checkin-saved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={16} />
                Today's check-in saved
              </motion.div>
            )}
          </CardBody>
        </Card>

        {/* ── Hydration Tracker ── */}
        <Card className="hydration-card glass-panel">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="hydration-icon-wrapper">
                <Droplets size={20} />
              </div>
              Hydration Tracker
            </CardTitle>
            <Badge className="hydration-badge" variant="neutral">
              {waterToday} / {WATER_GOAL} Glasses
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="hydration-content">
              <div className="hydration-progress-bg">
                <motion.div 
                  className="hydration-progress-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(waterToday / WATER_GOAL) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="water-glasses-row">
                {Array.from({ length: WATER_GOAL }).map((_, i) => {
                  const isFilled = i < waterToday;
                  return (
                    <motion.button
                      key={i}
                      className={`water-glass-btn ${isFilled ? 'filled' : ''}`}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleWaterClick(i)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Droplet 
                        size={22} 
                        strokeWidth={isFilled ? 0 : 2}
                        fill={isFilled ? 'currentColor' : 'none'} 
                      />
                    </motion.button>
                  );
                })}
              </div>

              <div className="hydration-footer">
                {waterToday >= WATER_GOAL ? (
                  <div className="hydration-success">
                    <CheckCircle2 size={18} />
                    <span><strong>Hydration goal met!</strong> Great for kidney & cardiovascular health.</span>
                  </div>
                ) : (
                  <div className="hydration-pending">
                    <span>Drink <strong>{WATER_GOAL - waterToday} more glass{WATER_GOAL - waterToday !== 1 ? 'es' : ''}</strong> to meet your daily goal. Proper hydration prevents kidney disease.</span>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── NCD Prevention Tips ── */}
        <Card className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} className="gradient-text" />
              NCD Prevention Through Nutrition
            </CardTitle>
            <Badge variant="neutral">SDG 3.4</Badge>
          </CardHeader>
          <CardBody>
            <p className="wellness-section-desc">
              Non-communicable diseases (NCDs) cause 74% of global deaths. Your diet is your strongest preventive tool.
            </p>
            <div className="ncd-grid">
              {NCD_TIPS.map((tip, idx) => (
                <motion.div
                  key={tip.title}
                  className="ncd-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="ncd-icon" style={{ background: tip.bg, color: tip.color }}>
                    <tip.icon size={22} />
                  </div>
                  <h4>{tip.title}</h4>
                  <p>{tip.desc}</p>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* ── SDG 3 Targets ── */}
        <Card className="sdg-targets-grid glass-panel">
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} className="gradient-text" />
              How EatWise Supports SDG 3
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="targets-list">
              {SDG3_TARGETS.map((target, idx) => (
                <motion.div
                  key={target.id}
                  className="target-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <div className="target-id">{target.id}</div>
                  <div className="target-title">{target.title}</div>
                  <div className="target-desc">{target.desc}</div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </motion.div>
  );
};

export default HealthWellness;
