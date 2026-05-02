import { useQuery } from '@tanstack/react-query';
import { generateDailyInsight } from '../services/openRouterService';

export const useDailyInsight = (profile, todaysMeals, totals) => {
  return useQuery({
    queryKey: ['dailyInsight', new Date().toDateString(), todaysMeals.length, Math.round(totals.calories)],
    queryFn: async () => {
      const cacheKey = `insight_${new Date().toDateString()}_${todaysMeals.length}_${Math.round(totals.calories)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached insight");
        }
      }

      const result = await generateDailyInsight(profile, todaysMeals, totals);
      
      // Cleanup old cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('insight_')) {
          localStorage.removeItem(key);
        }
      });
      
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    },
    staleTime: Infinity, // Prevent refetching unnecessarily
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!profile.name, // Only run if profile is set
    retry: 1,
  });
};
