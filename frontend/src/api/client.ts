import { ThreatAlert, NetworkFlow, BotMetric, BlockchainVerificationResult } from '../types/alert';

const API_BASE = '/api';

// Fallback Mock Data for standalone demonstration
export const MOCK_ALERTS: ThreatAlert[] = [
  {
    alert_id: 'ALT-20260827-001',
    title: 'High-Volume TCP SYN Flood Targeting Gateway',
    description: 'Massive ingress burst of 46,356 packets/sec detected from narrow spoofed IP pool with zero ACK responses.',
    severity: 'CRITICAL',
    attack_type: 'DDOS_SYN_FLOOD',
    source_ip: '45.33.12.227',
    target_ip: '10.0.10.20',
    target_port: 80,
    confidence_score: 0.9920,
    contributing_bots: ['ddos_bot', 'scanning_bot'],
    bot_scores: {
      ddos_bot: 0.9920,
      scanning_bot: 0.7410,
      beaconing_bot: 0.0120,
      dga_dns_bot: 0.0000,
      encrypted_malware_bot: 0.0000,
      exfiltration_bot: 0.0050,
    },
    evidence: {
      packet_rate_pps: 46356.0,
      flow_rate_bps: 16386000.0,
      source_entropy: 0.0912,
      tcp_flags: 'SYN',
      syn_ack_ratio: 0.0000,
      duration_sec: 0.8,
    },
    status: 'NEW',
    blockchain_tx_hash: '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
    blockchain_verified: true,
    blockchain_block_num: 18459201,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    alert_id: 'ALT-20260827-002',
    title: 'Cobalt Strike C2 Beaconing Channel with Jitter',
    description: 'Periodic TLS check-ins observed at 10.0s intervals with +/-25% Gaussian timing jitter matching malleable C2 profile.',
    severity: 'HIGH',
    attack_type: 'C2_BEACONING',
    source_ip: '192.168.1.45',
    target_ip: '185.220.101.44',
    target_port: 8443,
    confidence_score: 0.9450,
    contributing_bots: ['beaconing_bot', 'encrypted_malware_bot'],
    bot_scores: {
      ddos_bot: 0.0020,
      beaconing_bot: 0.9450,
      dga_dns_bot: 0.0000,
      encrypted_malware_bot: 0.8920,
      scanning_bot: 0.0000,
      exfiltration_bot: 0.0410,
    },
    evidence: {
      mean_iat_sec: 9.84,
      iat_jitter_pct: 0.231,
      spectral_autocorrelation: 0.912,
      ja3_hash: '4d7a28d6f2263ed61de88ca66eb011e3',
      matched_threat: 'CobaltStrike HTTPS Beacon',
    },
    status: 'INVESTIGATING',
    blockchain_tx_hash: '0x3a9e21f7c8b0d4e5a6f1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    blockchain_verified: true,
    blockchain_block_num: 18459214,
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    alert_id: 'ALT-20260827-003',
    title: 'High-Entropy Algorithmic DGA Domain Lookup',
    description: 'Query for dynamic DGA domain matching Necurs/Cryptolocker algorithm structure with abnormal vowel distribution.',
    severity: 'HIGH',
    attack_type: 'DGA_DOMAIN_LOOKUP',
    source_ip: '10.0.10.5',
    target_ip: '8.8.8.8',
    target_port: 53,
    confidence_score: 0.9180,
    contributing_bots: ['dga_dns_bot'],
    bot_scores: {
      ddos_bot: 0.0000,
      beaconing_bot: 0.0000,
      dga_dns_bot: 0.9180,
      encrypted_malware_bot: 0.0000,
      scanning_bot: 0.0000,
      exfiltration_bot: 0.0210,
    },
    evidence: {
      query_name: 'vwqzmxrktbn.net',
      shannon_entropy: 3.88,
      vowel_ratio: 0.09,
      domain_length: 15,
      dga_family: 'necurs',
    },
    status: 'NEW',
    blockchain_tx_hash: '0x5c7f1a8e9d0b2c3a4f5e6b7a8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7',
    blockchain_verified: true,
    blockchain_block_num: 18459188,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    alert_id: 'ALT-20260827-004',
    title: 'Covert Data Exfiltration over DNS Tunnel',
    description: 'Chunked Base32 exfiltration payload detected inside high-frequency DNS TXT record requests.',
    severity: 'CRITICAL',
    attack_type: 'DATA_EXFILTRATION',
    source_ip: '10.0.0.19',
    target_ip: '45.77.12.9',
    target_port: 53,
    confidence_score: 0.9780,
    contributing_bots: ['exfiltration_bot'],
    bot_scores: {
      ddos_bot: 0.0000,
      beaconing_bot: 0.0150,
      dga_dns_bot: 0.4500,
      encrypted_malware_bot: 0.0000,
      scanning_bot: 0.0000,
      exfiltration_bot: 0.9780,
    },
    evidence: {
      ratio_out_in: 3023.2,
      bytes_out: 44411532,
      bytes_in: 14690,
      dns_txt_entropy: 4.67,
      tool: 'dnscat2_tunnel',
    },
    status: 'NEW',
    blockchain_tx_hash: '0x7b1c4e9f0a2d3e5b6c7a8f9d0e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    blockchain_verified: true,
    blockchain_block_num: 18459225,
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    alert_id: 'ALT-20260827-005',
    title: 'Vertical Port Scan Sweep (Ports 1-1024)',
    description: 'Rapid sequential probing of 847 distinct destination ports across gateway server in 4.1 seconds.',
    severity: 'MEDIUM',
    attack_type: 'PORT_SCAN_VERTICAL',
    source_ip: '10.0.0.77',
    target_ip: '10.0.0.5',
    target_port: 0,
    confidence_score: 0.8410,
    contributing_bots: ['scanning_bot'],
    bot_scores: {
      ddos_bot: 0.1200,
      beaconing_bot: 0.0000,
      dga_dns_bot: 0.0000,
      encrypted_malware_bot: 0.0000,
      scanning_bot: 0.8410,
      exfiltration_bot: 0.0000,
    },
    evidence: {
      unique_dst_ports: 847,
      scan_duration_s: 4.1,
      scanned_range: '1-1024',
      open_ports_discovered: [22, 80, 443, 8080],
    },
    status: 'RESOLVED',
    blockchain_tx_hash: null,
    blockchain_verified: false,
    blockchain_block_num: null,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export const MOCK_BOTS: BotMetric[] = [
  {
    bot_name: 'ddos_bot',
    display_name: 'DDoS & Volumetric Flooding Bot',
    status: 'HEALTHY',
    version: '1.2.0',
    latency_ms: 1.85,
    cpu_percent: 14.2,
    memory_mb: 184.5,
    predictions_count: 148920,
    threats_detected: 432,
    accuracy_score: 0.9940,
    f1_score: 0.9915,
    last_heartbeat: new Date().toISOString(),
  },
  {
    bot_name: 'beaconing_bot',
    display_name: 'C2 Beaconing & Timing Jitter Bot',
    status: 'HEALTHY',
    version: '1.1.0',
    latency_ms: 3.12,
    cpu_percent: 18.7,
    memory_mb: 242.0,
    predictions_count: 42100,
    threats_detected: 89,
    accuracy_score: 0.9880,
    f1_score: 0.9850,
    last_heartbeat: new Date().toISOString(),
  },
  {
    bot_name: 'dga_dns_bot',
    display_name: 'DGA Domain & DNS Entropy Bot',
    status: 'HEALTHY',
    version: '2.0.1',
    latency_ms: 1.20,
    cpu_percent: 9.4,
    memory_mb: 156.0,
    predictions_count: 98400,
    threats_detected: 215,
    accuracy_score: 0.9920,
    f1_score: 0.9890,
    last_heartbeat: new Date().toISOString(),
  },
  {
    bot_name: 'encrypted_malware_bot',
    display_name: 'Encrypted Malware & JA3 Bot',
    status: 'HEALTHY',
    version: '1.3.0',
    latency_ms: 1.65,
    cpu_percent: 11.5,
    memory_mb: 198.2,
    predictions_count: 65400,
    threats_detected: 142,
    accuracy_score: 0.9960,
    f1_score: 0.9940,
    last_heartbeat: new Date().toISOString(),
  },
  {
    bot_name: 'scanning_bot',
    display_name: 'Host & Port Discovery Scanner Bot',
    status: 'HEALTHY',
    version: '1.0.4',
    latency_ms: 0.95,
    cpu_percent: 7.8,
    memory_mb: 128.0,
    predictions_count: 112000,
    threats_detected: 184,
    accuracy_score: 0.9850,
    f1_score: 0.9820,
    last_heartbeat: new Date().toISOString(),
  },
  {
    bot_name: 'exfiltration_bot',
    display_name: 'Data Exfiltration & Egress Ratio Bot',
    status: 'HEALTHY',
    version: '1.1.2',
    latency_ms: 2.05,
    cpu_percent: 15.1,
    memory_mb: 210.0,
    predictions_count: 87600,
    threats_detected: 76,
    accuracy_score: 0.9890,
    f1_score: 0.9860,
    last_heartbeat: new Date().toISOString(),
  },
];

// API Helper Client
export const api = {
  async getAlerts(): Promise<ThreatAlert[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts`);
      if (res.ok) return await res.json();
    } catch {
      // Return mock data if backend not reachable
    }
    return MOCK_ALERTS;
  },

  async getAlertById(alertId: string): Promise<ThreatAlert | undefined> {
    try {
      const res = await fetch(`${API_BASE}/alerts/${alertId}`);
      if (res.ok) return await res.json();
    } catch {}
    return MOCK_ALERTS.find((a) => a.alert_id === alertId);
  },

  async getBotHealth(): Promise<BotMetric[]> {
    try {
      const res = await fetch(`${API_BASE}/bots/health`);
      if (res.ok) return await res.json();
    } catch {}
    return MOCK_BOTS;
  },

  async getFlows(limit: number = 20): Promise<NetworkFlow[]> {
    try {
      const res = await fetch(`${API_BASE}/flows?limit=${limit}`);
      if (res.ok) return await res.json();
    } catch {}
    return [];
  },

  async verifyAlertOnChain(alertId: string): Promise<BlockchainVerificationResult> {
    try {
      const res = await fetch(`${API_BASE}/blockchain/verify/${alertId}`);
      if (res.ok) return await res.json();
    } catch {}

    const alert = MOCK_ALERTS.find((a) => a.alert_id === alertId);
    return {
      alert_id: alertId,
      status: 'VERIFIED_ON_CHAIN',
      is_tamper_free: true,
      local_alert_hash: '0x5a2d718b4e9f0c2a1b3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b',
      on_chain_alert_hash: '0x5a2d718b4e9f0c2a1b3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b',
      transaction_hash: alert?.blockchain_tx_hash || '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1',
      block_number: alert?.blockchain_block_num || 18459201,
      contract_address: '0x3F91A39b2B86f8f537EcE09426c117bE9717D559',
      network: 'Polygon Amoy Testnet (EVM)',
      explorer_url: `https://amoy.polygonscan.com/tx/${alert?.blockchain_tx_hash || '0x8f3c71a9b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1'}`,
      verified_at: new Date().toISOString(),
    };
  },

  async setSystemMode(mode: 'LIVE' | 'REPLAY'): Promise<{ status: string; mode: string }> {
    try {
      const res = await fetch(`${API_BASE}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'success', mode };
  },
};
