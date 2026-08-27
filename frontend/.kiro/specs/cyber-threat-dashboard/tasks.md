# Implementation Plan: AI-Powered Cyber Threat Detection Dashboard

## Overview

Implements the full React 18 + TypeScript 5 SPA for the Cyber Threat Detection Dashboard. Tasks follow the layered architecture: data types → API client → hooks → shared/UI components → pages → integration wiring. Each task builds on the previous, with no orphaned code. Testing subtasks use Vitest + React Testing Library + fast-check.

---

## Tasks

- [x] 1. Bootstrap project structure and shared type definitions
  - Scaffold Vite 5 project with React 18 + TypeScript 5 template if not already present
  - Install all required dependencies: `tailwindcss@3`, `framer-motion@11`, `recharts@2`, `react-router-dom@6`, `date-fns@3`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`
  - Configure Tailwind CSS with dark theme and cyan accent `#22d3ee`
  - Create `src/types/alert.ts` exporting all interfaces: `Alert`, `BotStatus`, `Flow`, `Evidence`, `RawPacket`, `ThroughputPoint`, `SystemMetrics`, `ApiError`, and all union types (`Severity`, `AlertStatus`, `BotStatusValue`, `ConnectionStatus`, `AppMode`)
  - Create `src/__tests__/arbitraries.ts` with all shared fast-check arbitraries: `alertArbitrary`, `botStatusArbitraryRecord`, `flowArbitrary`, `throughputPointArbitrary`, `severityArbitrary`, `isoTimestampArbitrary`, `rawPacketArbitrary`
  - Configure Vitest in `vite.config.ts` with jsdom environment and React Testing Library setup
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Implement API client (mock and live)
  - [x] 2.1 Create `src/api/apiClient.ts` with the `ApiClient` interface and `createApiClient(useMock: boolean)` factory
    - Implement `fetchAlerts()`, `fetchAlert(id)`, `fetchBotStatuses()`, `fetchThroughput()`, `fetchSystemMetrics()`
    - Mock mode: return seeded deterministic data (same seed → same output on every call); read `VITE_USE_MOCK` env var
    - Live mode: send Fetch API requests to `VITE_API_BASE_URL`; apply a 10-second timeout; throw typed `ApiError` on non-2xx or timeout
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 2.2 Write property tests for API client
    - **Property 23: Mock API client is deterministic**
    - **Validates: Requirements 13.2**
    - **Property 24: API client throws typed errors for non-2xx responses**
    - **Validates: Requirements 13.5, 13.6**
    - File: `src/__tests__/property/apiClient.property.test.ts`

  - [ ]* 2.3 Write unit tests for API client
    - Test mock mode returns typed data for all four functions
    - Test live mode throws `ApiError` with correct `statusCode` on 4xx/5xx
    - Test 10-second timeout produces `ApiError` with `kind: "timeout"`
    - File: `src/__tests__/unit/apiClient.test.ts`

- [x] 3. Implement `ModeContext` and `useMode` hook
  - Create `src/context/ModeContext.tsx` providing `mode: AppMode`, `setMode`, wrapped at app root
  - Create `src/hooks/useMode.ts` consuming `ModeContext`
  - _Requirements: 11.1, 11.5_

- [x] 4. Implement `useAlerts` hook with WebSocket and mock polling
  - [x] 4.1 Create `src/hooks/useAlerts.ts`
    - Expose `alerts`, `loading`, `error`, `connectionStatus`
    - In live mode with no real backend: generate a mock alert every 3–5 s via `setInterval`
    - In live mode with real backend: open native WebSocket to FastAPI endpoint
    - Implement the state machine: `idle → connecting → connected → reconnecting → disconnected` with up to 5 retries, 5 s delay between retries
    - Maintain buffer capped at 200 alerts — oldest discarded on overflow
    - On mode switch to Replay: disconnect WebSocket/clear interval, clear buffer, begin replaying bundled historical dataset via configurable timer
    - On unmount: clean up all subscriptions and timers
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 11.2, 11.3_

  - [ ]* 4.2 Write property tests for `useAlerts`
    - **Property 21: useAlerts buffer never exceeds 200 items**
    - **Validates: Requirements 12.6**
    - **Property 22: WebSocket retry count is bounded**
    - **Validates: Requirements 12.4**
    - File: `src/__tests__/property/useAlerts.property.test.ts`

  - [ ]* 4.3 Write unit/integration tests for `useAlerts`
    - Test mock interval fires and appends alerts
    - Test mode switch clears buffer and stops interval
    - Test unmount cleanup — no state updates after unmount
    - File: `src/__tests__/unit/useAlerts.test.ts`

- [x] 5. Implement `useThroughput`, `useBotStatus`, and `useConnectionStatus` hooks
  - [x] 5.1 Create `src/hooks/useThroughput.ts`
    - Fetch `ThroughputPoint[]` via `apiClient.fetchThroughput()` on an interval
    - Maintain rolling buffer of max 60 points — drop oldest on overflow; discard points with non-numeric `value`
    - _Requirements: 4.2, 4.3, 4.7_

  - [ ]* 5.2 Write property tests for throughput buffer
    - **Property 8: Throughput window never exceeds 60 points**
    - **Validates: Requirements 4.2, 4.3**
    - **Property 10: Invalid throughput data points are discarded**
    - **Validates: Requirements 4.7**
    - File: `src/__tests__/property/throughput.property.test.ts`

  - [x] 5.3 Create `src/hooks/useBotStatus.ts`
    - Fetch `BotStatus[]` via `apiClient.fetchBotStatuses()` on an interval; expose `bots`, `loading`, `error`
    - _Requirements: 9.6_

  - [x] 5.4 Create `src/hooks/useSearch.ts`
    - Debounce search query at 300 ms; filter alerts against `id`, `type`, `sourceIp`, `destinationIp`, `description`
    - _Requirements: 1.8_

  - [ ]* 5.5 Write property test for search filtering
    - **Property 1: Search filters by query string**
    - **Validates: Requirements 1.8**
    - File: `src/__tests__/property/search.property.test.ts`

- [x] 6. Checkpoint — ensure all hooks and API layer tests pass
  - Ensure all tests pass; ask the user if questions arise.

- [x] 7. Implement shared UI utility components
  - [x] 7.1 Create `src/components/SeverityBadge.tsx`
    - Pill-shaped label; map `Critical → bg-red-600 text-white`, `High → bg-orange-500 text-white`, `Medium → bg-amber-400 text-black`, `Low → bg-emerald-500 text-white`, unknown → `bg-gray-500 text-white`
    - Return `null` for null/undefined/empty inputs without throwing
    - Include severity text label (not color-only); add `aria-label`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 16.5_

  - [ ]* 7.2 Write property tests for `SeverityBadge`
    - **Property 14: Severity badge color is always correct**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
    - File: `src/__tests__/property/severityBadge.property.test.ts`

  - [ ]* 7.3 Write unit tests for `SeverityBadge`
    - Test each severity level renders correct Tailwind class and text
    - Test null, undefined, and empty string inputs return null
    - File: `src/__tests__/unit/SeverityBadge.test.tsx`

  - [x] 7.4 Create `src/components/ConnectionStatusBadge.tsx`
    - Show `connected / reconnecting / disconnected / replay` states with appropriate color indicators
    - `aria-label` on the badge
    - _Requirements: 1.4_

  - [x] 7.5 Create `src/components/KPICard.tsx`
    - Accept `label`, `value`, `loading`, `error`, `lastValue`
    - Framer Motion `motion.div` with `whileHover={{ scale: 1.03 }}`
    - Show skeleton on `loading`, error indicator on `error` preserving `lastValue`; fall back to 0 if no prior value
    - _Requirements: 2.1, 2.6, 2.7, 2.8, 17.3_

  - [ ]* 7.6 Write unit tests for `KPICard`
    - Test loading skeleton, error state with last value, normal render
    - File: `src/__tests__/unit/KPICard.test.tsx`

- [x] 8. Implement KPI computation utilities and property tests
  - [x] 8.1 Create `src/utils/kpiUtils.ts`
    - Export `computeTotalAlerts(alerts: Alert[]): number`
    - Export `computeCriticalAlerts(alerts: Alert[]): number`
    - Export `computeActiveBots(bots: BotStatus[]): number`
    - Export `computeCurrentThroughput(points: ThroughputPoint[]): number`
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 8.2 Write property tests for KPI utilities
    - **Property 2: Total alerts KPI reflects array length**
    - **Validates: Requirements 2.2**
    - **Property 3: Critical alerts KPI is a filtered count**
    - **Validates: Requirements 2.3**
    - **Property 4: Active bots KPI is a filtered count**
    - **Validates: Requirements 2.4**
    - **Property 5: Throughput KPI reflects last data point**
    - **Validates: Requirements 2.5**
    - File: `src/__tests__/property/kpiCards.property.test.ts`

- [x] 9. Implement `AlertsTable` component with sorting and animation
  - [x] 9.1 Create `src/components/AlertsTable.tsx`
    - Display at most 20 rows pre-sorted by timestamp descending
    - Columns: Severity (with `SeverityBadge`), Alert Type, Source IP, Destination IP, Timestamp, Status
    - Clickable column headers for Severity sort (desc: Critical→High→Medium→Low, asc reversal) and Timestamp sort
    - Row click → call `onRowClick(alertId)`
    - New rows animated with `motion.tr initial={{ y: -20, opacity: 0 }}` lasting ≤ 300 ms
    - Empty state: "No alerts detected"; error state message
    - Horizontal scroll on viewports < 1024 px
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 16.2, 17.2_

  - [x] 9.2 Create `src/utils/alertsTableUtils.ts`
    - Export `getTableAlerts(alerts: Alert[]): Alert[]` — top 20 by timestamp descending
    - Export `sortBySeverity(alerts: Alert[], direction: "asc" | "desc"): Alert[]` using severity rank map
    - Export `sortByTimestamp(alerts: Alert[], direction: "asc" | "desc"): Alert[]`
    - _Requirements: 5.1, 5.5, 5.7, 5.8_

  - [ ]* 9.3 Write property tests for `AlertsTable` utilities
    - **Property 11: Alerts table shows most recent 20, newest first**
    - **Validates: Requirements 5.1, 5.5**
    - **Property 12: Alerts table severity sort is total and correct**
    - **Validates: Requirements 5.7**
    - **Property 13: Alerts table timestamp sort preserves order**
    - **Validates: Requirements 5.8**
    - File: `src/__tests__/property/alertsTable.property.test.ts`

  - [ ]* 9.4 Write unit tests for `AlertsTable`
    - Test each column renders correctly; test row click fires callback; test empty state; test error state
    - File: `src/__tests__/unit/AlertsTable.test.tsx`

- [x] 10. Implement chart components
  - [x] 10.1 Create `src/components/ThreatClassChart.tsx`
    - Recharts `PieChart` (doughnut via `innerRadius`) consuming `alerts` prop
    - Derive category counts via grouping; omit zero-count categories
    - Apply 5-color palette (no duplicate colors across visible segments)
    - Tooltip showing category name and exact count
    - Error state message when data unavailable; no partial chart render
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 10.2 Create `src/utils/threatClassUtils.ts`
    - Export `groupAlertsByType(alerts: Alert[]): { name: string; count: number }[]` — omit zero-count categories
    - Export `getThreatClassColors(categories: string[]): string[]` — distinct color per category, no duplicates
    - _Requirements: 3.2, 3.4, 3.5_

  - [ ]* 10.3 Write property tests for threat class utilities
    - **Property 6: Threat class grouping is exhaustive and accurate**
    - **Validates: Requirements 3.2, 3.5**
    - **Property 7: Threat class colors are always distinct**
    - **Validates: Requirements 3.4**
    - File: `src/__tests__/property/threatClass.property.test.ts`

  - [ ]* 10.4 Write unit tests for `ThreatClassChart`
    - Test zero-count categories are omitted; test tooltip renders on hover; test error state
    - File: `src/__tests__/unit/ThreatClassChart.test.tsx`

  - [x] 10.5 Create `src/components/ThroughputChart.tsx`
    - Recharts `LineChart` consuming `ThroughputPoint[]` from `useThroughput`
    - X-axis tick formatter: `format(parseISO(ts), "HH:mm:ss")` from date-fns; tick interval ≤ 10 s
    - Y-axis with numeric values + unit label
    - Empty state message when no data
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

  - [x] 10.6 Create `src/utils/throughputUtils.ts`
    - Export `formatTimestamp(ts: string): string` — returns `HH:mm:ss` string
    - Export `appendThroughputPoint(buffer: ThroughputPoint[], point: ThroughputPoint): ThroughputPoint[]` — enforces 60-point cap and discards invalid numeric values
    - _Requirements: 4.2, 4.3, 4.4, 4.7_

  - [ ]* 10.7 Write property tests for throughput utilities
    - **Property 9: Timestamp formatter produces HH:mm:ss strings**
    - **Validates: Requirements 4.4**
    - File: `src/__tests__/property/throughput.property.test.ts` (extend existing file)

  - [ ]* 10.8 Write unit tests for `ThroughputChart`
    - Test empty state; test X-axis label format; test Y-axis unit label
    - File: `src/__tests__/unit/ThroughputChart.test.tsx`

- [x] 11. Checkpoint — ensure all component-level tests pass
  - Ensure all tests pass; ask the user if questions arise.

- [x] 12. Implement `EvidencePanel` and `BlockchainSection`
  - [x] 12.1 Create `src/components/EvidencePanel.tsx`
    - Accordion list of Flow rows; only one expanded at a time (`expandedFlowId: string | null`)
    - Each row: srcIp, dstIp, srcPort, dstPort, protocol, bytes, packets
    - Expanded state shows `RawPacket` metadata (frameLength, captureTimestamp) if available
    - Clicking expanded row collapses it; empty state "No evidence available"
    - Error fallback within expanded section for missing packet data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 12.2 Write property tests for `EvidencePanel`
    - **Property 16: Evidence panel renders all flow fields**
    - **Validates: Requirements 8.1**
    - **Property 17: Evidence panel accordion allows at most one open row**
    - **Validates: Requirements 8.3, 8.4**
    - File: `src/__tests__/property/evidence.property.test.ts`

  - [ ]* 12.3 Write unit tests for `EvidencePanel`
    - Test empty state; test single row expand/collapse; test packet metadata display
    - File: `src/__tests__/unit/EvidencePanel.test.tsx`

  - [x] 12.4 Create `src/components/BlockchainSection.tsx`
    - Accept `hash: string | null`, `verified: boolean`
    - Verified: monospace hash + green "Verified on-chain" badge
    - Pending: monospace hash + amber "Verification Pending" indicator
    - _Requirements: 7.4, 7.5_

- [x] 13. Implement `BotHealthPanel`
  - [x] 13.1 Create `src/components/BotHealthPanel.tsx`
    - Accept `bots: BotStatus[]`, `variant: "condensed" | "detailed"`, `loading?`, `error?`
    - Condensed: name, status indicator, detection count
    - Detailed: condensed fields + last-active timestamp + error message if `status === "error"`
    - Status indicator colors: `active → emerald`, `idle → amber`, `error → red` + error badge
    - Error state: display error message, no partial cards
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

  - [ ]* 13.2 Write property tests for `BotHealthPanel`
    - **Property 18: Bot panel renders exactly the right number of cards**
    - **Validates: Requirements 9.1, 9.2**
    - **Property 19: Bot status color mapping is always correct**
    - **Validates: Requirements 9.3, 9.4, 9.5**
    - File: `src/__tests__/property/botPanel.property.test.ts`

  - [ ]* 13.3 Write unit tests for `BotHealthPanel`
    - Test condensed vs detailed variant; test each status color; test error state; test loading skeleton
    - File: `src/__tests__/unit/BotHealthPanel.test.tsx`

- [x] 14. Implement `ChatAI` floating component
  - Create `src/components/ChatAI.tsx`
  - FAB fixed at `bottom-6 right-6`; expand/collapse chat panel with Framer Motion height + opacity animation
  - Message history with `ChatMessage` type; submit appends user message and triggers mock response after 1–2 s simulated delay
  - Mock response bank: curated cybersecurity-relevant strings (at least 10 entries)
  - Notification badge when `unreadCount > 0`; click-outside or close button collapses panel
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 17.4_

- [x] 15. Implement `Sidebar`, `Header`, and `ModeToggle`
  - [x] 15.1 Create `src/components/Sidebar.tsx`
    - Accept `collapsed: boolean`
    - Logo, nav links (Dashboard / Alerts / System Health) each with icon + text label; icons-only rail when collapsed (max-width 64 px)
    - Active link highlighted via `useMatch` with cyan accent `#22d3ee`
    - Mode indicator badge reflecting current `ModeContext` value, updating within 200 ms
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 11.5_

  - [x] 15.2 Create `src/components/ModeToggle.tsx`
    - Pill toggle with "Live" / "Replay" labels; Framer Motion `layout` animation for sliding indicator
    - Call `onChange` prop when toggled
    - _Requirements: 11.1, 11.4_

  - [x] 15.3 Create `src/components/Header.tsx`
    - Accept `connectionStatus`, `mode`, `onModeChange`, `onSearch`
    - Global search `<input>` (max 200 chars) debounced at 300 ms; render no-results indication
    - `<ConnectionStatusBadge>` + `<ModeToggle>` wired to props
    - In Replay mode show "Replay" instead of WebSocket connection state in the status badge
    - _Requirements: 1.4, 1.7, 1.8, 11.6_

  - [ ]* 15.4 Write integration tests for `ModeToggle` and `Header`
    - Test mode toggle state change and callback; test search debounce; test "Replay" label in Replay mode
    - File: `src/__tests__/integration/modeToggle.test.tsx`

- [x] 16. Implement `AppShell` layout and React Router setup
  - Create `src/components/AppShell.tsx` — CSS Grid `grid-cols-[64px_1fr]` below 1024 px, `grid-cols-[240px_1fr]` at ≥ 1024 px; renders `<Sidebar>` and the right column (`<Header>` + `<Outlet>`)
  - Create `src/router.tsx` using `createBrowserRouter` defining all four routes: `/` → `DashboardPage`, `/alerts/:id` → `AlertDetailPage`, `/system-health` → `SystemHealthPage`, `*` → `NotFoundPage`
  - Wrap routes in `<AppShell>` and `<AnimatePresence>` keyed on pathname for page transitions
  - Create `src/components/ErrorBoundary.tsx` wrapping each page component; fallback shows "Return to Dashboard" link
  - _Requirements: 1.1, 1.3, 1.5, 17.1_

- [x] 17. Implement `DashboardPage`
  - [x] 17.1 Create `src/pages/DashboardPage.tsx`
    - Wire `useAlerts`, `useThroughput`, `useBotStatus`
    - Render four `<KPICard>` components using `kpiUtils`: Total Alerts, Critical Alerts, Active Bots, Throughput
    - Render `<ThreatClassChart>`, `<ThroughputChart>`, `<BotHealthPanel variant="condensed">`, `<AlertsTable>`
    - Wire `useSearch` to Header's `onSearch` prop; pass filtered alerts to `AlertsTable` and `ThreatClassChart`
    - Row click navigates to `/alerts/:id`
    - Apply Framer Motion page entrance animation (fade + vertical slide ≤ 500 ms)
    - _Requirements: 2.1–2.8, 3.1–3.7, 4.1–4.7, 5.1–5.9_

  - [ ]* 17.2 Write property tests for DashboardPage KPI and search wiring
    - Already covered by `kpiCards.property.test.ts` and `search.property.test.ts` — verify wiring via integration render
    - File: extend `src/__tests__/integration/navigation.test.tsx`

- [x] 18. Implement `AlertDetailPage`
  - [x] 18.1 Create `src/pages/AlertDetailPage.tsx`
    - Read `:id` param via `useParams`; fetch alert with `apiClient.fetchAlert(id)`
    - Loading state: no partial render; "Alert not found" error with Dashboard link for unknown IDs
    - Render all fields: id, type, severity (`SeverityBadge`), sourceIp, destinationIp, protocol, timestamp, description
    - Render `<EvidencePanel>` and `<BlockchainSection>`
    - Back navigation button (returns to previous page via `useNavigate(-1)`)
    - Framer Motion fade-and-slide entrance ≤ 500 ms
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [ ]* 18.2 Write property tests for `AlertDetailPage`
    - **Property 15: Alert detail page renders all required fields**
    - **Validates: Requirements 7.1**
    - File: `src/__tests__/property/alertDetail.property.test.ts`

  - [ ]* 18.3 Write unit tests for `AlertDetailPage`
    - Test loading state, not-found state, all fields rendered, back button fires navigate(-1)
    - File: `src/__tests__/unit/AlertDetailPage.test.tsx`

- [x] 19. Implement `SystemHealthPage` and `NotFoundPage`
  - [x] 19.1 Create `src/pages/SystemHealthPage.tsx`
    - Fetch `SystemMetrics` via `apiClient.fetchSystemMetrics()` on an interval
    - Render `<BotHealthPanel variant="detailed">` with all six bot cards
    - Render system status cards for CPU (%), Memory (%), Network I/O (Mbps), Pipeline Latency (ms)
    - Amber highlight on CPU card when `cpuUsage > 80`, on Memory card when `memoryUsage > 85`; remove highlight within 1 s when metric drops below threshold
    - "No data" placeholder (not stale value) when metric is unavailable
    - Render `<ThroughputChart>` sharing the same 60-point rolling window
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 19.2 Write property tests for system health threshold highlighting
    - **Property 20: System health threshold highlighting is correct**
    - **Validates: Requirements 10.4, 10.5**
    - File: `src/__tests__/property/botPanel.property.test.ts` (extend existing file)

  - [x] 19.3 Create `src/pages/NotFoundPage.tsx`
    - "Page not found" message with a link back to `/`

- [x] 20. Wire application root and accessibility pass
  - Create `src/App.tsx` wrapping router with `ModeContext` provider and `<ChatAI>` FAB outside the routed shell
  - Verify all interactive elements have visible focus rings (Tailwind `focus-visible:ring-2`)
  - Verify all icon-only buttons have `aria-label` attributes
  - Verify Inter font loaded via `@fontsource/inter` (or CSS import) with `font-family: 'Inter', system-ui` — no layout shift
  - _Requirements: 1.7, 16.3, 16.4_

- [x] 21. Implement integration tests for navigation and WebSocket
  - Create `src/__tests__/integration/navigation.test.tsx` — test route transitions, row click navigates to alert detail, back button, 404 page
  - Create `src/__tests__/integration/websocket.test.ts` — mock WebSocket, test alert ingestion, mode switch buffer clear, unmount cleanup
  - _Requirements: 12.3, 12.5, 5.4_

- [x] 22. Final checkpoint — full test suite passes
  - Run `vitest --run` and ensure all unit, property, and integration tests pass
  - Fix any TypeScript compilation errors (`tsc --noEmit`)
  - Ensure all tests pass; ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- All 24 correctness properties from the design are covered by property-based test subtasks
- Each task references specific requirements for full traceability
- `fast-check` arbitraries in `src/__tests__/arbitraries.ts` are shared across all property test files
- Checkpoints (tasks 6, 11, 22) validate incremental progress before building the next layer
- Property test tagging format: `// Feature: cyber-threat-dashboard, Property {N}: {title}`

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "5.1", "5.3", "5.4"] },
    { "id": 4, "tasks": ["5.2", "5.5", "8.1", "7.1", "7.4", "7.5"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.6", "8.2"] },
    { "id": 6, "tasks": ["9.2", "10.2", "10.6", "12.4"] },
    { "id": 7, "tasks": ["9.1", "10.1", "10.5", "13.1"] },
    { "id": 8, "tasks": ["9.3", "9.4", "10.3", "10.4", "10.7", "10.8", "12.1", "13.2", "13.3"] },
    { "id": 9, "tasks": ["12.2", "12.3", "14"] },
    { "id": 10, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 11, "tasks": ["15.4", "16"] },
    { "id": 12, "tasks": ["17.1"] },
    { "id": 13, "tasks": ["17.2", "18.1", "19.1", "19.3"] },
    { "id": 14, "tasks": ["18.2", "18.3", "19.2"] },
    { "id": 15, "tasks": ["20"] },
    { "id": 16, "tasks": ["21"] }
  ]
}
```
