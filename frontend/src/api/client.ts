import type { Alert, BotHealth, Severity, SystemMode, ThroughputPoint } from "@/types/alert";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || "";
const LIVE_FEATURES_ENABLED = import.meta.env.VITE_ENABLE_LIVE_FEATURES === "true";
const ALERT_SOCKET_ENABLED = import.meta.env.VITE_ENABLE_ALERTS_SOCKET === "true";

function normalizeSeverity(value: unknown): Severity {
  const severity = String(value ?? "medium").toLowerCase();
  return ["low", "medium", "high", "critical"].includes(severity)
    ? (severity as Severity)
    : "medium";
}

function normalizeAlert(value: Record<string, unknown>): Alert {
  const threatClass = String(value.attack_type ?? value.threat_class ?? "unknown").toLowerCase();
  const botScores = value.bot_scores && typeof value.bot_scores === "object"
    ? (value.bot_scores as Record<string, unknown>)
    : {};
  return {
    id: String(value.alert_id ?? value.id ?? crypto.randomUUID()),
    created_at: String(value.created_at ?? new Date().toISOString()),
    severity: normalizeSeverity(value.severity),
    threat_classes: Array.isArray(value.threat_classes) ? value.threat_classes.map(String) : [threatClass],
    fused_score: Number(value.confidence_score ?? value.fused_score ?? 0),
    src_ip: String(value.source_ip ?? value.src_ip ?? "—"),
    dst_ip: String(value.target_ip ?? value.dst_ip ?? "—"),
    src_port: typeof value.src_port === "number" ? value.src_port : undefined,
    dst_port: typeof value.target_port === "number" ? value.target_port : undefined,
    summary: String(value.title ?? value.summary ?? value.description ?? "Threat alert"),
    bot_results: Array.isArray(value.bot_results)
      ? (value.bot_results as Alert["bot_results"])
      : Object.entries(botScores).map(([bot_id, score]) => ({
          bot_id, bot_name: threatClass, score: Number(score) || 0, confidence: Number(score) || 0,
          triggered_at: String(value.created_at ?? new Date().toISOString()),
        })),
    chain_tx_hash: typeof value.blockchain_tx_hash === "string" ? value.blockchain_tx_hash : undefined,
    chain_verified: Boolean(value.blockchain_verified ?? value.chain_verified),
  };
}

function normalizeBotHealth(value: Record<string, unknown>): BotHealth {
  const status = String(value.status ?? "offline").toLowerCase();
  return {
    bot_id: String(value.bot_id ?? value.id ?? value.bot_name ?? "unknown"),
    bot_name: String(value.bot_name ?? value.display_name ?? "unknown"),
    status: status === "healthy" || status === "online" ? "online" : status === "degraded" ? "degraded" : "offline",
    cpu_pct: Number(value.cpu_percent ?? value.cpu_pct ?? 0), mem_mb: Number(value.memory_mb ?? value.mem_mb ?? 0),
    latency_ms: Number(value.latency_ms ?? 0),
    last_seen: String(value.last_heartbeat ?? value.last_seen ?? new Date().toISOString()),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init?.method || "GET"} ${path} failed: ${res.status} ${body}`);
  }
  // Some endpoints (e.g. mode switch) may return 204
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // GET /api/alerts?limit=&severity=&threat_class=
  listAlerts: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
    return request<Record<string, unknown>[]>(`/api/alerts${qs ? `?${qs}` : ""}`).then((alerts) => alerts.map(normalizeAlert));
  },

  // GET /api/alerts/:id
  getAlert: (id: string) => request<Record<string, unknown>>(`/api/alerts/${id}`).then(normalizeAlert),

  // GET /api/bots/health
  getBotHealth: () => request<Record<string, unknown>[]>(`/api/bots/health`).then((bots) => bots.map(normalizeBotHealth)),

  // GET /api/metrics/throughput?window=60
  getThroughput: (windowSec = 300) => LIVE_FEATURES_ENABLED
    ? request<ThroughputPoint[]>(`/api/metrics/throughput?window=${windowSec}`)
    : Promise.resolve([]),

  // GET /api/mode
  getMode: () => LIVE_FEATURES_ENABLED
    ? request<{ mode: SystemMode }>(`/api/mode`)
    : Promise.resolve({ mode: "live" as SystemMode }),

  // POST /api/mode  { mode: "live" | "replay" }
  setMode: (mode: SystemMode) => LIVE_FEATURES_ENABLED
    ? request<{ mode: SystemMode }>(`/api/mode`, { method: "POST", body: JSON.stringify({ mode }) })
    : Promise.resolve({ mode }),

  // GET /api/blockchain/verify/:alertId
  verifyOnChain: (alertId: string) =>
    request<{ verified: boolean; tx_hash: string }>(`/api/blockchain/verify/${alertId}`),
};

/**
 * Opens the live alerts WebSocket (backend/app/api/routes/alerts.py).
 * Reconnects automatically with backoff; call the returned `close()` on unmount.
 */
export function connectAlertsSocket(
  onAlert: (alert: Alert) => void,
  onStatus?: (status: "connecting" | "open" | "closed") => void
) {
  if (import.meta.env.VITE_ENABLE_ALERTS_SOCKET !== "true" || !WS_BASE) {
    onStatus?.("closed");
    return { close: () => {} };
  }
  let socket: WebSocket | null = null;
  let closedByCaller = false;
  let retryDelay = 1000;

  function open() {
    if (closedByCaller) return;
    onStatus?.("connecting");
    socket = new WebSocket(`${WS_BASE}/api/alerts/ws`);

    socket.onopen = () => {
      retryDelay = 1000;
      onStatus?.("open");
    };

    socket.onmessage = (event) => {
      try {
        onAlert(normalizeAlert(JSON.parse(event.data) as Record<string, unknown>));
      } catch {
        // Ignore malformed frames rather than crashing the socket loop.
      }
    };

    socket.onclose = () => {
      onStatus?.("closed");
      if (!closedByCaller) {
        setTimeout(open, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      }
    };

    socket.onerror = () => socket?.close();
  }

  open();

  return {
    close: () => {
      closedByCaller = true;
      socket?.close();
    },
  };
}
