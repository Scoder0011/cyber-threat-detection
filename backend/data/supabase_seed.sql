-- ============================================================================
-- Supabase Initial Seed Data - AI Cyber Threat Detection System
-- Generated on: 2026-08-25T15:41:46.669750+00:00
-- ============================================================================

-- 1. Seed Bot Metrics
INSERT INTO bot_metrics (bot_name, display_name, status, latency_ms, cpu_percent, memory_mb, predictions_count, threats_detected, accuracy_score, f1_score) VALUES
('ddos_bot', 'DDoS & DoS Specialist', 'HEALTHY', 1.25, 4.2, 145.0, 154200, 243, 0.992, 0.989),
('beaconing_bot', 'C2 Beaconing Detector', 'HEALTHY', 2.1, 6.8, 180.5, 98400, 89, 0.985, 0.981),
('dga_dns_bot', 'DGA DNS Classifier', 'HEALTHY', 0.85, 3.1, 112.0, 342100, 512, 0.994, 0.993),
('encrypted_malware_bot', 'Encrypted Malware & TLS Bot', 'HEALTHY', 3.4, 8.5, 220.0, 67800, 74, 0.978, 0.975),
('scanning_bot', 'Reconnaissance & Scan Bot', 'HEALTHY', 1.1, 3.8, 130.2, 210500, 318, 0.988, 0.986),
('exfiltration_bot', 'Data Exfiltration Guardian', 'HEALTHY', 2.8, 5.4, 165.8, 89300, 42, 0.982, 0.979)
ON CONFLICT (bot_name) DO UPDATE SET
  status = EXCLUDED.status, latency_ms = EXCLUDED.latency_ms, predictions_count = EXCLUDED.predictions_count, threats_detected = EXCLUDED.threats_detected;

-- 2. Seed Threat Alerts & Blockchain Logs
INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('alert_2026_001', 'Massive Distributed SYN Flood Detected', 'Multi-source TCP SYN flood exceeding 20,000 pps targeting border gateway web service.', 'CRITICAL', 'DDOS_SYN_FLOOD', '198.51.100.0/24 (Botnet)', '10.0.10.20', 80, 0.989, ARRAY['ddos_bot'], '{"ddos_bot": 0.995, "scanning_bot": 0.32}'::jsonb, '{"pps": 24500, "syn_ack_ratio": 99.8, "unique_sources": 512}'::jsonb, 'NEW', '0x7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef0123456789', true, 19450231)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('alert_2026_001', '0x3bfa5d791f043a7de761808e6104944011ee886a94618a1e7ec9e51afc323be2', '0x7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef0123456789', 19450231, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;
INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('alert_2026_002', 'Cobalt Strike C2 Beaconing Channel Active', 'Deterministic periodic callback pattern every 10.0s detected with Cobalt Strike JA3 signature.', 'HIGH', 'C2_BEACONING', '192.168.1.45', '185.220.101.44', 8443, 0.965, ARRAY['beaconing_bot', 'encrypted_malware_bot'], '{"beaconing_bot": 0.98, "encrypted_malware_bot": 0.95}'::jsonb, '{"interval_sec": 10.0, "jitter": 0.02, "ja3": "a0e9f5d64349fb13191bc781f81f42e1"}'::jsonb, 'INVESTIGATING', '0x4a1c7f99b2e048d3c67d821345e56789abcdef0123456789abcdef0123456789', true, 19450245)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('alert_2026_002', '0xf73fc3d6afb7d6fa846b018cde9ca346ad8eee5b6d102be2a6e39ff549de4622', '0x4a1c7f99b2e048d3c67d821345e56789abcdef0123456789abcdef0123456789', 19450245, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;
INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('alert_2026_003', 'Algorithmic DGA Domain Generation Queries', 'Host generating high-entropy pseudo-random domain queries matching Cryptolocker seed.', 'HIGH', 'DGA_DNS', '192.168.1.88', '8.8.8.8', 53, 0.952, ARRAY['dga_dns_bot'], '{"dga_dns_bot": 0.97}'::jsonb, '{"sample_domain": "kdfj934jsd834kf.net", "entropy": 3.92, "vowel_ratio": 0.12}'::jsonb, 'NEW', '0x9f3d2e1a4b5c67890abcdef1234567890abcdef1234567890abcdef123456789', true, 19450250)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('alert_2026_003', '0x5253ef5a1b3de832e0f870c818640b6ed3d52c77448f05e37d30d3068a4b577a', '0x9f3d2e1a4b5c67890abcdef1234567890abcdef1234567890abcdef123456789', 19450250, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;
INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('alert_2026_004', 'Anomalous Outbound Database Exfiltration', 'Unusual large volume egress transfer (14.8 MB) to unknown external IP via HTTPS POST.', 'CRITICAL', 'DATA_EXFILTRATION', '192.168.1.100', '185.220.101.88', 443, 0.978, ARRAY['exfiltration_bot'], '{"exfiltration_bot": 0.985, "encrypted_malware_bot": 0.72}'::jsonb, '{"outbound_mb": 14.8, "outbound_ratio": 450.2, "transfer_duration_sec": 4.2}'::jsonb, 'NEW', '0x2b8e9f1a4c5d67890abcdef1234567890abcdef1234567890abcdef123456789', true, 19450262)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('alert_2026_004', '0x9fb934f479221ecd3490a38769fe20ee0ac45e29efa95ebcda036c4c7b0499c8', '0x2b8e9f1a4c5d67890abcdef1234567890abcdef1234567890abcdef123456789', 19450262, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;
INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('alert_2026_005', 'Subnet Reconnaissance & Port Sweep', 'Vertical port sweep probing 150 consecutive ports on central application server.', 'MEDIUM', 'PORT_SCAN', '185.220.101.15', '10.0.10.5', 8080, 0.921, ARRAY['scanning_bot'], '{"scanning_bot": 0.94}'::jsonb, '{"ports_scanned": 150, "rate_pps": 350, "open_found": [22, 80, 443, 8080]}'::jsonb, 'RESOLVED', '0x5e7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef01234567', true, 19450275)
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('alert_2026_005', '0xc39f61df7563a5476049522f573b25da55735b5010b07639d4cca15d4e6e1170', '0x5e7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef01234567', 19450275, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;

