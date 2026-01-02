import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import { ExerciseDetailPage } from '@/pages/ExerciseDetailPage';
import { PracticePage } from '@/pages/PracticePage';
import { SessionAnalysisPage } from '@/pages/SessionAnalysisPage';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
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
    element: <div className="p-10 text-center text-white">Progress Analytics Dashboard</div>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/roadmaps",
    element: <div className="p-10 text-center text-white">Personalized Learning Paths</div>,
    errorElement: <RouteErrorBoundary />,
  },
]);
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}