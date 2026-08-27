export type Severity = "low" | "medium" | "high" | "critical";

export type ThreatClass =
  | "ddos"
  | "beaconing"
  | "dga_dns"
  | "encrypted_malware"
  | "scanning"
  | "exfiltration"
  | (string & {});

export interface BotResult {
  bot_id: string;
  bot_name: ThreatClass;
  score: number; // 0..1
  confidence: number; // 0..1
  triggered_at: string; // ISO timestamp
}

export interface Alert {
  id: string;
  created_at: string;
  severity: Severity;
  threat_classes: ThreatClass[];
  fused_score: number; // 0..1
  src_ip: string;
  dst_ip: string;
  src_port?: number;
  dst_port?: number;
  summary: string;
  bot_results: BotResult[];
  chain_tx_hash?: string;
  chain_verified?: boolean;
}

export interface BotHealth {
  bot_id: string;
  bot_name: ThreatClass;
  status: "online" | "degraded" | "offline";
  cpu_pct: number;
  mem_mb: number;
  latency_ms: number;
  last_seen: string;
}

export interface ThroughputPoint {
  t: string; // ISO timestamp
  flows_per_sec: number;
}

export type SystemMode = "live" | "replay";
