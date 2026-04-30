/**
 * Configuration variables for API services.
 * Mirrors the API/model strategy from v0-outreach-app.
 */

export const CONFIG = {
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    // Direct Google Generative Language endpoint for Gemini 2.5 Flash
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  },
  openRouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    // Paid first (no rate limit), free models as fallbacks — same order as outreach app
    models: [
      'google/gemma-3-27b-it',
      'google/gemma-3-27b-it:free',
      'google/gemma-3-12b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
    ],
  },
  openFoodFacts: {
    baseUrl: 'https://world.openfoodfacts.org',
  },
};
