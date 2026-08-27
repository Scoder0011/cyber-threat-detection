// src/api/apiClient.ts — switchable API client (mock or live FastAPI backend)

import type {
  Alert,
  BotStatus,
  ThroughputPoint,
  SystemMetrics,
  ApiError,
} from '../types/alert';

// ── Public interface ──────────────────────────────────────────────────────

export interface ApiClient {
  fetchAlerts(): Promise<Alert[]>;
  fetchAlert(id: string): Promise<Alert>;
  fetchBotStatuses(): Promise<BotStatus[]>;
  fetchThroughput(): Promise<ThroughputPoint[]>;
  fetchSystemMetrics(): Promise<SystemMetrics>;
}

// ── Mock data (deterministic — fixed arrays, no randomness) ──────────────

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    type: 'DDoS',
    severity: 'Critical',
    sourceIp: '192.168.1.100',
    destinationIp: '10.0.0.1',
    protocol: 'UDP',
    timestamp: '2024-01-15T10:23:45.000Z',
    description: 'High-volume UDP flood targeting port 53. Suspected DNS amplification attack.',
    status: 'open',
    evidence: {
      flows: [
        {
          id: 'flow-001',
          srcIp: '192.168.1.100',
          dstIp: '10.0.0.1',
          srcPort: 54321,
          dstPort: 53,
          protocol: 'UDP',
          bytes: 1048576,
          packets: 10240,
          timestamp: '2024-01-15T10:23:45.000Z',
        },
        {
          id: 'flow-002',
          srcIp: '192.168.1.101',
          dstIp: '10.0.0.1',
          srcPort: 60001,
          dstPort: 53,
          protocol: 'UDP',
          bytes: 524288,
          packets: 5120,
          timestamp: '2024-01-15T10:23:46.000Z',
        },
      ],
      rawPackets: [
        {
          frameLength: 512,
          captureTimestamp: '2024-01-15T10:23:45.123Z',
          summary: 'UDP 192.168.1.100:54321 → 10.0.0.1:53 len=512',
        },
      ],
    },
    blockchainHash: 'a3f2c1e9d8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1',
    blockchainVerified: true,
  },
  {
    id: 'alert-002',
    type: 'Malware',
    severity: 'High',
    sourceIp: '172.16.0.55',
    destinationIp: '203.0.113.10',
    protocol: 'TCP',
    timestamp: '2024-01-15T10:18:30.000Z',
    description: 'Suspicious outbound connection to known C2 server. Trojan dropper behaviour detected.',
    status: 'investigating',
    evidence: {
      flows: [
        {
          id: 'flow-003',
          srcIp: '172.16.0.55',
          dstIp: '203.0.113.10',
          srcPort: 49152,
          dstPort: 443,
          protocol: 'TCP',
          bytes: 204800,
          packets: 320,
          timestamp: '2024-01-15T10:18:30.000Z',
        },
      ],
      rawPackets: [
        {
          frameLength: 1500,
          captureTimestamp: '2024-01-15T10:18:30.500Z',
          summary: 'TCP 172.16.0.55:49152 → 203.0.113.10:443 [SYN]',
        },
      ],
    },
    blockchainHash: 'b4e3d2c1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3',
    blockchainVerified: false,
  },
  {
    id: 'alert-003',
    type: 'Intrusion',
    severity: 'Critical',
    sourceIp: '10.10.10.200',
    destinationIp: '10.0.0.5',
    protocol: 'TCP',
    timestamp: '2024-01-15T10:15:00.000Z',
    description: 'Brute-force SSH login attempt. 2048 failed authentication events in 60 seconds.',
    status: 'open',
    evidence: {
      flows: [
        {
          id: 'flow-004',
          srcIp: '10.10.10.200',
          dstIp: '10.0.0.5',
          srcPort: 45000,
          dstPort: 22,
          protocol: 'TCP',
          bytes: 81920,
          packets: 2048,
          timestamp: '2024-01-15T10:15:00.000Z',
        },
      ],
      rawPackets: [],
    },
    blockchainHash: null,
    blockchainVerified: false,
  },
  {
    id: 'alert-004',
    type: 'Phishing',
    severity: 'Medium',
    sourceIp: '198.51.100.42',
    destinationIp: '192.168.2.30',
    protocol: 'TCP',
    timestamp: '2024-01-15T10:10:22.000Z',
    description: 'Email with spoofed sender domain and malicious attachment link intercepted.',
    status: 'resolved',
    evidence: {
      flows: [
        {
          id: 'flow-005',
          srcIp: '198.51.100.42',
          dstIp: '192.168.2.30',
          srcPort: 25,
          dstPort: 49200,
          protocol: 'TCP',
          bytes: 8192,
          packets: 16,
          timestamp: '2024-01-15T10:10:22.000Z',
        },
      ],
      rawPackets: [
        {
          frameLength: 1024,
          captureTimestamp: '2024-01-15T10:10:22.200Z',
          summary: 'SMTP 198.51.100.42:25 → 192.168.2.30:49200 DATA',
        },
      ],
    },
    blockchainHash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    blockchainVerified: true,
  },
  {
    id: 'alert-005',
    type: 'Anomaly',
    severity: 'Low',
    sourceIp: '192.168.3.77',
    destinationIp: '192.168.3.1',
    protocol: 'ICMP',
    timestamp: '2024-01-15T10:05:10.000Z',
    description: 'Unusual ICMP traffic pattern — potential network reconnaissance or ping sweep.',
    status: 'open',
    evidence: {
      flows: [
        {
          id: 'flow-006',
          srcIp: '192.168.3.77',
          dstIp: '192.168.3.1',
          srcPort: 0,
          dstPort: 0,
          protocol: 'ICMP',
          bytes: 2048,
          packets: 128,
          timestamp: '2024-01-15T10:05:10.000Z',
        },
      ],
      rawPackets: [],
    },
    blockchainHash: null,
    blockchainVerified: false,
  },
];

const MOCK_BOT_STATUSES: BotStatus[] = [
  {
    id: 'bot-001',
    name: 'DDoS Bot',
    status: 'active',
    detectionCount: 142,
    lastActive: '2024-01-15T10:23:45.000Z',
    errorMessage: null,
  },
  {
    id: 'bot-002',
    name: 'Malware Bot',
    status: 'active',
    detectionCount: 87,
    lastActive: '2024-01-15T10:18:30.000Z',
    errorMessage: null,
  },
  {
    id: 'bot-003',
    name: 'Intrusion Bot',
    status: 'active',
    detectionCount: 213,
    lastActive: '2024-01-15T10:15:00.000Z',
    errorMessage: null,
  },
  {
    id: 'bot-004',
    name: 'Phishing Bot',
    status: 'idle',
    detectionCount: 56,
    lastActive: '2024-01-15T09:45:00.000Z',
    errorMessage: null,
  },
  {
    id: 'bot-005',
    name: 'Anomaly Bot',
    status: 'active',
    detectionCount: 34,
    lastActive: '2024-01-15T10:05:10.000Z',
    errorMessage: null,
  },
  {
    id: 'bot-006',
    name: 'Coordinator Bot',
    status: 'error',
    detectionCount: 0,
    lastActive: '2024-01-15T08:00:00.000Z',
    errorMessage: 'Failed to synchronise sub-agent pipeline. Retry limit exceeded.',
  },
];

const MOCK_THROUGHPUT: ThroughputPoint[] = [
  { timestamp: '2024-01-15T10:23:00.000Z', value: 120.5, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:06.000Z', value: 134.2, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:12.000Z', value: 118.7, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:18.000Z', value: 145.9, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:24.000Z', value: 389.1, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:30.000Z', value: 412.4, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:36.000Z', value: 398.6, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:42.000Z', value: 276.3, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:48.000Z', value: 201.8, unit: 'Mbps' },
  { timestamp: '2024-01-15T10:23:54.000Z', value: 187.2, unit: 'Mbps' },
];

const MOCK_SYSTEM_METRICS: SystemMetrics = {
  cpuUsage: 67.4,
  memoryUsage: 72.1,
  networkIo: 187.2,
  pipelineLatency: 14,
};

// ── Mock client ───────────────────────────────────────────────────────────

function createMockClient(): ApiClient {
  return {
    fetchAlerts(): Promise<Alert[]> {
      return Promise.resolve([...MOCK_ALERTS]);
    },

    fetchAlert(id: string): Promise<Alert> {
      const alert = MOCK_ALERTS.find((a) => a.id === id);
      if (!alert) {
        const err: ApiError = {
          statusCode: 404,
          message: `Alert with id "${id}" not found`,
          kind: 'http',
        };
        return Promise.reject(err);
      }
      return Promise.resolve({ ...alert });
    },

    fetchBotStatuses(): Promise<BotStatus[]> {
      return Promise.resolve([...MOCK_BOT_STATUSES]);
    },

    fetchThroughput(): Promise<ThroughputPoint[]> {
      return Promise.resolve([...MOCK_THROUGHPUT]);
    },

    fetchSystemMetrics(): Promise<SystemMetrics> {
      return Promise.resolve({ ...MOCK_SYSTEM_METRICS });
    },
  };
}

// ── Live client ───────────────────────────────────────────────────────────

/**
 * Wraps a fetch call with an AbortController-based 10-second timeout.
 * Throws a typed ApiError on non-2xx status, network failure, or timeout.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timerId);
    return response;
  } catch (err: unknown) {
    clearTimeout(timerId);

    // AbortController fires a DOMException with name "AbortError"
    const isAbort =
      err instanceof DOMException && err.name === 'AbortError';

    if (isAbort) {
      const apiError: ApiError = {
        statusCode: 0,
        message: 'Request timed out after 10 seconds',
        kind: 'timeout',
      };
      throw apiError;
    }

    const apiError: ApiError = {
      statusCode: 0,
      message: err instanceof Error ? err.message : 'Network error',
      kind: 'network',
    };
    throw apiError;
  }
}

/**
 * Reads the response body and throws a typed ApiError if the status is non-2xx.
 */
async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = response.statusText || `HTTP error ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.message === 'string') {
        message = body.message;
      } else if (typeof body?.detail === 'string') {
        message = body.detail;
      }
    } catch {
      // body was not JSON — keep the statusText message
    }

    const apiError: ApiError = {
      statusCode: response.status,
      message,
      kind: 'http',
    };
    throw apiError;
  }

  return response.json() as Promise<T>;
}

function createLiveClient(baseUrl: string): ApiClient {
  const base = baseUrl.replace(/\/$/, ''); // strip trailing slash

  return {
    async fetchAlerts(): Promise<Alert[]> {
      const response = await fetchWithTimeout(`${base}/alerts`);
      return parseResponse<Alert[]>(response);
    },

    async fetchAlert(id: string): Promise<Alert> {
      const response = await fetchWithTimeout(`${base}/alerts/${encodeURIComponent(id)}`);
      return parseResponse<Alert>(response);
    },

    async fetchBotStatuses(): Promise<BotStatus[]> {
      const response = await fetchWithTimeout(`${base}/bots`);
      return parseResponse<BotStatus[]>(response);
    },

    async fetchThroughput(): Promise<ThroughputPoint[]> {
      const response = await fetchWithTimeout(`${base}/throughput`);
      return parseResponse<ThroughputPoint[]>(response);
    },

    async fetchSystemMetrics(): Promise<SystemMetrics> {
      const response = await fetchWithTimeout(`${base}/system/metrics`);
      return parseResponse<SystemMetrics>(response);
    },
  };
}

// ── Factory ───────────────────────────────────────────────────────────────

/**
 * Creates an ApiClient instance.
 *
 * @param useMock - When true, returns deterministic mock data.
 *                  When false, sends live HTTP requests to VITE_API_BASE_URL.
 */
export function createApiClient(useMock: boolean): ApiClient {
  if (useMock) {
    return createMockClient();
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!baseUrl) {
    console.warn(
      '[apiClient] VITE_USE_MOCK is not "true" and VITE_API_BASE_URL is not set. ' +
        'Falling back to mock client.',
    );
    return createMockClient();
  }

  return createLiveClient(baseUrl);
}

// ── Default export ────────────────────────────────────────────────────────

/**
 * Singleton API client instance, resolved from environment variables at module load.
 * Set VITE_USE_MOCK=true for mock mode, or provide VITE_API_BASE_URL for live mode.
 */
const apiClient: ApiClient = createApiClient(
  import.meta.env.VITE_USE_MOCK === 'true',
);

export default apiClient;
