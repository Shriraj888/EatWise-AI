/**
 * TDEE (Total Daily Energy Expenditure) calculator for EatWise AI.
 * Uses the Mifflin-St Jeor equation.
 */

import { ACTIVITY_LEVELS, GOAL_TYPES } from './constants';

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 * @param {object} params
 * @param {number} params.weight - Weight in kg
 * @param {number} params.height - Height in cm
 * @param {number} params.age - Age in years
 * @param {string} params.gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
const calculateBMR = ({ weight, height, age, gender = 'male' }) => {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
};

/**
 * Calculate TDEE based on BMR and activity level.
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number}
 */
const calculateTDEE = (bmr, activityLevel) => {
  const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel);
  return Math.round(bmr * (activity?.multiplier || 1.2));
};

/**
 * Calculate daily calorie goal adjusted for weight goal.
 * @param {object} profile
 * @returns {number}
 */
export const calculateCalorieGoal = (profile) => {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activity);
  const goalType = GOAL_TYPES.find((g) => g.value === profile.goal);
  return Math.round(tdee + (goalType?.calorieOffset || 0));
};

/**
 * Calculate recommended macro split based on calorie goal and weight goal.
 * @param {number} calorieGoal
 * @param {string} goal - 'lose', 'maintain', 'build'
 * @returns {{ protein: number, carbs: number, fat: number }}
 */
export const calculateMacroGoals = (calorieGoal, goal) => {
  let proteinPct, carbsPct, fatPct;

  switch (goal) {
    case 'lose':
      proteinPct = 0.35;
      carbsPct = 0.35;
      fatPct = 0.30;
      break;
    case 'build':
      proteinPct = 0.30;
      carbsPct = 0.45;
      fatPct = 0.25;
      break;
    default: // maintain
      proteinPct = 0.25;
      carbsPct = 0.50;
      fatPct = 0.25;
  }

  return {
    protein: Math.round((calorieGoal * proteinPct) / 4),
    carbs: Math.round((calorieGoal * carbsPct) / 4),
    fat: Math.round((calorieGoal * fatPct) / 9),
  };
};

/**
 * Calculate BMI from weight (kg) and height (cm).
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @returns {number} BMI value
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height || height <= 0) return 0;
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
};
