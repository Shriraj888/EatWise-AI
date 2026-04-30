import { useQuery } from '@tanstack/react-query';
import { generateDailyInsight } from '../services/openRouterService';

export const useDailyInsight = (profile, todaysMeals, totals) => {
  return useQuery({
    queryKey: ['dailyInsight', todaysMeals.length, totals.calories], // Re-run when meals/calories change
    queryFn: () => generateDailyInsight(profile, todaysMeals, totals),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!profile.name, // Only run if profile is set
    retry: 1,
  });
};
