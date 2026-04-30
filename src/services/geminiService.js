/**
 * Service for analyzing meals.
 * Now routes through aiProvider to support both Gemini and OpenRouter.
 */

import { callAI, extractJSON } from './aiProvider';

/**
 * System prompt for meal analysis to enforce JSON structure.
 */
const SYSTEM_PROMPT = `
You are an expert nutritionist and food analyzer AI aligned with UN Sustainable Development Goal 3 (Good Health & Well-Being).
Analyze the provided food (image or text description) and estimate the nutritional content.
You MUST return a valid JSON object starting with '{' and ending with '}'.
Do not include markdown blocks like \`\`\`json.
Ensure the values are realistic estimates based on standard portion sizes if not specified.

In addition to nutrition data, provide health impact insights related to NCD (Non-Communicable Disease) prevention — including how this meal affects heart health, diabetes risk, and overall wellness.

JSON structure:
{
  "name": "A clear, concise name for the meal",
  "calories": number (estimated total calories),
  "macros": {
    "protein": number (in grams),
    "carbs": number (in grams),
    "fat": number (in grams)
  },
  "score": number (health score from 1 to 10),
  "badge": string (one of "Great", "Good", "Limit"),
  "suggestions": [
    "string (brief, actionable tip to improve the meal or noting its benefits)"
  ],
  "healthImpact": "string (1-2 sentences on how this meal affects NCD prevention, e.g., heart health, diabetes risk, cancer prevention)"
}
`;

/**
 * Analyze a meal from an image or text description.
 * @param {string|File} input - Text description or image File.
 * @returns {Promise<object>} Parsed JSON response.
 */
export const analyzeMeal = async (input) => {
  let userPrompt = '';
  let imageFile = null;

  if (input instanceof File) {
    userPrompt = 'Analyze this meal image.';
    imageFile = input;
  } else {
    userPrompt = `Analyze this meal: ${input}`;
  }

  const textResponse = await callAI(SYSTEM_PROMPT, userPrompt, imageFile);

  const parsed = extractJSON(textResponse);
  if (!parsed) {
    console.error('Failed to parse AI response:', textResponse);
    throw new Error('Failed to parse analysis result. Please try again.');
  }

  return parsed;
};
