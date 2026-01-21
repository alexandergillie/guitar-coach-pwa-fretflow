import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <PwaInstallPrompt />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}