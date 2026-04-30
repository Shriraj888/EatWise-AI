/**
 * Service for recipe generation and daily insights.
 * Now routes through aiProvider to support both Gemini and OpenRouter.
 */

import { callAI, extractJSON } from './aiProvider';

/**
 * Generate recipe suggestions based on ingredients and filters.
 * @param {string[]} ingredients - Array of ingredient strings.
 * @param {string[]} filters - Array of active filters (e.g., 'vegan', 'low-carb').
 * @returns {Promise<object[]>} Array of recipe objects.
 */
export const generateRecipes = async (ingredients, filters = []) => {
  const systemPrompt = `You are an expert culinary AI aligned with UN SDG 3 (Good Health & Well-Being). Generate 2-3 delicious, healthy recipes that support NCD prevention.
Prioritize heart-healthy, diabetes-friendly, anti-inflammatory ingredients. Mention the specific health benefits of each recipe.
You MUST return a valid JSON object. Do NOT include markdown or code fences. Return raw JSON only.

Required JSON structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "prepTime": "10 mins",
      "cookTime": "20 mins",
      "difficulty": "Easy",
      "ingredients": ["100g chicken breast", "1 cup rice"],
      "steps": ["Step 1 description", "Step 2 description", "Step 3 description"],
      "nutrition": {
        "calories": 450,
        "protein": 35,
        "carbs": 50,
        "fat": 10
      },
      "healthBenefits": "Brief description of how this recipe supports heart health, diabetes prevention, or overall wellness."
    }
  ]
}`;

  const userPrompt = `Ingredients available: ${ingredients.join(', ')}.${
    filters.length > 0 ? `\nDietary filters to follow: ${filters.join(', ')}.` : ''
  }`;

  const textResponse = await callAI(systemPrompt, userPrompt);
  const result = extractJSON(textResponse);

  if (!result) {
    console.error('Failed to parse AI response:', textResponse);
    throw new Error('Unexpected response format from AI. Please try again.');
  }

  // Handle both { recipes: [...] } and a direct array
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.recipes)) return result.recipes;

  throw new Error('Unexpected response format from AI. Please try again.');
};

/**
 * Generate a personalized daily insight based on user profile and meal logs.
 * @param {object} profile - User profile from store.
 * @param {object[]} todaysMeals - Array of today's logged meals.
 * @param {object} totals - Current daily macro/calorie totals.
 * @returns {Promise<object>}
 */
export const generateDailyInsight = async (profile, todaysMeals, totals) => {
  const systemPrompt = `You are an expert health and nutrition coach for the EatWise App, aligned with UN Sustainable Development Goal 3 (Good Health & Well-Being).
Analyze the user's progress and provide ONE concise, encouraging, and actionable insight.
Focus on NCD (Non-Communicable Disease) prevention through nutrition: heart health, diabetes risk, mental wellness, and overall well-being.
You MUST return valid JSON only. No markdown, no code fences.

Required JSON structure:
{
  "insight": "Your short, personalized message here. Max 2-3 sentences. Include a specific health tip related to NCD prevention when possible.",
  "mood": "positive"
}
mood must be one of: "positive", "warning", or "neutral".`;

  const healthConditions = profile.healthConditions?.length > 0
    ? `Health conditions: ${profile.healthConditions.join(', ')}.`
    : '';

  const userPrompt = `User Goal: ${profile.goal || 'maintain'}, Calorie Goal: ${profile.calorieGoal || 2000} kcal.
${healthConditions}
Today: Calories ${Math.round(totals.calories || 0)}, Protein ${Math.round(totals.protein || 0)}g, Carbs ${Math.round(totals.carbs || 0)}g, Fat ${Math.round(totals.fat || 0)}g.
Meals logged today: ${todaysMeals.length > 0 ? todaysMeals.map((m) => m.name).join(', ') : 'None yet'}.`;

  const textResponse = await callAI(systemPrompt, userPrompt);
  const result = extractJSON(textResponse);

  if (!result) {
    throw new Error('Failed to parse insight from AI.');
  }

  return result;
};
