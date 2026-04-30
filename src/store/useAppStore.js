/**
 * Zustand store for EatWise AI.
 * Central state management with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatDateKey } from '../utils/formatters';
import { generateId } from '../utils/formatters';

const DEFAULT_PROFILE = {
  name: '',
  age: '',
  weight: '',
  height: '',
  gender: 'male',
  activity: 'moderate',
  goal: 'maintain',
  calorieGoal: 2000,
  macroGoals: { protein: 125, carbs: 250, fat: 56 },
  healthConditions: [],
};

const useAppStore = create(
  persist(
    (set, get) => ({
      /* ---- User Profile ---- */
      userProfile: { ...DEFAULT_PROFILE },

      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),



      /* ---- Meal Logs (keyed by YYYY-MM-DD) ---- */
      mealLogs: {},

      addMeal: (meal, date) => {
        const dateKey = date || formatDateKey();
        const newMeal = {
          ...meal,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          mealLogs: {
            ...state.mealLogs,
            [dateKey]: [...(state.mealLogs[dateKey] || []), newMeal],
          },
        }));
        return newMeal;
      },

      updateMeal: (mealId, updates, date) => {
        const dateKey = date || formatDateKey();
        set((state) => ({
          mealLogs: {
            ...state.mealLogs,
            [dateKey]: (state.mealLogs[dateKey] || []).map((m) =>
              m.id === mealId ? { ...m, ...updates } : m
            ),
          },
        }));
      },

      deleteMeal: (mealId, date) => {
        const dateKey = date || formatDateKey();
        set((state) => ({
          mealLogs: {
            ...state.mealLogs,
            [dateKey]: (state.mealLogs[dateKey] || []).filter(
              (m) => m.id !== mealId
            ),
          },
        }));
      },

      getMealsForDate: (date) => {
        const dateKey = date || formatDateKey();
        return get().mealLogs[dateKey] || [];
      },

      /* ---- Favorites (Saved Recipes) ---- */
      favorites: [],

      addFavorite: (recipe) => {
        const newRecipe = { ...recipe, id: generateId(), savedAt: new Date().toISOString() };
        set((state) => ({
          favorites: [...state.favorites, newRecipe],
        }));
      },

      removeFavorite: (recipeId) =>
        set((state) => ({
          favorites: state.favorites.filter((r) => r.id !== recipeId),
        })),

      isFavorite: (recipeName) => {
        return get().favorites.some((r) => r.name === recipeName);
      },

      /* ---- Water Intake ---- */
      waterIntake: {},

      setWaterIntake: (glasses, date) => {
        const dateKey = date || formatDateKey();
        set((state) => ({
          waterIntake: { ...state.waterIntake, [dateKey]: glasses },
        }));
      },

      getWaterIntake: (date) => {
        const dateKey = date || formatDateKey();
        return get().waterIntake[dateKey] || 0;
      },

      /* ---- Streak Days ---- */
      streakDays: {},

      toggleStreakDay: (date) => {
        const dateKey = date || formatDateKey();
        set((state) => ({
          streakDays: {
            ...state.streakDays,
            [dateKey]: !state.streakDays[dateKey],
          },
        }));
      },

      /* ---- Wellness Check-ins (SDG 3) ---- */
      wellnessCheckins: {},

      addWellnessCheckin: (checkin, date) => {
        const dateKey = date || formatDateKey();
        set((state) => ({
          wellnessCheckins: {
            ...state.wellnessCheckins,
            [dateKey]: {
              ...(state.wellnessCheckins[dateKey] || {}),
              ...checkin,
              timestamp: new Date().toISOString(),
            },
          },
        }));
      },

      getWellnessCheckin: (date) => {
        const dateKey = date || formatDateKey();
        return get().wellnessCheckins[dateKey] || null;
      },

      /* ---- Theme ---- */
      theme: 'light',

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'eatwise-storage',
      version: 1,
    }
  )
);

export default useAppStore;
