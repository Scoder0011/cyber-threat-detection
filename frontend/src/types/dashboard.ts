export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ThreatAlert {
  id: string; alert_id: string; title: string; description: string; severity: Severity;
  attack_type: string; source_ip: string; target_ip: string; target_port: number | null;
  confidence_score: number; contributing_bots: string[]; bot_scores: Record<string, number>;
  evidence: Record<string, unknown>; status: string; blockchain_tx_hash: string | null;
  blockchain_verified: boolean; blockchain_block_num: number | null; created_at: string; updated_at: string;
}

export interface NetworkFlow {
  id: string; flow_id: string; src_ip: string; dst_ip: string; src_port: number; dst_port: number;
  protocol: string; bytes_in: number; bytes_out: number; tcp_flags: string | null;
  is_attack: boolean; attack_type: string | null; timestamp: string;
}

export interface BotMetric {
  id: string; bot_name: string; display_name: string;
  status: "HEALTHY" | "DEGRADED" | "OFFLINE" | "INITIALIZING";
  latency_ms: number; cpu_percent: number; memory_mb: number; predictions_count: number;
  threats_detected: number; accuracy_score: number | null; f1_score: number | null; last_heartbeat: string;
}
