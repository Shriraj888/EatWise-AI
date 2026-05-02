import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import useAppStore from './store/useAppStore';
import { supabase } from './utils/supabase';
import { Auth } from './components/auth/Auth';

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MealLog = lazy(() => import('./pages/MealLog'));
const AIAnalyzer = lazy(() => import('./pages/AIAnalyzer'));
const RecipeSuggester = lazy(() => import('./pages/RecipeSuggester'));
const HealthWellness = lazy(() => import('./pages/HealthWellness'));
const Profile = lazy(() => import('./pages/Profile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Full screen loader for suspense fallback
const FullScreenLoader = () => (
  <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loader" style={{ width: 40, height: 40, border: '3px solid var(--color-bg-tertiary)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);

const AuthGuard = ({ children }) => {
  const setUserId = useAppStore((state) => state.setUserId);
  const userId = useAppStore((state) => state.userId);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      if (session?.user?.id) {
        fetchProfileAndData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user?.id) {
        fetchProfileAndData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId]);

  const fetchProfileAndData = async (id) => {
    try {
      const [profileRes, mealsRes, waterRes, streakRes, wellnessRes, favoritesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('meals').select('*').eq('user_id', id),
        supabase.from('water_intake').select('*').eq('user_id', id),
        supabase.from('streak_days').select('*').eq('user_id', id),
        supabase.from('wellness_checkins').select('*').eq('user_id', id),
        supabase.from('favorites').select('*').eq('user_id', id)
      ]);
      
      if (!profileRes.error && profileRes.data) {
        const data = profileRes.data;
        useAppStore.setState({
          userProfile: {
            ...useAppStore.getState().userProfile,
            name: data.name || '',
            age: data.age?.toString() || '',
            weight: data.weight?.toString() || '',
            height: data.height?.toString() || '',
            gender: data.gender || 'male',
            activity: data.activity || 'moderate',
            goal: data.goal || 'maintain',
            calorieGoal: data.calorie_goal || 2000,
            macroGoals: {
              protein: data.macro_protein || 125,
              carbs: data.macro_carbs || 250,
              fat: data.macro_fat || 56
            },
            healthConditions: data.health_conditions || [],
            theme: data.theme || 'light'
          }
        });
      }

      if (!mealsRes.error && mealsRes.data) {
        useAppStore.getState().setMeals(mealsRes.data);
      }

      if (!waterRes.error && waterRes.data) {
        useAppStore.getState().setWaterIntakeData(waterRes.data);
      }

      if (!streakRes.error && streakRes.data) {
        useAppStore.getState().setStreakDaysData(streakRes.data);
      }

      if (!wellnessRes.error && wellnessRes.data) {
        useAppStore.getState().setWellnessCheckinsData(wellnessRes.data);
      }

      if (!favoritesRes.error && favoritesRes.data) {
        useAppStore.getState().setFavorites(favoritesRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;
  if (!userId) return <Auth />;

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

const OnboardingGuard = ({ children }) => {
  const profile = useAppStore((state) => state.userProfile);
  
  const isProfileComplete = !!profile.name && !!profile.age && !!profile.weight && !!profile.height;

  if (!isProfileComplete) {
    return <Onboarding initialStep="profile" />;
  }

  return children;
};

OnboardingGuard.propTypes = {
  children: PropTypes.node.isRequired,
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/" element={<AuthGuard><OnboardingGuard><Layout /></OnboardingGuard></AuthGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="meals" element={<MealLog />} />
              <Route path="analyzer" element={<AIAnalyzer />} />
              <Route path="recipes" element={<RecipeSuggester />} />
              <Route path="wellness" element={<HealthWellness />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
