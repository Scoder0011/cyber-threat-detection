// src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertDetailPage } from "./pages/AlertDetailPage";
import { SystemHealthPage } from "./pages/SystemHealthPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// ── Router definition ─────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <DashboardPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "alerts/:id",
        element: (
          <ErrorBoundary>
            <AlertDetailPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "system-health",
        element: (
          <ErrorBoundary>
            <SystemHealthPage />
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
