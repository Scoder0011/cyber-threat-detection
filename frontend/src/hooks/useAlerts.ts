// src/hooks/useAlerts.ts

import { useEffect, useRef, useCallback, useState } from "react";
import { useMode } from "./useMode";
import type { Alert, ApiError, ConnectionStatus, Severity, AlertStatus } from "../types/alert";
import { supabase, subscribeToSupabaseAlerts } from "../api/supabaseClient";

// ── Constants ─────────────────────────────────────────────────────────────

const BUFFER_CAP = 200;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5_000;
const MOCK_INTERVAL_MIN_MS = 3_000;
const MOCK_INTERVAL_MAX_MS = 5_000;
const REPLAY_INTERVAL_MS = 1_000;

// ── Mock alert generation ─────────────────────────────────────────────────

const ALERT_TEMPLATES: Omit<Alert, "id" | "timestamp">[] = [
  {
    type: "DDoS",
    severity: "Critical" as Severity,
    sourceIp: "192.168.1.100",
    destinationIp: "10.0.0.1",
    protocol: "UDP",
    description: "High-volume UDP flood targeting port 53. Suspected DNS amplification attack.",
    status: "open" as AlertStatus,
    evidence: {
      flows: [
        {
          id: "flow-t1",
          srcIp: "192.168.1.100",
          dstIp: "10.0.0.1",
          srcPort: 54321,
          dstPort: 53,
          protocol: "UDP",
          bytes: 1048576,
          packets: 10240,
          timestamp: new Date().toISOString(),
        },
      ],
      rawPackets: [],
    },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    type: "Malware",
    severity: "High" as Severity,
    sourceIp: "172.16.0.55",
    destinationIp: "203.0.113.10",
    protocol: "TCP",
    description: "Suspicious outbound connection to known C2 server. Trojan dropper behaviour detected.",
    status: "investigating" as AlertStatus,
    evidence: {
      flows: [
        {
          id: "flow-t2",
          srcIp: "172.16.0.55",
          dstIp: "203.0.113.10",
          srcPort: 49152,
          dstPort: 443,
          protocol: "TCP",
          bytes: 204800,
          packets: 320,
          timestamp: new Date().toISOString(),
        },
      ],
      rawPackets: [],
    },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    type: "Intrusion",
    severity: "Critical" as Severity,
    sourceIp: "10.10.10.200",
    destinationIp: "10.0.0.5",
    protocol: "TCP",
    description: "Brute-force SSH login attempt. Multiple failed authentication events detected.",
    status: "open" as AlertStatus,
    evidence: {
      flows: [
        {
          id: "flow-t3",
          srcIp: "10.10.10.200",
          dstIp: "10.0.0.5",
          srcPort: 45000,
          dstPort: 22,
          protocol: "TCP",
          bytes: 81920,
          packets: 2048,
          timestamp: new Date().toISOString(),
        },
      ],
      rawPackets: [],
    },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    type: "Phishing",
    severity: "Medium" as Severity,
    sourceIp: "198.51.100.42",
    destinationIp: "192.168.2.30",
    protocol: "TCP",
    description: "Email with spoofed sender domain and malicious attachment link intercepted.",
    status: "open" as AlertStatus,
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    type: "Anomaly",
    severity: "Low" as Severity,
    sourceIp: "192.168.3.77",
    destinationIp: "192.168.3.1",
    protocol: "ICMP",
    description: "Unusual ICMP traffic pattern — potential network reconnaissance or ping sweep.",
    status: "open" as AlertStatus,
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
];

let mockAlertCounter = 0;

function generateMockAlert(): Alert {
  const template = ALERT_TEMPLATES[mockAlertCounter % ALERT_TEMPLATES.length];
  mockAlertCounter += 1;
  return {
    ...template,
    id: `mock-live-${Date.now()}-${mockAlertCounter}`,
    timestamp: new Date().toISOString(),
    evidence: {
      ...template.evidence,
      flows: template.evidence.flows.map((f) => ({
        ...f,
        id: `flow-live-${Date.now()}-${mockAlertCounter}`,
        timestamp: new Date().toISOString(),
      })),
    },
  };
}

// ── Bundled historical dataset for replay mode ────────────────────────────

const REPLAY_DATASET: Alert[] = [
  {
    id: "replay-001",
    type: "DDoS",
    severity: "Critical",
    sourceIp: "192.168.10.1",
    destinationIp: "10.1.0.1",
    protocol: "UDP",
    timestamp: "2024-01-14T08:00:00.000Z",
    description: "[Replay] DNS amplification DDoS detected — peak 2.4 Gbps.",
    status: "resolved",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aa",
    blockchainVerified: true,
  },
  {
    id: "replay-002",
    type: "Malware",
    severity: "High",
    sourceIp: "172.20.0.10",
    destinationIp: "198.51.100.5",
    protocol: "TCP",
    timestamp: "2024-01-14T08:01:00.000Z",
    description: "[Replay] Ransomware C2 beacon identified. Lateral movement in progress.",
    status: "investigating",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-003",
    type: "Intrusion",
    severity: "Critical",
    sourceIp: "203.0.113.200",
    destinationIp: "10.2.0.4",
    protocol: "TCP",
    timestamp: "2024-01-14T08:02:00.000Z",
    description: "[Replay] SQL injection attempt on public-facing API gateway.",
    status: "open",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-004",
    type: "Phishing",
    severity: "Medium",
    sourceIp: "198.51.100.88",
    destinationIp: "192.168.4.20",
    protocol: "TCP",
    timestamp: "2024-01-14T08:03:00.000Z",
    description: "[Replay] Credential harvesting page linked in phishing email.",
    status: "resolved",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff11",
    blockchainVerified: true,
  },
  {
    id: "replay-005",
    type: "Anomaly",
    severity: "Low",
    sourceIp: "192.168.5.55",
    destinationIp: "192.168.5.1",
    protocol: "ICMP",
    timestamp: "2024-01-14T08:04:00.000Z",
    description: "[Replay] Slow port scan detected from internal host.",
    status: "open",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-006",
    type: "DDoS",
    severity: "High",
    sourceIp: "10.50.0.2",
    destinationIp: "10.1.0.1",
    protocol: "TCP",
    timestamp: "2024-01-14T08:05:00.000Z",
    description: "[Replay] SYN flood from internal botnet node.",
    status: "investigating",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-007",
    type: "Malware",
    severity: "Critical",
    sourceIp: "172.20.0.22",
    destinationIp: "203.0.113.100",
    protocol: "TCP",
    timestamp: "2024-01-14T08:06:00.000Z",
    description: "[Replay] Zero-day exploit payload detected in network stream.",
    status: "open",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-008",
    type: "Intrusion",
    severity: "High",
    sourceIp: "198.51.100.77",
    destinationIp: "10.3.0.9",
    protocol: "TCP",
    timestamp: "2024-01-14T08:07:00.000Z",
    description: "[Replay] RDP brute-force from external IP.",
    status: "resolved",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: "ffeeddccbbaa99887766554433221100ffeeddccbbaa99887766554433221100ff",
    blockchainVerified: true,
  },
  {
    id: "replay-009",
    type: "Phishing",
    severity: "Low",
    sourceIp: "203.0.113.55",
    destinationIp: "192.168.6.15",
    protocol: "TCP",
    timestamp: "2024-01-14T08:08:00.000Z",
    description: "[Replay] Spear phishing email targeting finance department.",
    status: "open",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: "replay-010",
    type: "Anomaly",
    severity: "Medium",
    sourceIp: "192.168.7.33",
    destinationIp: "192.168.7.1",
    protocol: "UDP",
    timestamp: "2024-01-14T08:09:00.000Z",
    description: "[Replay] Unusual DNS query volume from internal workstation.",
    status: "investigating",
    evidence: { flows: [], rawPackets: [] },
    blockchainHash: null,
    blockchainVerified: false,
  },
];

// ── Return type ───────────────────────────────────────────────────────────

export interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: ApiError | null;
  connectionStatus: ConnectionStatus;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useAlerts(): UseAlertsReturn {
  const { mode } = useMode();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // Refs for cleanup — hold mutable values without causing re-renders
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const replayIndexRef = useRef<number>(0);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const appendAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => [...prev, alert].slice(-BUFFER_CAP));
  }, []);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current !== null) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const closeWebSocket = useCallback(() => {
    if (wsRef.current !== null) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close(1000, "Intentional disconnect");
      }
      wsRef.current = null;
    }
  }, []);

  // ── Mock interval (live mode, no real backend) ───────────────────────────

  const startMockInterval = useCallback(() => {
    clearTimers();
    closeWebSocket();

    if (!mountedRef.current) return;

    setConnectionStatus("connected");
    setLoading(false);
    setError(null);

    const scheduleNext = () => {
      if (!mountedRef.current) return;
      const delay =
        MOCK_INTERVAL_MIN_MS +
        Math.random() * (MOCK_INTERVAL_MAX_MS - MOCK_INTERVAL_MIN_MS);

      // Use setTimeout instead of setInterval so each interval is random
      intervalRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        appendAlert(generateMockAlert());
        scheduleNext(); // schedule the next one
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };

    scheduleNext();
  }, [clearTimers, closeWebSocket, appendAlert]);

  // ── WebSocket (live mode, real backend) ──────────────────────────────────

  const connectWebSocket = useCallback(
    (wsUrl: string) => {
      if (!mountedRef.current) return;

      clearTimers();
      closeWebSocket();

      setConnectionStatus("reconnecting");
      setLoading(true);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        retryCountRef.current = 0;
        setConnectionStatus("connected");
        setLoading(false);
        setError(null);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;
        try {
          const alert = JSON.parse(event.data as string) as Alert;
          appendAlert(alert);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        const apiError: ApiError = {
          statusCode: 0,
          message: "WebSocket connection error",
          kind: "network",
        };
        setError(apiError);
      };

      ws.onclose = (event: CloseEvent) => {
        if (!mountedRef.current) return;
        // Code 1000 = intentional close — do not retry
        if (event.code === 1000) return;

        if (retryCountRef.current >= MAX_RETRIES) {
          setConnectionStatus("disconnected");
          setLoading(false);
          return;
        }

        retryCountRef.current += 1;
        setConnectionStatus("reconnecting");

        retryTimeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          connectWebSocket(wsUrl);
        }, RETRY_DELAY_MS);
      };
    },
    [clearTimers, closeWebSocket, appendAlert],
  );

  // ── Replay mode ───────────────────────────────────────────────────────────

  const startReplay = useCallback(() => {
    clearTimers();
    closeWebSocket();

    if (!mountedRef.current) return;

    replayIndexRef.current = 0;
    setAlerts([]);
    setConnectionStatus("replay");
    setLoading(false);
    setError(null);

    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      const idx = replayIndexRef.current;
      if (idx >= REPLAY_DATASET.length) {
        // Dataset exhausted — loop back or just stop
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        return;
      }
      appendAlert(REPLAY_DATASET[idx]);
      replayIndexRef.current += 1;
    }, REPLAY_INTERVAL_MS);
  }, [clearTimers, closeWebSocket, appendAlert]);

  // ── Effect: react to mode changes ─────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    retryCountRef.current = 0;

    if (mode === "replay") {
      startReplay();
    } else {
      // Live mode
      const wsUrlOverride = import.meta.env.VITE_WS_URL as string | undefined;
      const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
      const useMock =
        import.meta.env.VITE_USE_MOCK === "true" ||
        import.meta.env.MODE === "test";

      let unsubscribeSupabase: (() => void) | null = null;
      if (!useMock && supabase) {
        unsubscribeSupabase = subscribeToSupabaseAlerts((newAlert) => {
          if (mountedRef.current) {
            appendAlert(newAlert);
          }
        });
      }

      if (!useMock && (wsUrlOverride || baseUrl)) {
        // Convert http(s) → ws(s) or use explicit WS URL
        const wsUrl =
          wsUrlOverride ||
          baseUrl!.replace(/\/$/, "").replace(/^http/, "ws") + "/ws/alerts";
        connectWebSocket(wsUrl);
      } else if (!useMock && supabase) {
        setConnectionStatus("connected");
        setLoading(false);
      } else {
        startMockInterval();
      }

      return () => {
        // Cleanup on unmount or before next effect run (mode change)
        unsubscribeSupabase?.();
        clearTimers();
        closeWebSocket();
      };
    }
  }, [mode, connectWebSocket, startMockInterval, startReplay, clearTimers, closeWebSocket]);

  // ── Mark unmounted on component destroy ──────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { alerts, loading, error, connectionStatus };
}
