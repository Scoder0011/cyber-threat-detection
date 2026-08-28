# Design Document — AI-Powered Cyber Threat Detection Dashboard

## Overview

The **Cyber Threat Detection Dashboard** is a production-grade React/TypeScript single-page application designed for Smart India Hackathon (SIH). It gives Security Operations Center (SOC) analysts and administrators a real-time, visually rich window into network threat activity, AI bot health, and blockchain-anchored forensic evidence.

The frontend is entirely self-contained: it can run against a live FastAPI backend over WebSocket/HTTP, or operate in a fully deterministic mock mode suitable for development and demos — switched via environment variables with no code changes required.

### Goals

- Real-time threat visibility with sub-1-second data freshness
- Immersive dark-theme interface with fluid Framer Motion animations
- Zero-downtime mode switching between Live and Replay
- Type-safe, tree-shaken, production-ready build via Vite
- Accessible at WCAG AA level with keyboard navigation and ARIA labels

### Technology Stack

| Concern | Library |
|---|---|
| UI framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 (dark theme, cyan accent `#22d3ee`) |
| Charts | Recharts 2 |
| Animations | Framer Motion 11 |
| Routing | React Router v6 |
| Date formatting | date-fns 3 |
| HTTP / WebSocket | Native Fetch API + native WebSocket |
| State management | React Context + custom hooks (no Redux) |
| Testing | Vitest + React Testing Library + fast-check (PBT) |

---

## Architecture

The application follows a **layered architecture** that separates data concerns from presentation concerns:

```
┌─────────────────────────────────────────────────────┐
│                   Pages (Routes)                    │
│  DashboardPage │ AlertDetailPage │ SystemHealthPage  │
└────────────────────┬────────────────────────────────┘
                     │ consumes
┌────────────────────▼────────────────────────────────┐
│                Feature Components                   │
│  KPICard │ AlertsTable │ ThreatClassChart │          │
│  ThroughputChart │ BotHealthPanel │ EvidencePanel │  │
│  BlockchainSection │ ChatAI │ SeverityBadge │        │
│  Sidebar │ Header │ ModeToggle                       │
└────────────────────┬────────────────────────────────┘
                     │ consumes
┌────────────────────▼────────────────────────────────┐
│              Hooks / State Layer                    │
│  useAlerts │ useBotStatus │ useThroughput │          │
│  useMode │ useSearch │ useConnectionStatus           │
└────────────────────┬────────────────────────────────┘
                     │ calls
┌────────────────────▼────────────────────────────────┐
│                  API Client                         │
│  apiClient.ts — mock or live, switched by env vars  │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
WebSocket / setInterval (mock)
       │
       ▼
 useAlerts hook ──── buffers up to 200 alerts
       │                      │
       ▼                      ▼
 AlertsTable            KPI Cards
 ThreatClassChart       ThroughputChart
```

### Routing

React Router v6 with `createBrowserRouter`:

| Path | Page Component | Notes |
|---|---|---|
| `/` | `DashboardPage` | Default route |
| `/alerts/:id` | `AlertDetailPage` | Dynamic segment |
| `/system-health` | `SystemHealthPage` | |
| `*` | `NotFoundPage` | Catch-all |

All routes are wrapped inside `<AppShell>` which renders the persistent `<Sidebar>` and `<Header>`. Page transitions are animated with Framer Motion `<AnimatePresence>` keyed on the route pathname.

### Mode Architecture

The application operates in two modes controlled by a `ModeContext`:

```
ModeContext
  ├── mode: "live" | "replay"
  ├── setMode: (mode) => void
  └── provided at root level — consumed by useAlerts and Header/Sidebar
```

`useAlerts` listens to `ModeContext`. On transition to `live` it opens a WebSocket (or starts mock interval); on transition to `replay` it disconnects, clears the buffer, and begins replaying a bundled historical dataset via a configurable timer.

---

## Components and Interfaces

### AppShell

Renders the two-column layout: `<Sidebar>` on the left and a right column containing `<Header>` on top and the `<Outlet>` (routed page) below. No data fetching — pure layout.

```
Props: none
Layout: CSS Grid — `grid-cols-[64px_1fr]` at <1024px, `grid-cols-[240px_1fr]` at ≥1024px
```

### Sidebar

```typescript
interface SidebarProps {
  collapsed: boolean; // true when viewport < 1024px
}
```

Renders: logo, nav links (Dashboard / Alerts / System Health), mode indicator badge.  
Active link detection via `useMatch` from React Router.  
Collapsed state hides text labels — icons remain visible (icon-only rail, max-width 64px).

### Header

```typescript
interface HeaderProps {
  connectionStatus: ConnectionStatus;
  mode: "live" | "replay";
  onModeChange: (mode: "live" | "replay") => void;
  onSearch: (query: string) => void;
}
```

Contains: global search `<input>` (max 200 chars), `<ConnectionStatusBadge>`, `<ModeToggle>`.  
Search debounced at 300ms to stay inside the 500ms SLA defined in Req 1.8.

### ModeToggle

```typescript
interface ModeToggleProps {
  value: "live" | "replay";
  onChange: (mode: "live" | "replay") => void;
}
```

Renders as a pill toggle switch. Uses Framer Motion `layout` animation for the sliding indicator.

### KPICard

```typescript
interface KPICardProps {
  label: string;
  value: number | string;
  loading?: boolean;
  error?: boolean;
  lastValue?: number | string;
}
```

Animated with `motion.div` and `whileHover={{ scale: 1.03 }}`. Shows skeleton when `loading=true`, error indicator when `error=true` (preserves `lastValue`).

### AlertsTable

```typescript
interface AlertsTableProps {
  alerts: Alert[];
  loading?: boolean;
  error?: boolean;
  onRowClick: (alertId: string) => void;
}
```

Displays up to 20 rows, pre-sorted. Columns: Severity, Alert Type, Source IP, Destination IP, Timestamp, Status. Severity column renders `<SeverityBadge>`. Sort state managed locally. New rows animated with `motion.tr` `initial={{ y: -20, opacity: 0 }}`.

### SeverityBadge

```typescript
interface SeverityBadgeProps {
  severity: "Critical" | "High" | "Medium" | "Low" | string | null | undefined;
}
```

Pure presentational. Returns `null` for null/undefined/empty inputs. Color mapping:

| Severity | Tailwind class |
|---|---|
| Critical | `bg-red-600 text-white` |
| High | `bg-orange-500 text-white` |
| Medium | `bg-amber-400 text-black` |
| Low | `bg-emerald-500 text-white` |
| Unknown | `bg-gray-500 text-white` |

### ThreatClassChart

```typescript
interface ThreatClassChartProps {
  alerts: Alert[];
  loading?: boolean;
  error?: boolean;
}
```

Derives chart data by grouping alerts by `type`. Renders Recharts `<PieChart>` (doughnut via `innerRadius`). Only categories with count > 0 are included. Color palette: 5 distinct colors mapped to DDoS, Malware, Intrusion, Phishing, Anomaly.

### ThroughputChart

```typescript
interface ThroughputChartProps {
  dataPoints: ThroughputPoint[];
  unit?: string;
}

interface ThroughputPoint {
  timestamp: string; // ISO-8601
  value: number;
}
```

Renders Recharts `<LineChart>`. Rolling window of 60 data points maintained by `useThroughput` hook. X-axis tick formatter uses `date-fns` `format(parseISO(ts), "HH:mm:ss")`.

### BotHealthPanel

```typescript
interface BotHealthPanelProps {
  bots: BotStatus[];
  variant: "condensed" | "detailed";
  loading?: boolean;
  error?: boolean;
}
```

`condensed`: name, status indicator, detection count.  
`detailed`: all condensed fields + last-active timestamp + error message (if status=error).

Status indicator color mapping: `active → emerald`, `idle → amber`, `error → red` + error badge.

### EvidencePanel

```typescript
interface EvidencePanelProps {
  evidence: Evidence;
}
```

Accordion list of Flow rows. Only one row expanded at a time (controlled by `expandedFlowId: string | null`). Each row: src/dst IP, ports, protocol, bytes, packets. Expanded state shows raw packet metadata if available.

### BlockchainSection

```typescript
interface BlockchainSectionProps {
  hash: string | null;
  verified: boolean;
}
```

Shows hash as monospace text. Verified state renders a green "Verified on-chain" badge. Pending state renders an amber "Verification Pending" indicator.

### ChatAI

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
```

FAB fixed at `bottom-6 right-6`. Expands into a chat panel via Framer Motion height/opacity animation. Mock AI responses are randomly selected from a curated bank of cybersecurity-relevant strings, delivered after a 1–2 second simulated delay. Notification badge appears when unread mock messages are available (tracked by `unreadCount: number`).

---

## Data Models

All data types live in `src/types/alert.ts` — the single source of truth.

```typescript
// src/types/alert.ts

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type AlertStatus = "open" | "investigating" | "resolved";
export type BotStatusValue = "active" | "idle" | "error";
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected" | "replay";
export type AppMode = "live" | "replay";

export interface RawPacket {
  frameLength: number;
  captureTimestamp: string; // ISO-8601
  summary: string;
}

export interface Flow {
  id: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  timestamp: string; // ISO-8601
}

export interface Evidence {
  flows: Flow[];
  rawPackets: RawPacket[];
}

export interface Alert {
  id: string;
  type: string;                    // "DDoS" | "Malware" | "Intrusion" | "Phishing" | "Anomaly"
  severity: Severity;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  timestamp: string;               // ISO-8601
  description: string;
  status: AlertStatus;
  evidence: Evidence;
  blockchainHash: string | null;
  blockchainVerified: boolean;
}

export interface BotStatus {
  id: string;
  name: string;
  status: BotStatusValue;
  detectionCount: number;
  lastActive: string;              // ISO-8601
  errorMessage: string | null;
}

export interface ThroughputPoint {
  timestamp: string;               // ISO-8601
  value: number;                   // flows per second
  unit: string;                    // e.g. "Kbps", "Mbps"
}

export interface SystemMetrics {
  cpuUsage: number;                // percentage 0-100
  memoryUsage: number;             // percentage 0-100
  networkIo: number;               // Mbps
  pipelineLatency: number;         // ms
}

export interface ApiError {
  statusCode: number;
  message: string;
  kind: "http" | "network" | "timeout";
}
```

### API Client Interface

```typescript
// src/api/apiClient.ts

export interface ApiClient {
  fetchAlerts(): Promise<Alert[]>;
  fetchAlert(id: string): Promise<Alert>;
  fetchBotStatuses(): Promise<BotStatus[]>;
  fetchThroughput(): Promise<ThroughputPoint[]>;
  fetchSystemMetrics(): Promise<SystemMetrics>;
}
```

Mock mode (`VITE_USE_MOCK=true`) returns seeded deterministic data — the same seed produces the same alert array on repeated calls. Live mode sends requests to `VITE_API_BASE_URL` using the native Fetch API, throws `ApiError` on non-2xx or timeout (10s).

### useAlerts Hook Interface

```typescript
interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: ApiError | null;
  connectionStatus: ConnectionStatus;
}

function useAlerts(): UseAlertsReturn;
```

Internal state machine:

```
         ┌─────── live mode ───────┐
         │                         │
  idle ──► connecting ──► connected ──► reconnecting (on failure)
                                           │
                                    (5 retries max)
                                           │
                                     disconnected
```

Buffer management: maintains `alerts` array capped at 200. On overflow, slices from the front (oldest removed).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Search filters by query string

*For any* array of alerts and any non-empty search query string, every alert returned by the search function must contain the query string in at least one of its searchable text fields (id, type, sourceIp, destinationIp, description).

**Validates: Requirements 1.8**

---

### Property 2: Total alerts KPI reflects array length

*For any* array of alerts, the value computed for the "Total Alerts" KPI must equal the length of that array.

**Validates: Requirements 2.2**

---

### Property 3: Critical alerts KPI is a filtered count

*For any* array of alerts, the value computed for the "Critical Alerts" KPI must equal the count of alerts whose severity field equals `"Critical"`.

**Validates: Requirements 2.3**

---

### Property 4: Active bots KPI is a filtered count

*For any* array of BotStatus objects, the value computed for the "Active Bots" KPI must equal the count of bots whose status field equals `"active"`.

**Validates: Requirements 2.4**

---

### Property 5: Throughput KPI reflects last data point

*For any* non-empty array of ThroughputPoint objects, the value displayed in the "Throughput" KPI must equal the value of the last element in that array.

**Validates: Requirements 2.5**

---

### Property 6: Threat class grouping is exhaustive and accurate

*For any* array of alerts, the chart grouping function must produce category counts that (a) sum to the total number of alerts, (b) include no categories with zero count, and (c) assign each alert to exactly one category.

**Validates: Requirements 3.2, 3.5**

---

### Property 7: Threat class colors are always distinct

*For any* non-empty subset of the five threat categories {DDoS, Malware, Intrusion, Phishing, Anomaly}, the color palette function must return a set of colors with no duplicates.

**Validates: Requirements 3.4**

---

### Property 8: Throughput window never exceeds 60 points

*For any* sequence of ThroughputPoint objects appended to the chart buffer, the resulting buffer must contain at most 60 items, and when the sequence length exceeds 60, the retained items are the most recent 60 in arrival order.

**Validates: Requirements 4.2, 4.3**

---

### Property 9: Timestamp formatter produces HH:mm:ss strings

*For any* valid ISO-8601 timestamp string, the X-axis tick formatter must return a string matching the regular expression `^\d{2}:\d{2}:\d{2}$`.

**Validates: Requirements 4.4**

---

### Property 10: Invalid throughput data points are discarded

*For any* ThroughputPoint whose value is null, undefined, NaN, or not of type number, the validation function must return false (the point is excluded from the buffer).

**Validates: Requirements 4.7**

---

### Property 11: Alerts table shows most recent 20, newest first

*For any* array of alerts, the table data function must return at most 20 items, ordered by timestamp descending (newest first), and the returned items are a subset of the 20 most recently timestamped alerts in the input array.

**Validates: Requirements 5.1, 5.5**

---

### Property 12: Alerts table severity sort is total and correct

*For any* array of alerts, sorting by severity descending must produce an ordering where Critical precedes High, High precedes Medium, and Medium precedes Low — and reversing the sort produces the opposite ordering.

**Validates: Requirements 5.7**

---

### Property 13: Alerts table timestamp sort preserves order

*For any* array of alerts with distinct timestamps, sorting by timestamp descending must produce a sequence where each element's timestamp is greater than or equal to the next element's timestamp.

**Validates: Requirements 5.8**

---

### Property 14: Severity badge color is always correct

*For any* severity value in `{Critical, High, Medium, Low}`, the SeverityBadge component must apply the corresponding color class, and for any value outside this set, it must apply the fallback gray class. For null or undefined inputs, the component must return null without throwing.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

---

### Property 15: Alert detail page renders all required fields

*For any* valid Alert object, the rendered AlertDetailPage must contain the alert's id, type, severity, sourceIp, destinationIp, protocol, timestamp, and description within the DOM.

**Validates: Requirements 7.1**

---

### Property 16: Evidence panel renders all flow fields

*For any* array of Flow objects, the rendered EvidencePanel must include each flow's srcIp, dstIp, srcPort, dstPort, protocol, bytes, and packets.

**Validates: Requirements 8.1**

---

### Property 17: Evidence panel accordion allows at most one open row

*For any* array of flows and any sequence of row-click interactions, at most one flow row must be in the expanded state at any point in time.

**Validates: Requirements 8.3, 8.4**

---

### Property 18: Bot panel renders exactly the right number of cards

*For any* array of BotStatus objects, the BotHealthPanel must render exactly as many cards as there are elements in the array, with each card containing the bot's name and status.

**Validates: Requirements 9.1, 9.2**

---

### Property 19: Bot status color mapping is always correct

*For any* BotStatus object, the status indicator must use emerald for `"active"`, amber for `"idle"`, and red for `"error"`.

**Validates: Requirements 9.3, 9.4, 9.5**

---

### Property 20: System health threshold highlighting is correct

*For any* SystemMetrics snapshot, CPU usage > 80% or memory usage > 85% must produce amber highlighting on the corresponding card; values at or below the threshold must produce no amber highlighting.

**Validates: Requirements 10.4, 10.5**

---

### Property 21: useAlerts buffer never exceeds 200 items

*For any* sequence of alerts appended to the useAlerts buffer, the resulting buffer must contain at most 200 items, and when the sequence exceeds 200, the oldest items are discarded.

**Validates: Requirements 12.6**

---

### Property 22: WebSocket retry count is bounded

*For any* sequence of consecutive WebSocket connection failures, the hook must attempt reconnection at most 5 times before setting connectionStatus to `"disconnected"` and stopping retries.

**Validates: Requirements 12.4**

---

### Property 23: Mock API client is deterministic

*For any* set of API function inputs, calling any API client function with `VITE_USE_MOCK=true` must return the same result on repeated calls — same inputs always produce same outputs.

**Validates: Requirements 13.2**

---

### Property 24: API client throws typed errors for non-2xx responses

*For any* HTTP status code in the 4xx or 5xx range, the API client must throw an `ApiError` object containing that status code and a non-empty message string.

**Validates: Requirements 13.5, 13.6**

---

## Error Handling

### Error Boundaries

A React Error Boundary wraps each page component. If a page-level render error occurs, the boundary catches it and displays a full-page error fallback with a "Return to Dashboard" link — preventing a complete app crash.

Individual chart and panel components handle their own error states locally (no page-level crash from data errors).

### Data Loading States

Each data-fetching hook exposes `loading: boolean` and `error: ApiError | null`. Components follow this state precedence:

1. `loading === true` → render skeleton/spinner
2. `error !== null` → render error state, preserve last valid value if available
3. Otherwise → render data

### WebSocket Failure Recovery

```
connection attempt
    │
  success ────► connected state
    │
  failure
    │
  retry delay (5s)
    │
  [repeat up to 5 times]
    │
  5th failure ────► "disconnected" state, stop retrying
```

The user sees the Connection_Status badge update from `"reconnecting"` to `"disconnected"` after exhausting retries.

### API Error Types

```typescript
// Thrown by apiClient on any non-2xx or network failure
interface ApiError {
  statusCode: number;   // HTTP status; 0 for network/timeout errors
  message: string;
  kind: "http" | "network" | "timeout";
}
```

All components that call API functions catch errors and store them in local state — they never propagate unhandled promise rejections.

### Invalid Data Guards

- Throughput points with non-numeric values are silently discarded before appending to the buffer.
- SeverityBadge returns `null` for null/undefined/empty inputs.
- AlertsTable renders an empty state for an empty array.
- EvidencePanel renders an empty state when `evidence.flows` is empty.

---

## Testing Strategy

### Overview

The project uses a **dual testing approach**: example-based tests for specific scenarios and property-based tests for universal invariants. Both are complementary — unit tests catch concrete bugs, property tests verify general correctness across the input space.

**Test runner**: Vitest (compatible with Vite, fast HMR-friendly test execution)  
**Component testing**: React Testing Library  
**Property-based testing**: [fast-check](https://fast-check.dev/) — a mature TypeScript-first PBT library  
**Minimum PBT iterations**: 100 per property (fast-check default)

### Directory Structure

```
src/
  __tests__/
    unit/
      SeverityBadge.test.tsx
      AlertsTable.test.tsx
      EvidencePanel.test.tsx
      BotHealthPanel.test.tsx
      ThreatClassChart.test.tsx
      ThroughputChart.test.tsx
      apiClient.test.ts
      useAlerts.test.ts
    property/
      search.property.test.ts        # Property 1
      kpiCards.property.test.ts      # Properties 2-5
      threatClass.property.test.ts   # Properties 6-7
      throughput.property.test.ts    # Properties 8-10
      alertsTable.property.test.ts   # Properties 11-13
      severityBadge.property.test.ts # Property 14
      alertDetail.property.test.ts   # Property 15
      evidence.property.test.ts      # Properties 16-17
      botPanel.property.test.ts      # Properties 18-20
      useAlerts.property.test.ts     # Properties 21-22
      apiClient.property.test.ts     # Properties 23-24
    integration/
      modeToggle.test.tsx
      navigation.test.tsx
      websocket.test.ts
```

### Property-Based Test Configuration

Each property test must include a tag comment referencing the design property:

```typescript
// Feature: cyber-threat-dashboard, Property 2: Total alerts KPI reflects array length
fc.assert(
  fc.property(fc.array(alertArbitrary), (alerts) => {
    expect(computeTotalAlerts(alerts)).toBe(alerts.length);
  }),
  { numRuns: 100 }
);
```

### Arbitraries (fast-check generators)

```typescript
// Shared arbitraries in src/__tests__/arbitraries.ts

const severityArbitrary = fc.constantFrom("Critical", "High", "Medium", "Low");
const alertStatusArbitrary = fc.constantFrom("open", "investigating", "resolved");
const botStatusArbitrary = fc.constantFrom("active", "idle", "error");
const isoTimestampArbitrary = fc.date().map(d => d.toISOString());

const flowArbitrary: fc.Arbitrary<Flow> = fc.record({
  id: fc.uuid(),
  srcIp: fc.ipV4(),
  dstIp: fc.ipV4(),
  srcPort: fc.integer({ min: 1, max: 65535 }),
  dstPort: fc.integer({ min: 1, max: 65535 }),
  protocol: fc.constantFrom("TCP", "UDP", "ICMP"),
  bytes: fc.nat(),
  packets: fc.nat(),
  timestamp: isoTimestampArbitrary,
});

const alertArbitrary: fc.Arbitrary<Alert> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom("DDoS", "Malware", "Intrusion", "Phishing", "Anomaly"),
  severity: severityArbitrary,
  sourceIp: fc.ipV4(),
  destinationIp: fc.ipV4(),
  protocol: fc.constantFrom("TCP", "UDP", "ICMP"),
  timestamp: isoTimestampArbitrary,
  description: fc.string({ minLength: 1 }),
  status: alertStatusArbitrary,
  evidence: fc.record({ flows: fc.array(flowArbitrary), rawPackets: fc.array(rawPacketArbitrary) }),
  blockchainHash: fc.option(fc.hexaString({ minLength: 64, maxLength: 64 })),
  blockchainVerified: fc.boolean(),
});

const botStatusArbitraryRecord: fc.Arbitrary<BotStatus> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  status: botStatusArbitrary,
  detectionCount: fc.nat(),
  lastActive: isoTimestampArbitrary,
  errorMessage: fc.option(fc.string()),
});

const throughputPointArbitrary: fc.Arbitrary<ThroughputPoint> = fc.record({
  timestamp: isoTimestampArbitrary,
  value: fc.float({ min: 0 }),
  unit: fc.constantFrom("Kbps", "Mbps"),
});
```

### Unit Testing Approach

Unit tests cover:
- Specific rendering scenarios (loading state, error state, empty state, each severity level)
- Navigation (row click → route change)
- Bot card condensed vs detailed mode
- Blockchain section verified vs pending vs absent
- Chat AI open/close/submit
- Mode toggle state changes

### Integration Testing Approach

Integration tests cover:
- WebSocket mock setup and message ingestion in `useAlerts`
- Mock API client returning deterministic data
- Mode switching clearing the alert buffer
- Component unmount cleanup (no memory leaks / state updates after unmount)

### Accessibility Testing

- All interactive elements must pass automated axe-core accessibility checks
- Manual verification required for focus order, screen reader announcements (ARIA live regions for real-time updates), and color contrast

### Property Test Tagging Format

```
Feature: cyber-threat-dashboard, Property {N}: {property title}
```

Example:
```typescript
// Feature: cyber-threat-dashboard, Property 8: Throughput window never exceeds 60 points
```
