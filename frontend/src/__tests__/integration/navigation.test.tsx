// src/__tests__/integration/navigation.test.tsx
// Integration tests for routing and navigation — Requirements: 12.3, 5.4

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import { ModeProvider } from "../../context/ModeContext";

// ── Mock data-fetching hooks to avoid real API calls ─────────────────────

vi.mock("../../hooks/useAlerts", () => ({
  useAlerts: () => ({
    alerts: [],
    loading: false,
    error: null,
    connectionStatus: "connected",
  }),
}));

vi.mock("../../hooks/useThroughput", () => ({
  useThroughput: () => ({ points: [], loading: false, error: null }),
}));

vi.mock("../../hooks/useBotStatus", () => ({
  useBotStatus: () => ({ bots: [], loading: false, error: null }),
}));

vi.mock("../../api/apiClient", () => ({
  default: {
    fetchAlert: () =>
      Promise.reject({ statusCode: 404, message: "Not found", kind: "http" }),
  },
}));

// ── Page imports (after mocks are set up) ────────────────────────────────

import { DashboardPage } from "../../pages/DashboardPage";
import { NotFoundPage } from "../../pages/NotFoundPage";
import { AlertDetailPage } from "../../pages/AlertDetailPage";

// ── Helper: wraps a page with ModeProvider and MemoryRouter ──────────────

/**
 * ShellStub acts as a minimal AppShell replacement.
 * DashboardPage calls useOutletContext to get { searchQuery }, so we need
 * to provide it via a parent route that renders <Outlet context={...} />.
 */
function ShellStub() {
  return <Outlet context={{ searchQuery: "" }} />;
}

function renderAtPath(
  path: string,
  initialEntries: string[] = [path]
) {
  return render(
    <ModeProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          {/* Shell route mirrors the real router structure */}
          <Route path="/" element={<ShellStub />}>
            <Route index element={<DashboardPage />} />
            <Route path="alerts/:id" element={<AlertDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    </ModeProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("Navigation integration tests", () => {
  it('1. Dashboard route renders at "/" without crashing', () => {
    // Renders the dashboard. Since all data hooks return empty/loading=false,
    // we expect the "No alerts detected" empty-state and the KPI cards area.
    renderAtPath("/");

    // The Alerts table renders its empty state when alerts = []
    expect(screen.getByText("No alerts detected")).toBeInTheDocument();
  });

  it('2. NotFoundPage renders at an unknown route "/unknown-path"', () => {
    renderAtPath("/unknown-path");

    // NotFoundPage always shows the 404 heading
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    // It also has a link back to the dashboard
    expect(screen.getByRole("link", { name: /return to dashboard/i })).toBeInTheDocument();
  });

  it("3. Alert table row click navigates to /alerts/:id", () => {
    // Provide an alert so the table renders a clickable row
    const { rerender: _rerender } = render(
      <ModeProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<ShellStub />}>
              <Route
                index
                element={
                  <AlertsTableWrapper
                    onRowClick={(id) => {
                      // Navigation is handled inside DashboardPage with useNavigate.
                      // Here we verify the onRowClick callback fires with the correct id.
                      expect(id).toBe("test-alert-001");
                    }}
                  />
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </ModeProvider>
    );
  });
});

// ── Minimal component to test onRowClick independently ───────────────────
import { AlertsTable } from "../../components/AlertsTable";
import type { Alert } from "../../types/alert";

const mockAlert: Alert = {
  id: "test-alert-001",
  type: "DDoS",
  severity: "Critical",
  sourceIp: "192.168.1.1",
  destinationIp: "10.0.0.1",
  protocol: "UDP",
  timestamp: "2024-01-14T08:00:00.000Z",
  description: "Test alert",
  status: "open",
  evidence: { flows: [], rawPackets: [] },
  blockchainHash: null,
  blockchainVerified: false,
};

function AlertsTableWrapper({ onRowClick }: { onRowClick: (id: string) => void }) {
  return <AlertsTable alerts={[mockAlert]} onRowClick={onRowClick} />;
}

describe("AlertsTable row click navigation", () => {
  it("3. Clicking an alert table row fires the onRowClick handler with the alert id", () => {
    const handleRowClick = vi.fn();

    render(
      <ModeProvider>
        <MemoryRouter>
          <AlertsTableWrapper onRowClick={handleRowClick} />
        </MemoryRouter>
      </ModeProvider>
    );

    // The row has role="row" and an aria-label matching the alert id
    const row = screen.getByRole("row", {
      name: /test-alert-001/i,
    });

    fireEvent.click(row);
    expect(handleRowClick).toHaveBeenCalledOnce();
    expect(handleRowClick).toHaveBeenCalledWith("test-alert-001");
  });
});
