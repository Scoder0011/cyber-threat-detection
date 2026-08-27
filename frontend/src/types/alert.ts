// src/types/alert.ts — single source of truth for all data shapes

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
  type: string; // "DDoS" | "Malware" | "Intrusion" | "Phishing" | "Anomaly"
  severity: Severity;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  timestamp: string; // ISO-8601
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
  lastActive: string; // ISO-8601
  errorMessage: string | null;
}

export interface ThroughputPoint {
  timestamp: string; // ISO-8601
  value: number;     // flows per second
  unit: string;      // e.g. "Kbps", "Mbps"
}

export interface SystemMetrics {
  cpuUsage: number;       // percentage 0–100
  memoryUsage: number;    // percentage 0–100
  networkIo: number;      // Mbps
  pipelineLatency: number; // ms
}

export interface ApiError {
  statusCode: number;
  message: string;
  kind: "http" | "network" | "timeout";
}
