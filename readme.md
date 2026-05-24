# EatWise AI

EatWise AI is a client-side nutrition and wellness tracker built with React and Vite. It helps users create a profile, calculate daily nutrition goals, log meals, analyze meals with AI, generate recipe ideas from available ingredients, and monitor wellness signals aligned with UN Sustainable Development Goal 3: Good Health and Well-Being.

The app stores user data in the browser through `localStorage`, uses Open Food Facts for food search, and can call either Google Gemini or OpenRouter for AI-powered nutrition analysis, recipe generation, and daily insights.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How the App Works](#how-the-app-works)
- [Data Persistence](#data-persistence)
- [AI and API Services](#ai-and-api-services)
- [Important Notes](#important-notes)
- [Troubleshooting](#troubleshooting)

## Features

### Personalized onboarding

- Collects basic profile data: name, age, weight, height, gender, activity level, goal, and optional health conditions.
- Calculates daily calorie targets using the Mifflin-St Jeor equation.
- Calculates macro goals for protein, carbohydrates, and fat based on the selected goal.
- Blocks access to the main app until the required profile fields are complete.

### Dashboard

- Shows a daily nutrition overview.
- Displays calorie progress and macro progress.
- Provides AI-generated daily nutrition insights.
- Shows today's logged meals.
- Includes quick navigation to meal logging, AI analysis, recipes, and wellness.
- Tracks weekly activity/streak indicators.

### Meal logging

- Logs meals by date.
- Supports meal type, calories, protein, carbs, fat, and notes.
- Allows editing and deleting meal entries.
- Includes Open Food Facts search to autofill nutrition data.

### AI meal analyzer

- Accepts a meal image or text description.
- Estimates calories and macros.
- Produces a health score, health badge, suggestions, and health impact note.
- Can add AI-analyzed meals directly to the meal log.

### Recipe suggester

- Generates healthy recipes from user-entered ingredients.
- Supports dietary filters.
- Returns recipe steps, estimated nutrition, prep/cook time, and health benefits.
- Lets users save and remove favorite recipes.

### Health and wellness hub

- Calculates BMI and displays health-risk categories.
- Tracks daily hydration.
- Tracks mood and sleep quality.
- Computes a wellness score from BMI, meals, water intake, mood, and sleep.
- Includes nutrition-focused non-communicable disease prevention tips.
- Explains how the app supports SDG 3 goals.

### Theme support

- Includes theme state in the app store.
- Theme preference is persisted with the rest of app state.

## Tech Stack

- React 19
- Vite 8
- React Router
- TanStack React Query
- Zustand with persistence middleware
- Framer Motion
- GSAP
- Recharts
- Lucide React
- React Hot Toast
- Open Food Facts API
- Google Gemini API
- OpenRouter API

## Project Structure

```text
EatWise AI/
  public/
    favicon.svg
    icons.svg
    reference 1.jpg
    reference 2.jpg
  src/
    assets/
      hero.png
    components/
      dashboard/       Dashboard widgets and charts
      layout/          App shell and navigation
      meals/           Meal form and food search workflow
      ui/              Reusable UI primitives
    hooks/             React Query and app-specific hooks
    pages/             Route-level screens
    services/          AI, API, and configuration services
    store/             Zustand app store
    utils/             Constants, formatters, validators, calculators
    App.jsx            Routes, providers, and onboarding guard
    main.jsx           React entry point
  .env.example
  package.json
  vite.config.js
```

## Getting Started

### Prerequisites

Install Node.js and npm. This project is a Vite app, so a recent active Node.js release is recommended.

### Installation

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then add at least one AI provider key:

```env
VITE_GEMINI_API_KEY="your_gemini_api_key_here"
VITE_OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

The app can run with only one of these keys. If both are provided, Gemini is tried first and OpenRouter is used as a fallback.

### Start the development server

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | Optional if OpenRouter is configured | Google Gemini API key used for meal analysis, recipes, and insights. |
| `VITE_OPENROUTER_API_KEY` | Optional if Gemini is configured | OpenRouter API key used as an AI provider or fallback provider. |

Because this is a frontend-only Vite app, variables prefixed with `VITE_` are exposed to the browser bundle. For production, use restricted API keys where possible or route AI calls through a backend proxy.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for preview.

```bash
npm run lint
```

Runs ESLint against the project.

## How the App Works

### Routing

Routes are defined in `src/App.jsx`.

| Path | Screen |
| --- | --- |
| `/` | Dashboard |
| `/meals` | Meal Log |
| `/analyzer` | AI Meal Analyzer |
| `/recipes` | Recipe Suggester |
| `/wellness` | Health and Wellness |
| `/profile` | Profile |

`OnboardingGuard` checks the persisted user profile before rendering the main layout. If the profile is incomplete, the onboarding screen is shown instead.

### State management

The main app state lives in `src/store/useAppStore.js`.

It stores:

- User profile and calculated goals
- Meal logs keyed by date
- Favorite recipes
- Water intake keyed by date
- Streak days
- Wellness check-ins
- Theme preference

### Nutrition calculations

Nutrition goal helpers live in `src/utils/tdeeCalculator.js`.

- BMR is calculated with the Mifflin-St Jeor equation.
- TDEE is calculated from BMR and selected activity level.
- Calorie goals are adjusted for the selected user goal.
- Macro goals are split differently for losing, maintaining, or building weight.
- BMI is calculated from weight and height.

### Food search

Food search is handled by:

- `src/hooks/useFoodSearch.js`
- `src/services/foodFactsService.js`

The app queries Open Food Facts, normalizes the results, and uses per-100g nutrition values when available.

### AI calls

AI routing is handled by `src/services/aiProvider.js`.

The app:

1. Checks whether Gemini and/or OpenRouter keys are configured.
2. Converts uploaded images to base64 when needed.
3. Calls Gemini first if available.
4. Falls back to OpenRouter if Gemini fails and an OpenRouter key exists.
5. Extracts JSON from AI responses before passing data back to the UI.

Meal analysis prompts live in `src/services/geminiService.js`.
Recipe and daily insight prompts live in `src/services/openRouterService.js`.

## Data Persistence

EatWise AI currently uses Zustand's `persist` middleware with the storage key:

```text
eatwise-storage
```

This means data is stored locally in the user's browser. There is no server-side database in the current project.

To reset local data during development:

1. Open browser developer tools.
2. Go to Application or Storage.
3. Find Local Storage for the app origin.
4. Delete the `eatwise-storage` key.

## Important Notes

- Nutrition values generated by AI are estimates and should not be treated as medical advice.
- The wellness content is educational and does not replace advice from a qualified health professional.
- API keys in a Vite frontend are visible to users of the deployed app.
- Open Food Facts nutrition values depend on public product data and may be incomplete or inconsistent.
- This project is currently frontend-only and does not include authentication, user accounts, or cloud sync.

## Troubleshooting

### The app shows onboarding every time

Check whether `localStorage` is being cleared by the browser or by privacy settings. The profile is stored in `eatwise-storage`.

### AI features fail with an API key error

Check that `.env` exists in the project root and that at least one of these variables is set:

```env
VITE_GEMINI_API_KEY="..."
VITE_OPENROUTER_API_KEY="..."
```

After changing `.env`, restart the Vite development server.

### AI responses fail to parse

The app expects AI providers to return valid JSON. Retry the request. If the issue persists, inspect the prompt and response in the browser console.

### Food search returns no results

Open Food Facts may not have data for every product or search term. Try a more common food name or brand name.

### Production build fails

Run linting and inspect the reported files:

```bash
npm run lint
npm run build
```

Fix reported syntax, import, or React hook issues before deploying.

## Development Notes

- Keep shared state changes inside `src/store/useAppStore.js`.
- Keep external API logic inside `src/services/`.
- Keep reusable UI primitives inside `src/components/ui/`.
- Add new route pages under `src/pages/` and register them in `src/App.jsx`.
- Keep AI prompts strict about JSON output so UI parsing remains reliable.

## License

No license file is currently included in this repository.
