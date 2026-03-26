import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignedIn, SignedOut, useAuth, SignIn } from '@clerk/clerk-react';
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

/** Syncs the Clerk token into the api-client whenever auth changes. */
function AuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    configureAuth(() => getToken());
  }, [getToken]);
  return null;
}

/** Full-page sign-in screen shown when the user is not authenticated. */
function SignInScreen() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white">FretFlow</h1>
        <p className="text-zinc-400">Sign in to start practicing</p>
      </div>
      <SignIn routing="hash" appearance={{
        variables: { colorPrimary: '#f97316', colorBackground: '#09090b', colorInputBackground: '#18181b', colorText: '#fafafa' },
        elements: { card: 'bg-zinc-900 border border-zinc-800 shadow-xl', formButtonPrimary: 'bg-orange-500 hover:bg-orange-600' }
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
