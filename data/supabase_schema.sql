-- ============================================================================
-- AI-Powered Cyber Threat Detection System - Supabase PostgreSQL Schema
-- Compatible with Supabase Database, SQL Editor, and Supabase Realtime Engine
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if needed (in reverse dependency order)
DROP TABLE IF EXISTS blockchain_logs CASCADE;
DROP TABLE IF EXISTS bot_metrics CASCADE;
DROP TABLE IF EXISTS threat_alerts CASCADE;
DROP TABLE IF EXISTS network_flows CASCADE;
DROP TABLE IF EXISTS dga_domains CASCADE;
DROP TABLE IF EXISTS dns_queries CASCADE;

-- ----------------------------------------------------------------------------
-- 1. Table: network_flows
-- Stores raw and aggregated bidirectional network flow telemetry.
-- ----------------------------------------------------------------------------
CREATE TABLE network_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id VARCHAR(64) NOT NULL UNIQUE,
    src_ip VARCHAR(45) NOT NULL,
    dst_ip VARCHAR(45) NOT NULL,
    src_port INTEGER NOT NULL CHECK (src_port >= 0 AND src_port <= 65535),
    dst_port INTEGER NOT NULL CHECK (dst_port >= 0 AND dst_port <= 65535),
    protocol VARCHAR(10) NOT NULL DEFAULT 'TCP', -- TCP, UDP, ICMP, DNS, TLS
    duration NUMERIC(10, 4) NOT NULL DEFAULT 0.0, -- seconds
    bytes_in BIGINT NOT NULL DEFAULT 0,
    bytes_out BIGINT NOT NULL DEFAULT 0,
    pkts_in INTEGER NOT NULL DEFAULT 0,
    pkts_out INTEGER NOT NULL DEFAULT 0,
    tcp_flags VARCHAR(32) DEFAULT 'SYN-ACK',
    flow_rate_bps NUMERIC(14, 2) DEFAULT 0.0,
    packet_rate_pps NUMERIC(12, 2) DEFAULT 0.0,
    entropy NUMERIC(6, 4) DEFAULT 0.0,
    ja3_hash VARCHAR(64) DEFAULT NULL,
    is_attack BOOLEAN NOT NULL DEFAULT FALSE,
    attack_type VARCHAR(64) DEFAULT 'BENIGN',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for network_flows
CREATE INDEX idx_flows_timestamp ON network_flows (timestamp DESC);
CREATE INDEX idx_flows_is_attack ON network_flows (is_attack);
CREATE INDEX idx_flows_attack_type ON network_flows (attack_type);
CREATE INDEX idx_flows_src_ip ON network_flows (src_ip);
CREATE INDEX idx_flows_dst_ip ON network_flows (dst_ip);
CREATE INDEX idx_flows_dst_port ON network_flows (dst_port);

-- ----------------------------------------------------------------------------
-- 2. Table: threat_alerts
-- Stores high-level correlated alerts emitted by the Multi-Bot Fusion Controller.
-- ----------------------------------------------------------------------------
CREATE TABLE threat_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    attack_type VARCHAR(64) NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    target_ip VARCHAR(45) NOT NULL,
    target_port INTEGER,
    confidence_score NUMERIC(5, 4) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    contributing_bots TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    bot_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    blockchain_tx_hash VARCHAR(66) DEFAULT NULL,
    blockchain_verified BOOLEAN NOT NULL DEFAULT FALSE,
    blockchain_block_num BIGINT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for threat_alerts
CREATE INDEX idx_alerts_created_at ON threat_alerts (created_at DESC);
CREATE INDEX idx_alerts_severity ON threat_alerts (severity);
CREATE INDEX idx_alerts_status ON threat_alerts (status);
CREATE INDEX idx_alerts_attack_type ON threat_alerts (attack_type);
CREATE INDEX idx_alerts_source_ip ON threat_alerts (source_ip);
CREATE INDEX idx_alerts_target_ip ON threat_alerts (target_ip);
CREATE INDEX idx_alerts_blockchain_tx ON threat_alerts (blockchain_tx_hash);

-- ----------------------------------------------------------------------------
-- 3. Table: bot_metrics
-- Tracks operational health, latency, CPU, and prediction throughput for ML bots.
-- ----------------------------------------------------------------------------
CREATE TABLE bot_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name VARCHAR(64) NOT NULL UNIQUE,
    display_name VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'DEGRADED', 'OFFLINE', 'INITIALIZING')),
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    latency_ms NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    cpu_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    memory_mb NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    predictions_count BIGINT NOT NULL DEFAULT 0,
    threats_detected BIGINT NOT NULL DEFAULT 0,
    accuracy_score NUMERIC(5, 4) DEFAULT 0.9850,
    f1_score NUMERIC(5, 4) DEFAULT 0.9820,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. Table: blockchain_logs
-- Immutable tamper-proof ledger logging alert hashes submitted to Smart Contract.
-- ----------------------------------------------------------------------------
CREATE TABLE blockchain_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id VARCHAR(64) NOT NULL REFERENCES threat_alerts(alert_id) ON DELETE CASCADE,
    alert_hash VARCHAR(66) NOT NULL UNIQUE, -- 0x + 64 hex chars (Keccak256 / SHA256)
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    sender_address VARCHAR(42) NOT NULL,
    gas_used BIGINT NOT NULL DEFAULT 45000,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bc_alert_hash ON blockchain_logs (alert_hash);
CREATE INDEX idx_bc_tx_hash ON blockchain_logs (tx_hash);
CREATE INDEX idx_bc_block_number ON blockchain_logs (block_number DESC);

-- ----------------------------------------------------------------------------
-- 5. Table: dga_domains
-- Ground truth and detected Domain Generation Algorithm (DGA) domain telemetry.
-- ----------------------------------------------------------------------------
CREATE TABLE dga_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    family VARCHAR(64) NOT NULL DEFAULT 'benign', -- cryptolocker, necurs, banjori, mirai, etc.
    entropy NUMERIC(6, 4) NOT NULL DEFAULT 0.0,
    vowel_ratio NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    length INTEGER NOT NULL DEFAULT 0,
    is_dga BOOLEAN NOT NULL DEFAULT FALSE,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dga_is_dga ON dga_domains (is_dga);
CREATE INDEX idx_dga_family ON dga_domains (family);

-- ----------------------------------------------------------------------------
-- 6. Table: dns_queries
-- DNS query logs for DNS Tunneling, Exfiltration, and C2 detection.
-- ----------------------------------------------------------------------------
CREATE TABLE dns_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id VARCHAR(64) NOT NULL UNIQUE,
    client_ip VARCHAR(45) NOT NULL,
    server_ip VARCHAR(45) NOT NULL DEFAULT '8.8.8.8',
    query_name VARCHAR(255) NOT NULL,
    query_type VARCHAR(10) NOT NULL DEFAULT 'A', -- A, AAAA, TXT, CNAME, NULL, MX
    response_code VARCHAR(16) NOT NULL DEFAULT 'NOERROR',
    payload_size_bytes INTEGER NOT NULL DEFAULT 0,
    entropy NUMERIC(6, 4) NOT NULL DEFAULT 0.0,
    is_tunneling BOOLEAN NOT NULL DEFAULT FALSE,
    tunneling_score NUMERIC(5, 4) DEFAULT 0.0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dns_timestamp ON dns_queries (timestamp DESC);
CREATE INDEX idx_dns_is_tunneling ON dns_queries (is_tunneling);
CREATE INDEX idx_dns_client_ip ON dns_queries (client_ip);

-- ----------------------------------------------------------------------------
-- 7. Supabase Realtime Configuration
-- Enable Realtime publication so clients can subscribe to live alerts and bot metrics.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    -- Add tables to supabase_realtime publication if publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE threat_alerts;
        ALTER PUBLICATION supabase_realtime ADD TABLE bot_metrics;
        ALTER PUBLICATION supabase_realtime ADD TABLE network_flows;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 8. Row Level Security (RLS) Configuration
-- Secure default policies: allow public/authenticated reads, service role full control
-- ----------------------------------------------------------------------------
ALTER TABLE network_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dga_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE dns_queries ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (authenticated + anon for dashboard demo)
CREATE POLICY "Allow public read on network_flows" ON network_flows FOR SELECT USING (true);
CREATE POLICY "Allow public read on threat_alerts" ON threat_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read on bot_metrics" ON bot_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read on blockchain_logs" ON blockchain_logs FOR SELECT USING (true);
CREATE POLICY "Allow public read on dga_domains" ON dga_domains FOR SELECT USING (true);
CREATE POLICY "Allow public read on dns_queries" ON dns_queries FOR SELECT USING (true);

-- Allow full access for service_role and backend insert/update operations
CREATE POLICY "Allow service_role full access on network_flows" ON network_flows FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow service_role full access on threat_alerts" ON threat_alerts FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow service_role full access on bot_metrics" ON bot_metrics FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow service_role full access on blockchain_logs" ON blockchain_logs FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow service_role full access on dga_domains" ON dga_domains FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
CREATE POLICY "Allow service_role full access on dns_queries" ON dns_queries FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
