import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import useAppStore from './store/useAppStore';

// Lazy loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MealLog = lazy(() => import('./pages/MealLog'));
const AIAnalyzer = lazy(() => import('./pages/AIAnalyzer'));
const RecipeSuggester = lazy(() => import('./pages/RecipeSuggester'));
const HealthWellness = lazy(() => import('./pages/HealthWellness'));
const Profile = lazy(() => import('./pages/Profile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

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

// Full screen loader for suspense fallback
const FullScreenLoader = () => (
  <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loader" style={{ width: 40, height: 40, border: '3px solid var(--color-bg-tertiary)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);


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
            <Route path="/" element={<OnboardingGuard><Layout /></OnboardingGuard>}>
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
