import { CONFIG } from './config';

export const extractJSON = (text) => {
  if (!text) return null;

  let cleaned = text.trim();

  // Strip markdown code fences
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // noop
  }

  // Find embedded JSON object
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    try {
      return JSON.parse(cleaned.substring(firstOpen, lastClose + 1));
    } catch {
      // noop
    }
  }

  // Find embedded JSON array
  const firstArrOpen = cleaned.indexOf('[');
  const lastArrClose = cleaned.lastIndexOf(']');
  if (firstArrOpen !== -1 && lastArrClose !== -1 && lastArrClose > firstArrOpen) {
    try {
      return JSON.parse(cleaned.substring(firstArrOpen, lastArrClose + 1));
    } catch {
      // noop
    }
  }

  return null;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

// Simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callOpenRouter = async (systemPrompt, userPrompt, imageObj) => {
  const apiKey = CONFIG.openRouter.apiKey;
  
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  if (imageObj) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: `data:${imageObj.type};base64,${imageObj.base64}` } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  // Use a vision model if an image is provided
  const modelsToTry = imageObj ? [
    'google/gemini-2.0-pro-exp-02-05:free',
    'google/gemini-2.0-flash-lite-preview-02-05:free',
    'openrouter/free',
    'google/gemma-3-27b-it:free', 
    'google/gemma-3-12b-it:free',
    'google/gemini-2.5-flash'
  ] : CONFIG.openRouter.models;

  let lastError = null;

  for (const modelId of modelsToTry) {
    console.log(`OpenRouter: Trying model: ${modelId}`);
    try {
      const response = await fetch(CONFIG.openRouter.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'EatWise AI'
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || response.statusText;
        const statusCode = response.status;
        
        // Handle unauthorized specifically for free models
        if ((statusCode === 401 || statusCode === 402 || statusCode === 403)) {
           if (modelId.includes(':free')) {
             throw new Error(`Invalid or unauthorized OpenRouter API key.`);
           }
           console.log(`OpenRouter: → Paid model needs credits, trying free models...`);
           continue;
        }
        
        throw new Error(`Status ${statusCode}: ${errMsg}`);
      }

      const data = await response.json();
      const textResponse = data.choices?.[0]?.message?.content;
      
      if (!textResponse || textResponse.trim() === '') {
        throw new Error("Empty response from model");
      }

      // Quick check if it's parseable JSON
      const parsed = extractJSON(textResponse);
      if (!parsed) {
        throw new Error("Invalid JSON response");
      }

      console.log(`OpenRouter: ✓ Success with ${modelId}`);
      return textResponse; // Caller handles final parsing

    } catch (err) {
      lastError = err;
      console.warn(`OpenRouter: ✗ ${modelId} failed:`, err.message);
      // Fall through to next model
      continue;
    }
  }

  // If lastError is null, it means we didn't throw an error in the loop but exhausted models (e.g., all 402s).
  const errorMessage = lastError?.message || "All models failed or require credits.";
  if (errorMessage.includes("429") || errorMessage.includes("Too Many Requests") || errorMessage.includes("rate") || errorMessage.includes("quota")) {
    throw new Error("All free models are rate-limited right now. Please wait 30 seconds and try again.");
  }
  
  throw new Error(`OpenRouter failed after trying all models. Last error: ${errorMessage}`);
};

const callGemini = async (systemPrompt, userPrompt, imageObj) => {
  const apiKey = CONFIG.gemini.apiKey;
  const url = `${CONFIG.gemini.url}?key=${apiKey}`;

  let contents;
  if (imageObj) {
    contents = [
      {
        parts: [
          { text: systemPrompt },
          { text: userPrompt },
          {
            inline_data: {
              mime_type: imageObj.type,
              data: imageObj.base64,
            },
          },
        ],
      },
    ];
  } else {
    contents = [
      {
        parts: [
          { text: systemPrompt },
          { text: userPrompt }
        ],
      },
    ];
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusCode = response.status;
        const errMsg = errorData.error?.message || response.statusText;
        
        if (statusCode === 429 || statusCode === 503) {
          if (attempt < 2) { 
            console.warn(`Gemini: Rate limited. Retrying attempt ${attempt + 1}...`);
            await delay(2000); 
            continue; 
          }
        }
        
        if (statusCode === 401 || statusCode === 403) {
          throw new Error('Invalid Gemini API key. Please check your key.');
        }

        throw new Error(`Gemini Error: ${errMsg}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        if (attempt < 2) { await delay(1000); continue; }
        throw new Error('No response from Gemini.');
      }
      
      // Verify parseable JSON
      const parsed = extractJSON(textResponse);
      if (!parsed) {
        if (attempt < 2) { await delay(1000); continue; }
        throw new Error('Invalid JSON response from Gemini.');
      }

      console.log(`Gemini: ✓ Success`);
      return textResponse;
      
    } catch (error) {
      if (attempt >= 2) {
        throw error;
      }
    }
  }
};

/**
 * Main AI caller that routes to either Gemini or OpenRouter based on available keys.
 * Prioritizes Gemini if both are available, falls back to OpenRouter.
 */
export const callAI = async (systemPrompt, userPrompt, imageFile = null) => {
  const hasGemini = !!CONFIG.gemini.apiKey;
  const hasOpenRouter = !!CONFIG.openRouter.apiKey;

  if (!hasGemini && !hasOpenRouter) {
    throw new Error('No API keys configured. Please add VITE_GEMINI_API_KEY or VITE_OPENROUTER_API_KEY to your .env file.');
  }

  let imageObj = null;
  if (imageFile && imageFile instanceof File) {
    const base64 = await fileToBase64(imageFile);
    imageObj = { type: imageFile.type, base64 };
  }

  try {
    if (hasGemini) {
      return await callGemini(systemPrompt, userPrompt, imageObj);
    } else {
      return await callOpenRouter(systemPrompt, userPrompt, imageObj);
    }
  } catch (error) {
    // If one fails and the other is available, try the fallback
    if (hasGemini && hasOpenRouter) {
      console.warn(`Primary API failed, trying fallback. Error: ${error.message}`);
      return await callOpenRouter(systemPrompt, userPrompt, imageObj);
    }
    throw error;
  }
};
