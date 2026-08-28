# Requirements Document

## Introduction

The **AI-Powered Cyber Threat Detection Dashboard** is a professional, production-ready frontend application built for the Smart India Hackathon (SIH). It provides Security Operations Center (SOC) analysts and administrators with a real-time, visually rich interface to monitor network threats, inspect individual alerts, assess the health of AI specialist bots, and review blockchain-verified forensic evidence. The system operates in two modes — **Live** (WebSocket-driven real-time ingestion) and **Replay** (historical playback) — and integrates with a FastAPI backend or falls back to deterministic mock data.

---

## Glossary

- **Dashboard**: The main overview page displaying aggregated KPI metrics, charts, and the alerts table.
- **Alert**: A detected security event produced by the AI detection engine, containing severity, type, source IP, timestamp, and evidence.
- **Alert_Detail_Page**: The dedicated page rendering full forensic information for a single Alert.
- **Bot**: An AI specialist sub-agent responsible for detecting a specific threat category (e.g., DDoS Bot, Malware Bot).
- **Bot_Health_Panel**: A UI component displaying the operational status, workload, and detection metrics of each Bot.
- **Throughput**: The rate of network flows or packets processed per second by the detection system.
- **Severity_Badge**: A color-coded pill component indicating an Alert's severity level (Critical, High, Medium, Low).
- **Evidence_Panel**: A component displaying raw network flows and packet captures associated with an Alert.
- **Blockchain_Section**: A UI section rendering the cryptographic hash and on-chain verification status of an Alert's evidence.
- **Mode_Toggle**: A UI control that switches the application between Live mode and Replay mode.
- **Chat_AI**: A floating chat interface allowing analysts to query an AI assistant about current alerts and system status.
- **Sidebar**: The persistent vertical navigation panel containing the application logo, navigation links, and mode indicator.
- **Header**: The horizontal top bar containing global search, real-time connection status, and Mode_Toggle.
- **KPI_Card**: A summary metric card displayed on the Dashboard showing a single key performance indicator.
- **Throughput_Chart**: A real-time line chart visualising Throughput over time.
- **Threat_Class_Chart**: A doughnut or bar chart visualising the distribution of alerts by threat category.
- **Alerts_Table**: A tabular component listing recent Alerts with sortable columns.
- **API_Client**: The module responsible for all data-fetching, switchable between mock data and a live FastAPI backend.
- **useAlerts**: The React hook managing Alert state, WebSocket subscription, and polling lifecycle.
- **Flow**: A single network connection record (5-tuple: src IP, dst IP, src port, dst port, protocol) contained in Evidence.
- **Live_Mode**: The operating mode where the Dashboard receives data via a live WebSocket connection.
- **Replay_Mode**: The operating mode where the Dashboard replays a historical dataset at configurable speed.
- **Connection_Status**: An indicator in the Header showing whether the WebSocket connection is active, degraded, or disconnected.

---

## Requirements

### Requirement 1: Application Shell and Navigation

**User Story:** As a SOC analyst, I want a persistent dark sidebar and top header so that I can navigate between dashboard sections without losing context.

#### Acceptance Criteria

1. THE Dashboard SHALL render a Sidebar that is fully visible and interactive at all viewport widths of 1024 px and above.
2. THE Sidebar SHALL display the application logo, navigation links (each with both an icon and a text label) for Dashboard, Alerts, and System Health pages, and the current mode indicator.
3. WHEN a user clicks a navigation link in the Sidebar, THE application SHALL complete the page-transition animation within 300 ms.
4. THE Header SHALL be displayed at the top of every page and SHALL contain a global search input (accepting up to 200 characters), a Connection_Status indicator, and the Mode_Toggle control.
5. WHEN the viewport width is below 1024 px, THE Sidebar SHALL collapse to a narrow icon-only rail with a maximum width of 64 px, hiding text labels while keeping icons visible.
6. WHEN a navigation link is the active route, THE Sidebar SHALL highlight that link using the cyan accent color (#22d3ee) and SHALL maintain that highlight for the entire duration the corresponding page is active.
7. THE application SHALL use Inter as the primary font family with system-ui as the fallback, and SHALL NOT cause a layout shift if Inter fails to load.
8. WHEN a user types into the global search input, THE Header SHALL display matching results within 500 ms and SHALL show a no-results indication when no matches are found.

---

### Requirement 2: Dashboard Page — KPI Cards

**User Story:** As a SOC analyst, I want four top-level KPI cards so that I can instantly assess system-wide threat posture at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL render exactly four KPI_Cards labeled: Total Alerts, Critical Alerts, Active Bots, and Throughput.
2. WHEN Alert data updates, THE KPI_Card for Total Alerts SHALL reflect the current count of all Alerts within 1 second.
3. WHEN Alert data updates, THE KPI_Card for Critical Alerts SHALL reflect the current count of Alerts with severity "Critical" within 1 second.
4. WHEN Bot data updates, THE KPI_Card for Active Bots SHALL reflect the current count of Bots whose status is "active" within 1 second.
5. WHEN Throughput data updates, THE KPI_Card for Throughput SHALL reflect the most recent Throughput value, expressed as a non-negative number in flows per second, within 1 second.
6. WHEN a KPI_Card is hovered, THE Dashboard SHALL apply a Framer Motion scale-up animation to that card, scaling it to between 1.02 and 1.10 of its original size.
7. IF Alert data, Bot data, or Throughput data has not yet loaded, THEN THE Dashboard SHALL display a loading skeleton placeholder inside each affected KPI_Card until data becomes available.
8. IF the data source for any KPI_Card fails to load, THEN THE Dashboard SHALL display an error indicator inside that KPI_Card and preserve the last successfully loaded value, or display zero if no value was previously loaded.

---

### Requirement 3: Dashboard Page — Threat Class Chart

**User Story:** As a SOC analyst, I want a visual breakdown of threat categories so that I can identify dominant attack types at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL render a Threat_Class_Chart as a doughnut or bar chart using the Recharts library.
2. THE Threat_Class_Chart SHALL display the count of Alerts grouped by threat category, where each category is one of: DDoS, Malware, Intrusion, Phishing, or Anomaly, and each Alert is assigned to exactly one category.
3. WHEN Alert data updates, THE Threat_Class_Chart SHALL re-render to reflect the updated category counts within 1 second.
4. THE Threat_Class_Chart SHALL assign a distinct color from the configured palette to each threat category segment such that no two visible segments share the same color.
5. IF zero Alerts exist for a category, THEN THE Threat_Class_Chart SHALL omit that category from the chart display and redistribute the remaining segments to fill the chart area.
6. WHEN a user hovers over a chart segment, THE Threat_Class_Chart SHALL display a tooltip containing the category name and the exact Alert count for that category.
7. IF Alert data is unavailable or fails to load, THEN THE Threat_Class_Chart SHALL display an error message indicating that data could not be loaded and SHALL NOT render a partial chart.

---

### Requirement 4: Dashboard Page — Throughput Chart

**User Story:** As a SOC analyst, I want a real-time line chart of network throughput so that I can detect anomalous traffic spikes.

#### Acceptance Criteria

1. THE Dashboard SHALL render a Throughput_Chart as a line chart using the Recharts library.
2. THE Throughput_Chart SHALL display Throughput data points over a rolling 60-second time window, retaining a maximum of 60 data points (one per second).
3. WHEN a new Throughput data point is received, THE Throughput_Chart SHALL append the point and drop the oldest point to maintain the 60-second window.
4. THE Throughput_Chart SHALL label the X-axis with human-readable timestamps formatted using date-fns, displaying time in HH:mm:ss format at intervals no greater than 10 seconds.
5. THE Throughput_Chart SHALL label the Y-axis with numeric throughput values and a unit label indicating the data unit (e.g., Mbps or Kbps) derived from the data source.
6. WHEN no Throughput data is available, THE Throughput_Chart SHALL display an empty state message indicating that no throughput data is currently available.
7. IF a received Throughput data point contains a null, undefined, or non-numeric value, THEN THE Throughput_Chart SHALL discard that point and retain the existing data without updating the chart.

---

### Requirement 5: Dashboard Page — Alerts Table

**User Story:** As a SOC analyst, I want a table of recent alerts with key metadata so that I can quickly triage and prioritise incidents.

#### Acceptance Criteria

1. THE Dashboard SHALL render an Alerts_Table listing the 20 most recent Alerts, ordered by Timestamp descending.
2. THE Alerts_Table SHALL display the following columns: Severity, Alert Type, Source IP, Destination IP, Timestamp, and Status.
3. THE Alerts_Table SHALL render a Severity_Badge in the Severity column for each row, where Severity is one of: Critical, High, Medium, or Low.
4. WHEN a user clicks an Alerts_Table row, THE Dashboard SHALL navigate to the Alert_Detail_Page for the selected Alert.
5. WHEN Alert data updates, THE Alerts_Table SHALL insert new rows at the top with a slide-in animation lasting no more than 300 milliseconds, and remove the oldest row if the total row count exceeds 20.
6. WHEN the Alerts_Table contains no rows, THE Alerts_Table SHALL render an empty state displaying the message "No alerts detected".
7. WHEN a user clicks the Severity column header, THE Alerts_Table SHALL sort rows in descending order of Severity (Critical → High → Medium → Low); clicking again SHALL reverse the sort order to ascending (Low → Medium → High → Critical).
8. WHEN a user clicks the Timestamp column header, THE Alerts_Table SHALL sort rows by Timestamp in descending order (newest first); clicking again SHALL reverse the sort order to ascending (oldest first).
9. IF Alert data fails to load, THEN THE Alerts_Table SHALL display an error message indicating that alert data could not be retrieved and SHALL NOT render a partial or empty table in place of the error state.

---

### Requirement 6: Severity Badge Component

**User Story:** As a SOC analyst, I want color-coded severity badges so that I can visually distinguish threat levels instantly.

#### Acceptance Criteria

1. THE Severity_Badge SHALL render as a pill-shaped label displaying the severity text.
2. WHEN the Alert severity is "Critical", THE Severity_Badge SHALL use a red background with sufficient contrast text (white or dark).
3. WHEN the Alert severity is "High", THE Severity_Badge SHALL use an orange background with sufficient contrast text.
4. WHEN the Alert severity is "Medium", THE Severity_Badge SHALL use an amber background with sufficient contrast text.
5. WHEN the Alert severity is "Low", THE Severity_Badge SHALL use an emerald background with sufficient contrast text.
6. IF an unknown severity value is provided, THEN THE Severity_Badge SHALL fall back to a neutral gray background.
7. IF a null or empty severity value is provided, THEN THE Severity_Badge SHALL render nothing (null output) without throwing an error.

---

### Requirement 7: Alert Detail Page

**User Story:** As a SOC analyst, I want a dedicated page with full forensic detail for each alert so that I can conduct in-depth incident investigation.

#### Acceptance Criteria

1. WHEN a user navigates to the Alert_Detail_Page for a given Alert ID, THE Alert_Detail_Page SHALL display the Alert's ID, type, severity, source IP, destination IP, protocol, timestamp, and description.
2. THE Alert_Detail_Page SHALL render a Severity_Badge for the Alert's severity level.
3. THE Alert_Detail_Page SHALL render an Evidence_Panel showing the associated Flows and packet metadata.
4. WHEN the Alert's blockchain verification status is "verified", THE Alert_Detail_Page SHALL render a Blockchain_Section displaying the Alert's cryptographic hash and a "Verified on-chain" badge.
5. WHEN blockchain verification status is "pending", THE Alert_Detail_Page SHALL display a "Verification Pending" indicator in the Blockchain_Section.
6. IF the Alert ID does not exist, THEN THE Alert_Detail_Page SHALL display an "Alert not found" error state with a link to navigate back to the Dashboard.
7. THE Alert_Detail_Page SHALL display a back navigation button that returns the user to the previous page.
8. WHEN the Alert_Detail_Page mounts, THE page SHALL complete its Framer Motion fade-and-slide entrance transition within 500 ms.
9. WHILE Alert data is being fetched, THE Alert_Detail_Page SHALL display a loading state and SHALL NOT render partial alert data.

---

### Requirement 8: Evidence Panel Component

**User Story:** As a forensic analyst, I want to inspect raw network flows and packet data linked to an alert so that I can reconstruct the attack sequence.

#### Acceptance Criteria

1. THE Evidence_Panel SHALL display a list of Flows associated with an Alert, showing source IP, destination IP, source port, destination port, protocol, byte count, and packet count per Flow.
2. IF raw packet metadata is available for a Flow, THEN THE Evidence_Panel SHALL display that metadata including frame length and capture timestamp.
3. WHEN a Flow row is clicked, THE Evidence_Panel SHALL expand that row to show detailed packet-level information; only one row SHALL be expanded at a time (accordion behavior).
4. WHEN an already-expanded Flow row is clicked again, THE Evidence_Panel SHALL collapse that row.
5. IF no Flows are associated with an Alert, THEN THE Evidence_Panel SHALL render a "No evidence available" empty state.
6. IF packet metadata fails to load for a Flow, THEN THE Evidence_Panel SHALL display an error message within that Flow's expanded section without affecting the rest of the panel.

---

### Requirement 9: Bot Health Panel

**User Story:** As a system administrator, I want to see the operational status of each AI specialist bot so that I can identify underperforming or failed detection agents.

#### Acceptance Criteria

1. THE Bot_Health_Panel SHALL display a card for each of the six specialist Bots: DDoS Bot, Malware Bot, Intrusion Bot, Phishing Bot, Anomaly Bot, and Coordinator Bot.
2. EACH Bot card SHALL display the Bot's name, current status (Active / Idle / Error), detection count, and last-active timestamp.
3. WHEN a Bot's status is "Active", THE Bot_Health_Panel SHALL render the status indicator using an emerald (green) color.
4. WHEN a Bot's status is "Error", THE Bot_Health_Panel SHALL render the status indicator using a red color and display an error badge.
5. WHEN a Bot's status is "Idle", THE Bot_Health_Panel SHALL render the status indicator using an amber (yellow) color.
6. WHEN Bot data updates, THE Bot_Health_Panel SHALL re-render the affected Bot card within 1 second.
7. WHEN rendered on the Dashboard page (condensed form), EACH Bot card SHALL display only the Bot's name, status indicator, and detection count.
8. WHEN rendered on the System_Health page (detailed form), EACH Bot card SHALL display the Bot's name, status indicator, detection count, last-active timestamp, and error message (if status is "Error").
9. IF Bot data fails to load, THEN THE Bot_Health_Panel SHALL display an error message and SHALL NOT render partial Bot cards.

---

### Requirement 10: System Health Page

**User Story:** As a system administrator, I want a dedicated system health page so that I can monitor all infrastructure components and pipeline metrics in one place.

#### Acceptance Criteria

1. THE System_Health page SHALL render the Bot_Health_Panel in its detailed form, displaying all six Bot cards with full field sets as defined in Requirement 9, criterion 8.
2. THE System_Health page SHALL display system status cards for CPU usage (%), memory usage (%), network I/O (Mbps), and pipeline latency (ms).
3. THE System_Health page SHALL render the Throughput_Chart showing the same rolling 60-second data window as the Dashboard.
4. WHEN CPU usage exceeds 80% or memory usage exceeds 85%, THE System_Health page SHALL highlight the corresponding status card using an amber accent color.
5. WHEN a previously highlighted status card's metric drops below its threshold, THE System_Health page SHALL remove the amber highlight from that card within 1 second.
6. IF data for a system status metric is unavailable, THEN THE System_Health page SHALL display a "No data" placeholder in the corresponding card and SHALL NOT display a stale value.

---

### Requirement 11: Mode Toggle

**User Story:** As a SOC analyst, I want to switch between Live and Replay modes so that I can investigate historical incidents without disrupting live monitoring.

#### Acceptance Criteria

1. THE Mode_Toggle SHALL render as a toggle switch in the Header with labels "Live" and "Replay".
2. WHEN Mode_Toggle is set to Live_Mode, THE useAlerts hook SHALL connect to the WebSocket data source and stream real-time Alerts.
3. WHEN Mode_Toggle is set to Replay_Mode, THE useAlerts hook SHALL disconnect from the WebSocket, clear the current Alert buffer, and begin replaying a pre-loaded historical Alert dataset.
4. THE Mode_Toggle SHALL display a visible transition animation when the mode changes.
5. THE Sidebar mode indicator SHALL update to reflect the current mode within 200 ms of the Mode_Toggle state change.
6. WHILE in Replay_Mode, THE Header Connection_Status indicator SHALL display "Replay" instead of the WebSocket connection state.

---

### Requirement 12: Real-Time Data — useAlerts Hook

**User Story:** As a SOC analyst, I want the dashboard data to update automatically so that I am always viewing the latest threat intelligence without manual refreshes.

#### Acceptance Criteria

1. THE useAlerts hook SHALL expose an array of Alerts, a loading boolean, an error value, and the current Connection_Status.
2. WHILE in Live_Mode and no real backend is available, THE useAlerts hook SHALL generate a new mock Alert every 3–5 seconds using a setInterval mechanism.
3. WHEN the API_Client is configured with a real backend URL, THE useAlerts hook SHALL connect to the FastAPI WebSocket endpoint and receive Alerts in real time.
4. IF the WebSocket connection fails, THEN THE useAlerts hook SHALL set Connection_Status to "reconnecting" and retry the connection after 5 seconds, up to a maximum of 5 retry attempts before setting Connection_Status to "disconnected".
5. WHEN the component consuming useAlerts unmounts, THE useAlerts hook SHALL terminate all active data subscriptions and timers such that no further state updates occur after unmount.
6. THE useAlerts hook SHALL maintain a maximum buffer of 200 Alerts in memory, discarding the oldest entries when the buffer is full.

---

### Requirement 13: API Client

**User Story:** As a developer, I want a switchable API client so that the frontend can operate with mock data during development and switch to the real backend without code changes.

#### Acceptance Criteria

1. THE API_Client SHALL export functions to fetch Alerts, fetch a single Alert by ID, fetch Bot statuses, and fetch Throughput metrics.
2. WHEN the environment variable `VITE_USE_MOCK` is set to "true", THE API_Client SHALL return deterministic mock data (same data for the same inputs across calls) for all functions, regardless of whether `VITE_API_BASE_URL` is set.
3. WHEN `VITE_USE_MOCK` is not "true" and the environment variable `VITE_API_BASE_URL` is defined, THE API_Client SHALL send HTTP requests to the FastAPI backend at that URL.
4. THE API_Client SHALL use the Fetch API and SHALL return typed responses matching the types defined in `types/alert.ts`.
5. IF an HTTP request returns a non-2xx status code, THEN THE API_Client SHALL throw a typed error object containing the status code and message.
6. IF a network error or request timeout (exceeding 10 seconds) occurs, THEN THE API_Client SHALL throw a typed error object describing the failure.

---

### Requirement 14: Chat With AI Component

**User Story:** As a SOC analyst, I want a floating AI chat interface so that I can ask natural-language questions about current threats without leaving the dashboard.

#### Acceptance Criteria

1. THE Chat_AI component SHALL render as a floating action button (FAB) fixed to the bottom-right corner of every page.
2. WHEN the Chat_AI FAB is clicked, THE Chat_AI component SHALL expand into a chat panel with an input field and message history using a Framer Motion expand animation.
3. WHEN the Chat_AI panel is open and the user submits a message, THE Chat_AI component SHALL append the user's message to the message history and display a mock AI response within 1–2 seconds.
4. THE Chat_AI component SHALL display mock AI responses relevant to cybersecurity topics such as threat summaries, bot statuses, and alert counts.
5. WHEN the Chat_AI panel is open and the user clicks outside the panel or clicks the close button, THE Chat_AI component SHALL collapse back to the FAB.
6. THE Chat_AI FAB SHALL display a notification badge when unread mock messages are available.

---

### Requirement 15: Data Types

**User Story:** As a developer, I want a single source of truth for all data shapes so that the frontend is type-safe and consistent.

#### Acceptance Criteria

1. THE `types/alert.ts` module SHALL export a TypeScript interface `Alert` containing at minimum: `id` (string), `type` (string), `severity` ("Critical" | "High" | "Medium" | "Low"), `sourceIp` (string), `destinationIp` (string), `protocol` (string), `timestamp` (string ISO-8601), `description` (string), `status` ("open" | "investigating" | "resolved"), `evidence` (Evidence), `blockchainHash` (string | null), and `blockchainVerified` (boolean).
2. THE `types/alert.ts` module SHALL export a TypeScript interface `BotStatus` containing at minimum: `id` (string), `name` (string), `status` ("active" | "idle" | "error"), `detectionCount` (number), `lastActive` (string ISO-8601), `errorMessage` (string | null).
3. THE `types/alert.ts` module SHALL export a TypeScript interface `Flow` containing: `id` (string), `srcIp` (string), `dstIp` (string), `srcPort` (number), `dstPort` (number), `protocol` (string), `bytes` (number), `packets` (number), `timestamp` (string ISO-8601).
4. THE `types/alert.ts` module SHALL export a TypeScript interface `Evidence` containing: `flows` (Flow[]) and `rawPackets` (RawPacket[]).
5. THE `types/alert.ts` module SHALL export a TypeScript interface `RawPacket` containing: `frameLength` (number), `captureTimestamp` (string ISO-8601), `summary` (string).

---

### Requirement 16: Responsive Layout and Accessibility

**User Story:** As a user on any device, I want the dashboard to be usable at different screen sizes so that I can monitor threats from any workstation or tablet.

#### Acceptance Criteria

1. THE Dashboard SHALL be fully functional at viewport widths of 768 px and above.
2. THE Alerts_Table SHALL horizontally scroll on viewports narrower than 1024 px rather than breaking the layout.
3. ALL interactive elements (buttons, links, toggles) SHALL have a visible focus ring for keyboard navigation.
4. ALL icon-only buttons SHALL include an `aria-label` attribute describing their action.
5. THE Severity_Badge SHALL display the severity text label in addition to the color indicator so that color is not the sole differentiator of severity.

---

### Requirement 17: Page Transitions and Animations

**User Story:** As a user, I want smooth animated transitions so that the interface feels polished and professional.

#### Acceptance Criteria

1. WHEN the user navigates between pages, THE application SHALL animate the outgoing page out and the incoming page in using Framer Motion with a fade and vertical slide effect.
2. WHEN a new Alert is added to the Alerts_Table, THE row SHALL animate in using a Framer Motion slide-down and fade-in effect.
3. WHEN a KPI_Card is hovered, THE card SHALL animate using a Framer Motion scale transform (scale to 1.03).
4. WHEN the Chat_AI panel opens or closes, THE panel SHALL animate using a Framer Motion height and opacity transition.
5. THE application SHALL use a consistent animation duration of 200–350 ms for all UI transitions to maintain a premium feel without feeling sluggish.
