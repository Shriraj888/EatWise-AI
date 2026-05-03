/**
 * Zustand store for EatWise AI.
 * Central state management with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatDateKey } from '../utils/formatters';
import { generateId } from '../utils/formatters';
import { supabase } from '../utils/supabase';

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
      /* ---- Auth ---- */
      userId: null,
      setUserId: (id) => set({ userId: id }),

      /* ---- User Profile ---- */
      userProfile: { ...DEFAULT_PROFILE },

      setUserProfile: async (profile) => {
        const currentProfile = get().userProfile;
        const newProfile = { ...currentProfile, ...profile };
        
        set(() => ({ userProfile: newProfile }));
        
        const userId = get().userId;
        if (userId) {
          try {
            const { error } = await supabase.from('profiles').upsert({
              id: userId,
              name: newProfile.name || 'User',
              age: newProfile.age ? parseInt(newProfile.age, 10) : 25,
              weight: newProfile.weight ? parseFloat(newProfile.weight) : 70.0,
              height: newProfile.height ? parseFloat(newProfile.height) : 170.0,
              gender: newProfile.gender || 'male',
              activity: newProfile.activity || 'moderate',
              goal: newProfile.goal || 'maintain',
              calorie_goal: newProfile.calorieGoal || 2000,
              macro_protein: newProfile.macroGoals?.protein || 125,
              macro_carbs: newProfile.macroGoals?.carbs || 250,
              macro_fat: newProfile.macroGoals?.fat || 56,
              health_conditions: newProfile.healthConditions || [],
              theme: newProfile.theme || 'light',
              updated_at: new Date().toISOString()
            });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync profile to Supabase:', error);
          }
        }
      },



      /* ---- Meal Logs (keyed by YYYY-MM-DD) ---- */
      mealLogs: {},

      setMeals: (mealsData) => {
        const newMealLogs = {};
        mealsData.forEach(meal => {
          const dateKey = meal.date;
          if (!newMealLogs[dateKey]) {
            newMealLogs[dateKey] = [];
          }
          newMealLogs[dateKey].push({
            id: meal.id,
            name: meal.name,
            type: meal.type,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            healthBadge: meal.health_badge,
            notes: meal.notes,
            createdAt: meal.created_at
          });
        });
        set({ mealLogs: newMealLogs });
      },

      addMeal: async (meal, date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;
        
        let newMeal = {
          ...meal,
          id: generateId(), // Fallback temporary ID
          createdAt: new Date().toISOString(),
        };

        if (userId) {
          try {
            const { data, error } = await supabase.from('meals').insert({
              user_id: userId,
              date: dateKey,
              name: meal.name,
              type: meal.type || 'snack',
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0,
              health_badge: meal.healthBadge || meal.health_badge || null,
              notes: meal.notes || null
            }).select().single();
            
            if (error) throw error;
            if (data) {
              newMeal = {
                id: data.id,
                name: data.name,
                type: data.type,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat,
                healthBadge: data.health_badge,
                notes: data.notes,
                createdAt: data.created_at
              };
            }
          } catch (error) {
            console.error('Failed to add meal to Supabase:', error);
          }
        }

        set((state) => ({
          mealLogs: {
            ...state.mealLogs,
            [dateKey]: [...(state.mealLogs[dateKey] || []), newMeal],
          },
        }));
        return newMeal;
      },

      updateMeal: async (mealId, updates, date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;

        if (userId) {
          try {
            // Only include specific update properties, undefined will be ignored by Supabase mostly, but let's be safe
            const updatePayload = {};
            if (updates.name !== undefined) updatePayload.name = updates.name;
            if (updates.type !== undefined) updatePayload.type = updates.type;
            if (updates.calories !== undefined) updatePayload.calories = updates.calories;
            if (updates.protein !== undefined) updatePayload.protein = updates.protein;
            if (updates.carbs !== undefined) updatePayload.carbs = updates.carbs;
            if (updates.fat !== undefined) updatePayload.fat = updates.fat;
            if (updates.healthBadge !== undefined) updatePayload.health_badge = updates.healthBadge;
            if (updates.notes !== undefined) updatePayload.notes = updates.notes;

            const { error } = await supabase.from('meals').update(updatePayload)
              .eq('id', mealId)
              .eq('user_id', userId);
            
            if (error) throw error;
          } catch (error) {
            console.error('Failed to update meal in Supabase:', error);
          }
        }

        set((state) => ({
          mealLogs: {
            ...state.mealLogs,
            [dateKey]: (state.mealLogs[dateKey] || []).map((m) =>
              m.id === mealId ? { ...m, ...updates } : m
            ),
          },
        }));
      },

      deleteMeal: async (mealId, date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;

        if (userId) {
          try {
            const { error } = await supabase.from('meals')
              .delete()
              .eq('id', mealId)
              .eq('user_id', userId);
              
            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete meal from Supabase:', error);
          }
        }

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

      setFavorites: (favoritesData) => {
        const mappedFavorites = favoritesData.map(fav => ({
          id: fav.id,
          name: fav.name,
          prepTime: fav.prep_time,
          cookTime: fav.cook_time,
          difficulty: fav.difficulty,
          ingredients: fav.ingredients,
          steps: fav.steps,
          calories: fav.calories,
          protein: fav.protein,
          carbs: fav.carbs,
          fat: fav.fat,
          healthBenefits: fav.health_benefits,
          savedAt: fav.created_at
        }));
        set({ favorites: mappedFavorites });
      },

      addFavorite: async (recipe) => {
        const userId = get().userId;
        let newRecipe = { ...recipe, id: generateId(), savedAt: new Date().toISOString() };
        
        if (userId) {
          try {
            const { data, error } = await supabase.from('favorites').insert({
              user_id: userId,
              name: recipe.name,
              prep_time: recipe.prepTime,
              cook_time: recipe.cookTime,
              difficulty: recipe.difficulty,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              calories: recipe.calories,
              protein: recipe.protein,
              carbs: recipe.carbs,
              fat: recipe.fat,
              health_benefits: recipe.healthBenefits
            }).select().single();
            
            if (error) throw error;
            if (data) {
              newRecipe = {
                id: data.id,
                name: data.name,
                prepTime: data.prep_time,
                cookTime: data.cook_time,
                difficulty: data.difficulty,
                ingredients: data.ingredients,
                steps: data.steps,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fat: data.fat,
                healthBenefits: data.health_benefits,
                savedAt: data.created_at
              };
            }
          } catch (error) {
            console.error('Failed to add favorite to Supabase:', error);
          }
        }
        
        set((state) => ({
          favorites: [...state.favorites, newRecipe],
        }));
      },

      removeFavorite: async (recipeId) => {
        const userId = get().userId;
        
        if (userId) {
          try {
            const { error } = await supabase.from('favorites')
              .delete()
              .eq('id', recipeId)
              .eq('user_id', userId);
              
            if (error) throw error;
          } catch (error) {
            console.error('Failed to remove favorite from Supabase:', error);
          }
        }

        set((state) => ({
          favorites: state.favorites.filter((r) => r.id !== recipeId),
        }));
      },

      isFavorite: (recipeName) => {
        return get().favorites.some((r) => r.name === recipeName);
      },

      /* ---- Water Intake ---- */
      waterIntake: {},

      setWaterIntakeData: (data) => {
        const newWaterIntake = {};
        data.forEach(item => {
          newWaterIntake[item.date] = item.glasses;
        });
        set({ waterIntake: newWaterIntake });
      },

      setWaterIntake: async (glasses, date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;

        set((state) => ({
          waterIntake: { ...state.waterIntake, [dateKey]: glasses },
        }));

        if (userId) {
          try {
            const { error } = await supabase.from('water_intake').upsert({
            user_id: userId,
            date: dateKey,
            glasses: glasses,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, date' });
            
            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync water intake to Supabase:', error);
          }
        }
      },

      getWaterIntake: (date) => {
        const dateKey = date || formatDateKey();
        return get().waterIntake[dateKey] || 0;
      },

      refreshWaterIntake: async () => {
        const userId = get().userId;
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('water_intake')
            .select('date, glasses')
            .eq('user_id', userId);
            
          if (error) throw error;
          
          if (data) {
            get().setWaterIntakeData(data);
          }
        } catch (error) {
          console.error('Failed to fetch water intake:', error);
        }
      },

      /* ---- Streak Days ---- */
      streakDays: {},

      setStreakDaysData: (data) => {
        const newStreakDays = {};
        data.forEach(item => {
          newStreakDays[item.date] = item.active;
        });
        set({ streakDays: newStreakDays });
      },

      toggleStreakDay: async (date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;
        const currentState = get().streakDays[dateKey] || false;
        const newState = !currentState;

        set((state) => ({
          streakDays: {
            ...state.streakDays,
            [dateKey]: newState,
          },
        }));

        if (userId) {
          try {
            const { error } = await supabase.from('streak_days').upsert({
              user_id: userId,
              date: dateKey,
              active: newState
            }, { onConflict: 'user_id, date' });
            
            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync streak days to Supabase:', error);
          }
        }
      },

      /* ---- Wellness Check-ins (SDG 3) ---- */
      wellnessCheckins: {},

      setWellnessCheckinsData: (data) => {
        const newWellnessCheckins = {};
        data.forEach(item => {
          newWellnessCheckins[item.date] = {
            mood: item.mood,
            sleep: item.sleep,
            timestamp: item.updated_at || item.created_at
          };
        });
        set({ wellnessCheckins: newWellnessCheckins });
      },

      addWellnessCheckin: async (checkin, date) => {
        const dateKey = date || formatDateKey();
        const userId = get().userId;
        const timestamp = new Date().toISOString();

        set((state) => ({
          wellnessCheckins: {
            ...state.wellnessCheckins,
            [dateKey]: {
              ...(state.wellnessCheckins[dateKey] || {}),
              ...checkin,
              timestamp,
            },
          },
        }));

        if (userId) {
          try {
            const currentCheckin = get().wellnessCheckins[dateKey] || {};
            const { error } = await supabase.from('wellness_checkins').upsert({
              user_id: userId,
              date: dateKey,
              mood: currentCheckin.mood || null,
              sleep: currentCheckin.sleep || null,
              updated_at: timestamp
            }, { onConflict: 'user_id, date' });
            
            if (error) throw error;
          } catch (error) {
            console.error('Failed to sync wellness checkin to Supabase:', error);
          }
        }
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
