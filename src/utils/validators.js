/**
 * Form validation utilities for EatWise AI.
 */

/**
 * Validate profile form fields.
 * @param {object} profile
 * @returns {{ valid: boolean, errors: object }}
 */
export const validateProfile = (profile) => {
  const errors = {};

  if (!profile.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!profile.age || profile.age < 10 || profile.age > 120) {
    errors.age = 'Enter a valid age (10-120)';
  }

  if (!profile.weight || profile.weight < 20 || profile.weight > 500) {
    errors.weight = 'Enter a valid weight in kg (20-500)';
  }

  if (!profile.height || profile.height < 50 || profile.height > 300) {
    errors.height = 'Enter a valid height in cm (50-300)';
  }

  if (!profile.activity) {
    errors.activity = 'Select an activity level';
  }

  if (!profile.goal) {
    errors.goal = 'Select a goal';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate meal form fields.
 * @param {object} meal
 * @returns {{ valid: boolean, errors: object }}
 */
export const validateMeal = (meal) => {
  const errors = {};

  if (!meal.name?.trim()) {
    errors.name = 'Meal name is required';
  }

  if (!meal.type) {
    errors.type = 'Select a meal type';
  }

  if (!meal.calories || meal.calories < 0 || meal.calories > 10000) {
    errors.calories = 'Enter valid calories (0-10,000)';
  }

  if (meal.protein != null && (meal.protein < 0 || meal.protein > 1000)) {
    errors.protein = 'Enter valid protein (0-1000g)';
  }

  if (meal.carbs != null && (meal.carbs < 0 || meal.carbs > 1000)) {
    errors.carbs = 'Enter valid carbs (0-1000g)';
  }

  if (meal.fat != null && (meal.fat < 0 || meal.fat > 1000)) {
    errors.fat = 'Enter valid fat (0-1000g)';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate ingredient list.
 * @param {string[]} ingredients
 * @returns {{ valid: boolean, error: string }}
 */
export const validateIngredients = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { valid: false, error: 'Add at least one ingredient' };
  }
  if (ingredients.length > 20) {
    return { valid: false, error: 'Maximum 20 ingredients allowed' };
  }
  return { valid: true, error: '' };
};
