#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Supabase Seeding Script
===================================================================
Seeds synthetic datasets and baseline tables directly into Supabase via:
1. Direct PostgreSQL Connection (`DATABASE_URL` / `SUPABASE_DB_URL` with psycopg2/asyncpg/sqlalchemy)
2. Supabase REST / PostgREST API (`SUPABASE_URL` + `SUPABASE_SERVICE_KEY`)
3. Fallback: Outputs executable SQL scripts for the Supabase SQL Editor.

Usage:
  python3 seed_supabase.py [--method rest|postgres|sql]
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCHEMA_FILE = os.path.join(BASE_DIR, "supabase_schema.sql")
SEED_FILE = os.path.join(BASE_DIR, "supabase_seed.sql")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", os.environ.get("SUPABASE_KEY", ""))
DATABASE_URL = os.environ.get("DATABASE_URL", os.environ.get("SUPABASE_DB_URL", ""))

def seed_via_rest(supabase_url, service_key):
    """Seeds tables using Supabase PostgREST endpoints."""
    print(f"Connecting to Supabase REST API: {supabase_url}...")
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    # 1. Seed Bot Metrics
    bot_metrics_data = [
        {"bot_name": "ddos_bot", "display_name": "DDoS & DoS Specialist", "status": "HEALTHY", "latency_ms": 1.25, "cpu_percent": 4.2, "memory_mb": 145.0, "predictions_count": 154200, "threats_detected": 243, "accuracy_score": 0.9920, "f1_score": 0.9890},
        {"bot_name": "beaconing_bot", "display_name": "C2 Beaconing Detector", "status": "HEALTHY", "latency_ms": 2.10, "cpu_percent": 6.8, "memory_mb": 180.5, "predictions_count": 98400, "threats_detected": 89, "accuracy_score": 0.9850, "f1_score": 0.9810},
        {"bot_name": "dga_dns_bot", "display_name": "DGA DNS Classifier", "status": "HEALTHY", "latency_ms": 0.85, "cpu_percent": 3.1, "memory_mb": 112.0, "predictions_count": 342100, "threats_detected": 512, "accuracy_score": 0.9940, "f1_score": 0.9930},
        {"bot_name": "encrypted_malware_bot", "display_name": "Encrypted Malware & TLS Bot", "status": "HEALTHY", "latency_ms": 3.40, "cpu_percent": 8.5, "memory_mb": 220.0, "predictions_count": 67800, "threats_detected": 74, "accuracy_score": 0.9780, "f1_score": 0.9750},
        {"bot_name": "scanning_bot", "display_name": "Reconnaissance & Scan Bot", "status": "HEALTHY", "latency_ms": 1.10, "cpu_percent": 3.8, "memory_mb": 130.2, "predictions_count": 210500, "threats_detected": 318, "accuracy_score": 0.9880, "f1_score": 0.9860},
        {"bot_name": "exfiltration_bot", "display_name": "Data Exfiltration Guardian", "status": "HEALTHY", "latency_ms": 2.80, "cpu_percent": 5.4, "memory_mb": 165.8, "predictions_count": 89300, "threats_detected": 42, "accuracy_score": 0.9820, "f1_score": 0.9790},
    ]
    
    endpoint = f"{supabase_url}/rest/v1/bot_metrics"
    req = urllib.request.Request(endpoint, data=json.dumps(bot_metrics_data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  [✓] Successfully seeded bot_metrics ({resp.status})")
    except urllib.error.HTTPError as e:
        print(f"  [!] HTTP Error seeding bot_metrics: {e.code} - {e.read().decode('utf-8')}")

    # 2. Seed Threat Alerts
    alerts_data = [
        {
            "alert_id": "alert_2026_001",
            "title": "Massive Distributed SYN Flood Detected",
            "description": "Multi-source TCP SYN flood exceeding 20,000 pps targeting border gateway web service.",
            "severity": "CRITICAL",
            "attack_type": "DDOS_SYN_FLOOD",
            "source_ip": "198.51.100.0/24 (Botnet)",
            "target_ip": "10.0.10.20",
            "target_port": 80,
            "confidence_score": 0.9890,
            "contributing_bots": ["ddos_bot"],
            "bot_scores": {"ddos_bot": 0.995, "scanning_bot": 0.32},
            "evidence": {"pps": 24500, "syn_ack_ratio": 99.8, "unique_sources": 512},
            "status": "NEW",
            "blockchain_tx_hash": "0x7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef0123456789",
            "blockchain_verified": True,
            "blockchain_block_num": 19450231
        },
        {
            "alert_id": "alert_2026_002",
            "title": "Cobalt Strike C2 Beaconing Channel Active",
            "description": "Deterministic periodic callback pattern every 10.0s detected with Cobalt Strike JA3 signature.",
            "severity": "HIGH",
            "attack_type": "C2_BEACONING",
            "source_ip": "192.168.1.45",
            "target_ip": "185.220.101.44",
            "target_port": 8443,
            "confidence_score": 0.9650,
            "contributing_bots": ["beaconing_bot", "encrypted_malware_bot"],
            "bot_scores": {"beaconing_bot": 0.98, "encrypted_malware_bot": 0.95},
            "evidence": {"interval_sec": 10.0, "jitter": 0.02, "ja3": "a0e9f5d64349fb13191bc781f81f42e1"},
            "status": "INVESTIGATING",
            "blockchain_tx_hash": "0x4a1c7f99b2e048d3c67d821345e56789abcdef0123456789abcdef0123456789",
            "blockchain_verified": True,
            "blockchain_block_num": 19450245
        }
    ]
    endpoint = f"{supabase_url}/rest/v1/threat_alerts"
    req = urllib.request.Request(endpoint, data=json.dumps(alerts_data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  [✓] Successfully seeded threat_alerts ({resp.status})")
    except urllib.error.HTTPError as e:
        print(f"  [!] HTTP Error seeding threat_alerts: {e.code} - {e.read().decode('utf-8')}")

def print_manual_instructions():
    print("\n=================================================================")
    print("📋 SUPABASE MANUAL SETUP INSTRUCTIONS")
    print("=================================================================")
    print("1. Open your Supabase Dashboard: https://supabase.com/dashboard")
    print("2. Navigate to your Project -> 'SQL Editor'")
    print("3. Copy & paste the contents of:")
    print(f"   -> {SCHEMA_FILE}")
    print("   Click 'RUN' to create all tables, indexes, and Realtime publications.")
    print("4. Copy & paste the contents of:")
    print(f"   -> {SEED_FILE}")
    print("   Click 'RUN' to seed initial threat alerts, bot health, and blockchain records.")
    print("\n5. To import bulk flows via Table Editor:")
    print("   Navigate to 'Table Editor' -> 'network_flows' -> 'Import data via CSV'")
    print(f"   Upload: {os.path.join(BASE_DIR, 'flows', 'sample_mixed_flows.csv')}")
    print("=================================================================\n")

def main():
    parser = argparse.ArgumentParser(description="Seed Supabase database for Cyber Threat Detection")
    parser.add_argument("--method", choices=["rest", "sql", "instructions"], default="instructions")
    args = parser.parse_args()

    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        print("Detected Supabase environment variables! Running REST seeder...")
        seed_via_rest(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    else:
        print("No SUPABASE_URL and SUPABASE_SERVICE_KEY found in environment.")
        print_manual_instructions()

if __name__ == "__main__":
    main()
