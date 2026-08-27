# ThreatLens — Frontend

React + TypeScript + Vite + Tailwind dashboard for the AI-Powered Cyber Threat Detection System.

## Setup

```bash
npm install
cp .env.example .env       # point at your live backend
npm run dev                # http://localhost:5173
```

`.env`:
```
VITE_API_BASE_URL=http://localhost:8000   # your FastAPI backend
VITE_WS_BASE_URL=ws://localhost:8000
```

## Backend endpoints this expects

These map directly to `backend/app/api/routes/` in the main repo — adjust
`src/api/client.ts` if your Person 1 (backend) names anything differently.

| Method | Path | Used by |
|---|---|---|
| GET | `/api/alerts?limit=100` | initial alert history |
| WS  | `/api/alerts/ws` | live fused-alert stream |
| GET | `/api/alerts/:id` | AlertDetail page |
| GET | `/api/bots/health` | BotHealthPanel (polls every 5s) |
| GET | `/api/metrics/throughput?window=300` | ThroughputChart (polls every 3s) |
| GET | `/api/mode` / POST `/api/mode` | live/replay ModeToggle |
| GET | `/api/blockchain/verify/:alertId` | on-chain verification button |
| POST | `/api/chat` | ChatWithAI panel (LLM analyst) |

If a route name differs on the backend, it's a one-line change in
`src/api/client.ts` — everything else consumes typed data from there.

## Structure

```
src/
  api/client.ts          # REST + reconnecting WebSocket client
  hooks/useAlerts.ts      # initial fetch + live stream, capped ring buffer
  types/alert.ts          # mirrors backend Pydantic schemas
  components/             # AlertsTable, SeverityBadge, BotHealthPanel,
                           # ModeToggle, EvidencePanel, ChatWithAI, FusionTicker
  charts/                 # ThroughputChart, ThreatClassChart (recharts)
  pages/                  # Dashboard, AlertDetail, SystemHealth
```

## Design notes

Dark "fusion console" theme (`tailwind.config.ts` holds all tokens: void/panel/
hairline/signal colors). The **Fusion Ticker** at the top of the dashboard is
the signature element — it's a literal readout of score fusion: each fused
alert renders as a bar sized by `fused_score`, with small ticks beneath it
showing the individual bot scores the controller correlated to produce it.

Severity colors: critical `#FF5C5C`, high `#FF9F43`, medium `#F5D547`,
low/benign `#4FD1C5`, flow/network accent `#5B8DEF`.

## Next steps to wire up fully

- Confirm the exact WebSocket message shape from `alerts.py` matches `Alert`
  in `src/types/alert.ts` — adjust the type if fields differ.
- If auth is added to the backend, extend `request()` in `client.ts` to attach
  a token header.
- `ChatWithAI` currently expects `POST /api/chat { message } -> { reply }` —
  update the path once Person 1 finalizes the LLM route.