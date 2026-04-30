/**
 * Application-wide constants for EatWise AI.
 */

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', multiplier: 1.2 },
  { value: 'light', label: 'Lightly Active', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately Active', multiplier: 1.55 },
  { value: 'active', label: 'Very Active', multiplier: 1.725 },
  { value: 'extreme', label: 'Extra Active', multiplier: 1.9 },
];

export const GOAL_TYPES = [
  { value: 'lose', label: 'Lose Weight', calorieOffset: -500 },
  { value: 'maintain', label: 'Maintain Weight', calorieOffset: 0 },
  { value: 'build', label: 'Build Muscle', calorieOffset: 300 },
];

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

export const HEALTH_BADGES = {
  great: { label: 'Great', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  good: { label: 'Good', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  limit: { label: 'Limit', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
};

export const DIET_FILTERS = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { value: 'high-protein', label: 'High Protein', icon: '💪' },
];

export const MACRO_COLORS = {
  protein: '#6366f1',
  carbs: '#f59e0b',
  fat: '#ef4444',
};

export const WATER_GOAL = 8;
export const MAX_HEALTH_SCORE = 10;

export const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/meals', label: 'Meal Log', icon: 'UtensilsCrossed' },
  { path: '/analyzer', label: 'AI Analyzer', icon: 'ScanSearch' },
  { path: '/recipes', label: 'Recipes', icon: 'ChefHat' },
  { path: '/wellness', label: 'Wellness', icon: 'HeartPulse' },
  { path: '/profile', label: 'Profile', icon: 'UserCircle' },
];

/* ── SDG 3 — Good Health & Well-Being ── */

export const BMI_CATEGORIES = [
  { key: 'underweight', label: 'Underweight', range: [0, 18.5], color: '#3b82f6', advice: 'Consider a nutrient-dense diet to reach a healthy weight.' },
  { key: 'normal', label: 'Normal', range: [18.5, 24.9], color: '#22c55e', advice: 'Great job! Maintain your current balanced diet and activity.' },
  { key: 'overweight', label: 'Overweight', range: [25, 29.9], color: '#f59e0b', advice: 'Focus on portion control and regular physical activity.' },
  { key: 'obese', label: 'Obese', range: [30, 100], color: '#ef4444', advice: 'Consult a healthcare professional for a personalized plan.' },
];

export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', emoji: '😄', color: '#22c55e' },
  { value: 'good', label: 'Good', emoji: '🙂', color: '#10b981' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: '#f59e0b' },
  { value: 'low', label: 'Low', emoji: '😔', color: '#f97316' },
  { value: 'stressed', label: 'Stressed', emoji: '😣', color: '#ef4444' },
];

export const SLEEP_OPTIONS = [
  { value: 'excellent', label: '8+ hrs', emoji: '😴', color: '#6366f1' },
  { value: 'good', label: '6-8 hrs', emoji: '😊', color: '#22c55e' },
  { value: 'fair', label: '4-6 hrs', emoji: '😐', color: '#f59e0b' },
  { value: 'poor', label: '<4 hrs', emoji: '😫', color: '#ef4444' },
];

export const HEALTH_CONDITIONS = [
  { value: 'diabetes', label: 'Diabetes', icon: '🩸' },
  { value: 'hypertension', label: 'Hypertension', icon: '❤️‍🩹' },
  { value: 'heart_disease', label: 'Heart Disease', icon: '🫀' },
  { value: 'cholesterol', label: 'High Cholesterol', icon: '🧪' },
  { value: 'obesity', label: 'Obesity', icon: '⚖️' },
  { value: 'none', label: 'None', icon: '✅' },
];

export const SDG3_TARGETS = [
  { id: '3.4', title: 'Reduce NCD Mortality', desc: 'Reduce premature mortality from non-communicable diseases through prevention via nutrition awareness.' },
  { id: '3.5', title: 'Substance Abuse Prevention', desc: 'Promote awareness of healthy consumption habits and mindful eating.' },
  { id: '3.d', title: 'Health Risk Management', desc: 'Strengthen early warning and risk reduction through BMI tracking & health indicators.' },
];
