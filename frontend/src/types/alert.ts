export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AttackType =
  | 'BENIGN'
  | 'DDOS_SYN_FLOOD'
  | 'DDOS_UDP_AMPLIFICATION'
  | 'DOS_SLOWLORIS'
  | 'C2_BEACONING'
  | 'DGA_DOMAIN_LOOKUP'
  | 'ENCRYPTED_MALWARE_TLS'
  | 'PORT_SCAN_VERTICAL'
  | 'PORT_SCAN_HORIZONTAL'
  | 'DATA_EXFILTRATION';

export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface ThreatAlert {
  id?: string;
  alert_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  attack_type: AttackType;
  source_ip: string;
  target_ip: string;
  target_port?: number;
  confidence_score: number; // 0.0 - 1.0
  contributing_bots: string[];
  bot_scores: Record<string, number>;
  evidence: Record<string, any>;
  status: AlertStatus;
  blockchain_tx_hash?: string | null;
  blockchain_verified: boolean;
  blockchain_block_num?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface NetworkFlow {
  id?: string;
  flow_id: string;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: string;
  duration: number;
  bytes_in: number;
  bytes_out: number;
  pkts_in: number;
  pkts_out: number;
  tcp_flags?: string;
  flow_rate_bps?: number;
  packet_rate_pps?: number;
  entropy?: number;
  ja3_hash?: string | null;
  is_attack: boolean;
  attack_type: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BotMetric {
  id?: string;
  bot_name: string;
  display_name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'INITIALIZING';
  version: string;
  latency_ms: number;
  cpu_percent: number;
  memory_mb: number;
  predictions_count: number;
  threats_detected: number;
  accuracy_score: number;
  f1_score: number;
  last_heartbeat: string;
}

export interface BlockchainVerificationResult {
  alert_id: string;
  status: 'VERIFIED_ON_CHAIN' | 'UNVERIFIED' | 'TAMPERING_DETECTED';
  is_tamper_free: boolean;
  local_alert_hash: string;
  on_chain_alert_hash: string;
  transaction_hash: string;
  block_number: number;
  contract_address: string;
  network: string;
  explorer_url: string;
  verified_at?: string;
}

export interface ThroughputDataPoint {
  timestamp: string;
  timeLabel: string;
  flowsPerSec: number;
  packetsPerSec: number;
  bandwidthMbps: number;
}
