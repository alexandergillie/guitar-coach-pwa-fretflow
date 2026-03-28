import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { HomePage } from '@/pages/HomePage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import { ExerciseDetailPage } from '@/pages/ExerciseDetailPage';
import { PracticePage } from '@/pages/PracticePage';
import { SessionAnalysisPage } from '@/pages/SessionAnalysisPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { RoadmapsPage } from '@/pages/RoadmapsPage';
import { configureAuth } from '@/lib/api-client';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/assessment",
    element: <AssessmentPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/library",
    element: <ExerciseLibraryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/exercise/:id",
    element: <ExerciseDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/practice/:id",
    element: <PracticePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/practice/:id/analysis",
    element: <SessionAnalysisPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/progress",
    element: <ProgressPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/roadmaps",
    element: <RoadmapsPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);

/** Syncs the Clerk token and user name into the api-client whenever auth changes. */
function AuthSync() {
  const { getToken } = useAuth();
  const { user } = useUser();
  useEffect(() => {
    const fullName = user?.fullName || user?.firstName || null;
    configureAuth(() => getToken(), fullName);
  }, [getToken, user]);
  return null;
}

// Theme definitions mirrored from use-ui-theme.ts — keeps SignInScreen
// independent of React context while still matching the active theme.
const SIGN_IN_THEMES: Record<string, { bg: string; card: string; input: string; accent: string; text: string; subtext: string; isDark: boolean }> = {
  default: { bg: '#09090b', card: '#18181b', input: '#27272a', accent: '#f97316', text: '#fafafa', subtext: '#a1a1aa', isDark: true },
  studio:  { bg: '#060d1a', card: '#0a1628', input: '#0f1f38', accent: '#00c897', text: '#d0dbe8', subtext: '#7a90a8', isDark: true },
  acoustic:{ bg: '#fdf6e9', card: '#faf0d8', input: '#f0e4c4', accent: '#c2410c', text: '#1c1008', subtext: '#6b4c2a', isDark: false },
  neon:    { bg: '#080010', card: '#0e0020', input: '#180030', accent: '#e040fb', text: '#ede0f5', subtext: '#9966bb', isDark: true },
};

/** Full-page sign-in screen shown when the user is not authenticated. */
function SignInScreen() {
  const themeKey = (localStorage.getItem('ui-theme') ?? 'default') as string;
  const t = SIGN_IN_THEMES[themeKey] ?? SIGN_IN_THEMES.default;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4" style={{ backgroundColor: t.bg }}>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: t.text }}>FretFlow</h1>
        <p style={{ color: t.subtext }}>Sign in to start practicing</p>
      </div>
      <SignIn routing="hash" appearance={{
        variables: {
          colorPrimary: t.accent,
          colorBackground: t.card,
          colorInputBackground: t.input,
          colorText: t.text,
          colorTextSecondary: t.subtext,
          colorNeutral: t.isDark ? '#ffffff' : '#000000',
        },
        elements: {
          card: `shadow-2xl border`,
          formButtonPrimary: `shadow-md`,
        },
      }} />
    </div>
  );
}

function AppInner() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SignedIn>
          <AuthSync />
          <RouterProvider router={router} />
          <PwaInstallPrompt />
        </SignedIn>
        <SignedOut>
          <SignInScreen />
        </SignedOut>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default function App() {
  // If no Clerk key is configured (local dev without auth), run without auth gate
  if (!CLERK_KEY) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <PwaInstallPrompt />
        </ErrorBoundary>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <AppInner />
    </ClerkProvider>
  );
}
