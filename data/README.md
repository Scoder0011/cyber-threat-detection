# 📊 Data Subsystem & Synthetic Threat Catalog

Welcome to the **Data Subsystem** of the AI-Powered Cyber Threat Detection System. This directory houses the datasets, synthetic traffic generators, PCAP binary samples, data quality verification suites, and PostgreSQL / Supabase schemas that power model training, real-time stream ingestion, and security analytics.

---

## 🏗️ Directory Overview

```directory
data/
├── supabase_schema.sql             # Full Supabase PostgreSQL DDL (Tables, Indexes, RLS, Realtime)
├── supabase_seed.sql               # Ready-to-paste SQL seed data for Supabase SQL Editor
├── generate_datasets.py            # Python generator creating all synthetic datasets & PCAPs
├── validate_datasets.py            # Rigorous dataset quality, schema & statistical validator
├── preprocess_and_split.py         # Stratified dataset splitter (70% Train, 15% Val, 15% Test)
├── pcap_to_flow.py                 # Pure-Python PCAP-to-Flow bidirectional aggregator
├── seed_supabase.py                # Automated REST / SQL seeder for Supabase
├── import_external_datasets.py     # Benchmark converter (CIC-IDS2017/2018, UNSW-NB15)
│
├── pcaps/                          # Raw packet captures (Wireshark / tcpdump compatible)
│   ├── sample_threats.pcap         # Multi-vector binary PCAP (SYN flood, DNS, HTTP)
│   └── .gitkeep
│
├── flows/                          # Labeled network flow benchmark datasets
│   ├── sample_mixed_flows.json     # 3,300 mixed evaluation flows (80% benign, 20% threats)
│   ├── sample_mixed_flows.csv      # CSV formatted for direct Pandas / Supabase import
│   ├── multi_stage_scenario.json   # 6-stage APT attack timeline (Recon -> C2 -> Exfil -> DDoS)
│   └── .gitkeep
│
├── splits/                         # Stratified ML partitions
│   ├── train.csv / train.json      # 70% Train partition (2,310 flows)
│   ├── val.csv / val.json          # 15% Validation partition (494 flows)
│   └── test.csv / test.json        # 15% Test benchmark partition (496 flows)
│
└── synthetic/                      # Specialized vector datasets
    ├── benign/                     # Baseline normal network activity
    │   ├── benign_flows.json       # Normal enterprise traffic (HTTPS, HTTP, SSH, DNS, NTP, SMTP)
    │   ├── benign_flows.csv        # Tabular baseline flow records
    │   ├── benign_dns.csv          # Top-1000 benign domain query distribution
    │   └── benign_tls.csv          # Standard browser & OS JA3/JA4 TLS fingerprints
    │
    └── attacks/                    # Malicious traffic organized by specialist bot vector
        ├── syn_flood/              # TCP SYN flood flows (high-rate spoofed sources via hping3)
        │   ├── syn_flood_flows.json
        │   └── syn_flood_flows.csv
        ├── udp_amplification/      # DNS (port 53) & NTP (port 123) reflection amplification (40x-75x)
        │   ├── udp_amp_flows.json
        │   └── udp_amp_flows.csv
        ├── slowloris/              # Low-and-slow HTTP resource exhaustion flows
        │   ├── slowloris_flows.json
        │   └── slowloris_flows.csv
        ├── dns_tunneling/          # C2 / Exfiltration encoded subdomains (Base64/Hex via dnscat2/iodine)
        │   ├── dns_tunneling_queries.json
        │   └── dns_tunneling_queries.csv
        ├── dga_samples/            # DGArchive algorithmic domain queries (Cryptolocker, Necurs, Banjori)
        │   ├── dga_queries.json
        │   └── dga_domains.csv
        ├── c2_beaconing/           # Periodic heartbeat callback flows with fixed interval & low jitter
        │   ├── c2_beaconing_flows.json
        │   └── c2_beaconing_flows.csv
        ├── port_scan/              # Vertical port sweeps (1-1024) & horizontal subnet sweeps (/24)
        │   ├── port_scan_flows.json
        │   └── port_scan_flows.csv
        ├── encrypted_malware/      # Malicious TLS sessions with known JA3 hashes (Cobalt Strike, TrickBot)
        │   ├── encrypted_malware_flows.json
        │   └── encrypted_malware_flows.csv
        └── data_exfiltration/      # High-volume egress bursts & anomalous outbound-to-inbound ratios
            ├── exfiltration_flows.json
            └── exfiltration_flows.csv
```

---

## ⚡ Quick Start: Setting Up with Supabase

We use **Supabase** as the primary relational database and real-time event broadcaster for alerts, flows, and bot telemetry.

### Method 1: Supabase Web Dashboard (1-Click Setup)
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New query**.
3. Copy and run [`supabase_schema.sql`](file:///mnt/datasheets/SIH_2026%20%28Copy%29/data/supabase_schema.sql) to create all 6 tables, indexes, RLS policies, and Realtime publications.
4. Copy and run [`supabase_seed.sql`](file:///mnt/datasheets/SIH_2026%20%28Copy%29/data/supabase_seed.sql) to populate initial threat alerts, bot health statuses, and blockchain verification proofs.
5. *(Optional)* Go to **Table Editor** -> `network_flows` -> **Import data via CSV** and select [`flows/sample_mixed_flows.csv`](file:///mnt/datasheets/SIH_2026%20%28Copy%29/data/flows/sample_mixed_flows.csv).

### Method 2: Command-Line Seeder
Set your environment variables in `.env`:
```bash
SUPABASE_URL="https://xyzcompany.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
```
Run the automated seeder:
```bash
python3 data/seed_supabase.py
```

---

## 🛠️ Data Engineering Utilities

### 1. Validate All Datasets
Runs schema, IP, port range, entropy, and consistency checks across all CSV, JSON, and PCAP files:
```bash
python3 data/validate_datasets.py
```

### 2. Generate Stratified ML Splits
Splits `flows/sample_mixed_flows.json` into 70% Train, 15% Val, 15% Test with balanced class ratios:
```bash
python3 data/preprocess_and_split.py
```

### 3. Extract Flows from Any Raw PCAP
Parses raw packet frames into bidirectional 5-tuple flows with extracted metrics:
```bash
python3 data/pcap_to_flow.py data/pcaps/sample_threats.pcap -o extracted_flows.csv
```

### 4. Regenerate Datasets
Re-synthesizes all vectors, baselines, and scenario captures:
```bash
python3 data/generate_datasets.py
```

---

## 🗄️ Database Tables & Schema Reference

| Table Name | Primary Key | Description | Realtime Enabled |
| :--- | :--- | :--- | :---: |
| **`network_flows`** | `id` (UUID) | Bidirectional flow telemetry, duration, packet rates, TCP flags, and threat labels | ✅ Yes |
| **`threat_alerts`** | `id` (UUID) | Fused threat alerts with confidence scores, contributing bot breakdown, and on-chain TX hashes | ✅ Yes |
| **`bot_metrics`** | `id` (UUID) | Operational health, latency (ms), CPU/memory, throughput, and accuracy of the 6 AI bots | ✅ Yes |
| **`blockchain_logs`**| `id` (UUID) | Cryptographic audit trail linking alert hashes to EVM smart contract block numbers | ❌ No |
| **`dga_domains`** | `id` (UUID) | Labeled algorithmic domain samples with Shannon entropy and vowel ratio metrics | ❌ No |
| **`dns_queries`** | `id` (UUID) | DNS telemetry logs for tunneling and covert exfiltration channel detection | ❌ No |
