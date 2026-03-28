import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
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

/**
 * Protects a route: renders children when signed in, redirects to /sign-in
 * when signed out. When Clerk is not configured (no CLERK_KEY), renders
 * children unconditionally so local dev still works.
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!CLERK_KEY) return <>{children}</>;
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
    </>
  );
}

// Theme definitions mirrored from use-ui-theme.ts — keeps SignInPage
// independent of React context while still matching the active theme.
const SIGN_IN_THEMES: Record<string, { bg: string; card: string; input: string; accent: string; text: string; subtext: string; isDark: boolean }> = {
  default: { bg: '#09090b', card: '#18181b', input: '#27272a', accent: '#f97316', text: '#fafafa', subtext: '#a1a1aa', isDark: true },
  studio:  { bg: '#060d1a', card: '#0a1628', input: '#0f1f38', accent: '#00c897', text: '#d0dbe8', subtext: '#7a90a8', isDark: true },
  acoustic:{ bg: '#fdf6e9', card: '#faf0d8', input: '#f0e4c4', accent: '#c2410c', text: '#1c1008', subtext: '#6b4c2a', isDark: false },
  neon:    { bg: '#080010', card: '#0e0020', input: '#180030', accent: '#e040fb', text: '#ede0f5', subtext: '#9966bb', isDark: true },
};

/**
 * Sign-in page mounted at /sign-in.
 *
 * Uses routing="path" so Clerk can mount its SSO callback handler at
 * /sign-in/sso-callback — the URL that Google/Apple redirect back to after
 * OAuth completes. This is the fix for the post-OAuth redirect loop that
 * occurred when routing="hash" was used.
 *
 * If the user is already signed in, they are sent straight to /.
 * If Clerk is not configured (local dev), also redirect to /.
 */
function SignInPage() {
  if (!CLERK_KEY) return <Navigate to="/" replace />;

  const themeKey = (localStorage.getItem('ui-theme') ?? 'default') as string;
  const t = SIGN_IN_THEMES[themeKey] ?? SIGN_IN_THEMES.default;

  return (
    <>
      <SignedIn><Navigate to="/" replace /></SignedIn>
      <SignedOut>
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-4" style={{ backgroundColor: t.bg }}>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: t.text }}>FretFlow</h1>
            <p style={{ color: t.subtext }}>Sign in to start practicing</p>
          </div>
          <SignIn
            routing="path"
            path="/sign-in"
            afterSignInUrl="/"
            afterSignUpUrl="/"
            appearance={{
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
            }}
          />
        </div>
      </SignedOut>
    </>
  );
}

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

const router = createBrowserRouter([
  // /sign-in/* — the /* wildcard lets Clerk mount sub-routes such as
  // /sign-in/sso-callback which is where Google/Apple redirect after OAuth.
  {
    path: "/sign-in/*",
    element: <SignInPage />,
  },
  {
    path: "/",
    element: <RequireAuth><HomePage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/assessment",
    element: <RequireAuth><AssessmentPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/library",
    element: <RequireAuth><ExerciseLibraryPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/exercise/:id",
    element: <RequireAuth><ExerciseDetailPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/practice/:id",
    element: <RequireAuth><PracticePage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/practice/:id/analysis",
    element: <RequireAuth><SessionAnalysisPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/progress",
    element: <RequireAuth><ProgressPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/roadmaps",
    element: <RequireAuth><RoadmapsPage /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
]);

function AppInner() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {/* AuthSync and PwaInstallPrompt only need to run when authenticated */}
        <SignedIn>
          <AuthSync />
          <PwaInstallPrompt />
        </SignedIn>
        {/* Router is always rendered so /sign-in/* is reachable when signed out */}
        <RouterProvider router={router} />
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
    <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/" afterSignUpUrl="/">
      <AppInner />
    </ClerkProvider>
  );
}
