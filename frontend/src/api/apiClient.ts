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
    sourceIp: '45.33.12.227',
    destinationIp: '10.0.10.20',
    targetPort: 80,
    protocol: 'TCP',
    timestamp: '2024-01-15T10:23:45.000Z',
    description: 'High-volume TCP SYN flood targeting port 80 (46,356 pkts/s) with narrow spoofed IP entropy.',
    status: 'open',
    confidenceScore: 0.9920,
    contributingBots: ['DDoS Bot', 'Scanning Bot'],
    botScores: {
      'DDoS Bot': 0.9920,
      'Scanning Bot': 0.7410,
      'Beaconing Bot': 0.0120,
      'DGA DNS Bot': 0.0000,
      'Encrypted Malware Bot': 0.0000,
      'Exfiltration Bot': 0.0050,
    },
    evidence: {
      flows: [
        {
          id: 'flow-001',
          srcIp: '45.33.12.227',
          dstIp: '10.0.10.20',
          srcPort: 60001,
          dstPort: 80,
          protocol: 'TCP',
          bytes: 1980000,
          packets: 45000,
          timestamp: '2024-01-15T10:23:45.000Z',
          tcpFlags: 'SYN',
          packetRatePps: 46356,
          flowRateBps: 16386000,
          entropy: 0.0912,
        },
        {
          id: 'flow-002',
          srcIp: '45.33.12.228',
          dstIp: '10.0.10.20',
          srcPort: 60002,
          dstPort: 80,
          protocol: 'TCP',
          bytes: 1970000,
          packets: 44800,
          timestamp: '2024-01-15T10:23:46.000Z',
          tcpFlags: 'SYN',
          packetRatePps: 45100,
          flowRateBps: 16120000,
          entropy: 0.0894,
        },
      ],
      rawPackets: [
        {
          frameLength: 54,
          captureTimestamp: '2024-01-15T10:23:45.123Z',
          summary: 'TCP 45.33.12.227:60001 → 10.0.10.20:80 [SYN] Seq=0 Win=1024 Len=0',
        },
      ],
    },
    blockchainHash: 'a3f2c1e9d8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1',
    blockchainVerified: true,
    blockchainTxHash: '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    blockchainBlockNum: 18459201,
  },
  {
    id: 'alert-002',
    type: 'Malware',
    severity: 'High',
    sourceIp: '192.168.1.45',
    destinationIp: '185.220.101.44',
    targetPort: 8443,
    protocol: 'TCP',
    timestamp: '2024-01-15T10:18:30.000Z',
    description: 'Cobalt Strike C2 beaconing channel with 10s base interval and +/-25% Gaussian timing jitter matching abuse.ch JA3 signature.',
    status: 'investigating',
    confidenceScore: 0.9450,
    contributingBots: ['Beaconing Bot', 'Encrypted Malware Bot'],
    botScores: {
      'DDoS Bot': 0.0020,
      'Beaconing Bot': 0.9450,
      'DGA DNS Bot': 0.0000,
      'Encrypted Malware Bot': 0.8920,
      'Scanning Bot': 0.0000,
      'Exfiltration Bot': 0.0410,
    },
    evidence: {
      flows: [
        {
          id: 'flow-003',
          srcIp: '192.168.1.45',
          dstIp: '185.220.101.44',
          srcPort: 49152,
          dstPort: 8443,
          protocol: 'TCP',
          bytes: 204800,
          packets: 320,
          timestamp: '2024-01-15T10:18:30.000Z',
          ja3Hash: '4d7a28d6f2263ed61de88ca66eb011e3',
          entropy: 4.82,
        },
      ],
      rawPackets: [
        {
          frameLength: 1500,
          captureTimestamp: '2024-01-15T10:18:30.500Z',
          summary: 'TLSv1.3 ClientHello (JA3: 4d7a28d6f2263ed61de88ca66eb011e3) → 185.220.101.44:8443',
        },
      ],
    },
    blockchainHash: 'b4e3d2c1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3',
    blockchainVerified: true,
    blockchainTxHash: '0x3a9e21f7c8b0d4e5a6f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    blockchainBlockNum: 18459214,
  },
  {
    id: 'alert-003',
    type: 'Intrusion',
    severity: 'Critical',
    sourceIp: '185.220.101.15',
    destinationIp: '10.0.10.5',
    targetPort: 22,
    protocol: 'TCP',
    timestamp: '2024-01-15T10:15:00.000Z',
    description: 'Vertical port sweep across 847 distinct destination ports (1-1024) in 4.1 seconds.',
    status: 'open',
    confidenceScore: 0.9620,
    contributingBots: ['Scanning Bot', 'DDoS Bot'],
    botScores: {
      'DDoS Bot': 0.1200,
      'Scanning Bot': 0.9620,
      'Beaconing Bot': 0.0000,
      'DGA DNS Bot': 0.0000,
      'Encrypted Malware Bot': 0.0000,
      'Exfiltration Bot': 0.0000,
    },
    evidence: {
      flows: [
        {
          id: 'flow-004',
          srcIp: '185.220.101.15',
          dstIp: '10.0.10.5',
          srcPort: 45000,
          dstPort: 22,
          protocol: 'TCP',
          bytes: 81920,
          packets: 2048,
          timestamp: '2024-01-15T10:15:00.000Z',
          tcpFlags: 'SYN',
        },
      ],
      rawPackets: [],
    },
    blockchainHash: 'f1e2d3c4b5a60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    blockchainVerified: true,
    blockchainTxHash: '0x7b1c4e9f0a2d3e5b6c7a8f9d0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    blockchainBlockNum: 18459225,
  },
  {
    id: 'alert-004',
    type: 'Phishing',
    severity: 'Medium',
    sourceIp: '198.51.100.42',
    destinationIp: '192.168.2.30',
    targetPort: 25,
    protocol: 'TCP',
    timestamp: '2024-01-15T10:10:22.000Z',
    description: 'High-entropy DGArchive algorithmic domain query matching Necurs/Cryptolocker algorithm.',
    status: 'resolved',
    confidenceScore: 0.9180,
    contributingBots: ['DGA DNS Bot'],
    botScores: {
      'DDoS Bot': 0.0000,
      'Scanning Bot': 0.0000,
      'Beaconing Bot': 0.0000,
      'DGA DNS Bot': 0.9180,
      'Encrypted Malware Bot': 0.0000,
      'Exfiltration Bot': 0.0210,
    },
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
          entropy: 3.88,
        },
      ],
      rawPackets: [
        {
          frameLength: 1024,
          captureTimestamp: '2024-01-15T10:10:22.200Z',
          summary: 'DNS Standard Query A vwqzmxrktbn.net (Shannon Entropy: 3.88)',
        },
      ],
    },
    blockchainHash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    blockchainVerified: true,
    blockchainTxHash: '0x5c7f1a8e9d0b2c3a4f5e6b7a8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    blockchainBlockNum: 18459188,
  },
  {
    id: 'alert-005',
    type: 'Anomaly',
    severity: 'Low',
    sourceIp: '10.0.0.19',
    destinationIp: '45.77.12.9',
    targetPort: 53,
    protocol: 'UDP',
    timestamp: '2024-01-15T10:05:10.000Z',
    description: 'Covert data exfiltration over DNS tunnel (dnscat2) with 3023:1 asymmetric egress byte ratio.',
    status: 'open',
    confidenceScore: 0.9780,
    contributingBots: ['Exfiltration Bot'],
    botScores: {
      'DDoS Bot': 0.0000,
      'Scanning Bot': 0.0000,
      'Beaconing Bot': 0.0150,
      'DGA DNS Bot': 0.4500,
      'Encrypted Malware Bot': 0.0000,
      'Exfiltration Bot': 0.9780,
    },
    evidence: {
      flows: [
        {
          id: 'flow-006',
          srcIp: '10.0.0.19',
          dstIp: '45.77.12.9',
          srcPort: 53210,
          dstPort: 53,
          protocol: 'UDP',
          bytes: 44411532,
          packets: 32000,
          timestamp: '2024-01-15T10:05:10.000Z',
          entropy: 4.67,
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
    detectionCount: 432,
    lastActive: '2024-01-15T10:23:45.000Z',
    errorMessage: null,
    latencyMs: 1.85,
    cpuPercent: 14.2,
    memoryMb: 184.5,
    accuracyScore: 0.9940,
    f1Score: 0.9915,
  },
  {
    id: 'bot-002',
    name: 'Beaconing Bot',
    status: 'active',
    detectionCount: 89,
    lastActive: '2024-01-15T10:18:30.000Z',
    errorMessage: null,
    latencyMs: 3.12,
    cpuPercent: 18.7,
    memoryMb: 242.0,
    accuracyScore: 0.9880,
    f1Score: 0.9850,
  },
  {
    id: 'bot-003',
    name: 'DGA DNS Bot',
    status: 'active',
    detectionCount: 215,
    lastActive: '2024-01-15T10:15:00.000Z',
    errorMessage: null,
    latencyMs: 1.20,
    cpuPercent: 9.4,
    memoryMb: 156.0,
    accuracyScore: 0.9920,
    f1Score: 0.9890,
  },
  {
    id: 'bot-004',
    name: 'Encrypted Malware Bot',
    status: 'active',
    detectionCount: 142,
    lastActive: '2024-01-15T09:45:00.000Z',
    errorMessage: null,
    latencyMs: 1.65,
    cpuPercent: 11.5,
    memoryMb: 198.2,
    accuracyScore: 0.9960,
    f1Score: 0.9940,
  },
  {
    id: 'bot-005',
    name: 'Scanning Bot',
    status: 'active',
    detectionCount: 184,
    lastActive: '2024-01-15T10:05:10.000Z',
    errorMessage: null,
    latencyMs: 0.95,
    cpuPercent: 7.8,
    memoryMb: 128.0,
    accuracyScore: 0.9850,
    f1Score: 0.9820,
  },
  {
    id: 'bot-006',
    name: 'Exfiltration Bot',
    status: 'active',
    detectionCount: 76,
    lastActive: '2024-01-15T08:00:00.000Z',
    errorMessage: null,
    latencyMs: 2.05,
    cpuPercent: 15.1,
    memoryMb: 210.0,
    accuracyScore: 0.9890,
    f1Score: 0.9860,
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
  cpuUsage: 28.4,
  memoryUsage: 42.1,
  networkIo: 187.2,
  pipelineLatency: 4.8,
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
  import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.MODE === 'test',
);

export default apiClient;
