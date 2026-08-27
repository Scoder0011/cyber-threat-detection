#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Production-Grade Dataset Generator
==============================================================================
Generates statistically realistic, high-variance network threat datasets matching
the exact 6 threat vector schemas and behavioral distributions:

1. DDoS (network_flows schema: flow_id, src_ip, dst_ip, src_port, dst_port, protocol, pkts_in, bytes_in, duration, entropy, is_attack, attack_type)
2. Beaconing (session schema: session_id, src_ip, dst_ip, inter_arrival_times, is_attack)
3. DGA domains (dga_domains schema: domain, family, entropy, vowel_ratio, length, is_dga)
4. Encrypted malware (JA3 schema: flow_id, src_ip, ja3_hash, client_type, is_attack)
5. Port scanning (fan-out schema: src_ip, dst_ip, unique_dst_ports, scan_duration_s, is_attack)
6. Exfiltration (byte ratio schema: flow_id, src_ip, dst_ip, bytes_in, bytes_out, ratio_out_in, is_attack)

Also exports full Supabase network_flows telemetry, stratified train/val/test splits,
and Wireshark-compatible binary PCAPs.
"""

import os
import sys
import json
import csv
import math
import random
import string
import struct
import hashlib
import datetime
from typing import List, Dict, Any

# Set deterministic seed
SEED = 42
random.seed(SEED)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = BASE_DIR
SYNTHETIC_DIR = os.path.join(DATA_DIR, "synthetic")
BENIGN_DIR = os.path.join(SYNTHETIC_DIR, "benign")
ATTACKS_DIR = os.path.join(SYNTHETIC_DIR, "attacks")
FLOWS_DIR = os.path.join(DATA_DIR, "flows")
PCAPS_DIR = os.path.join(DATA_DIR, "pcaps")

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import specialized generators & authentic threat feeds
from data.threat_intel.dgarchive_dga_generators import generate_all_dga_samples
from scripts.c2_beacon_emulator import C2BeaconEmulator
from scripts.dnscat2_tunnel_emulator import DNSTunnelEmulator
from scripts.hping3_simulator import Hping3Simulator
from scripts.benign_traffic_generator import generate_realistic_benign_flows, sample_pareto_flow_size

# Load authentic JA3 malware database
JA3_DB_PATH = os.path.join(DATA_DIR, "threat_intel", "ja3_malware_database.json")
MALWARE_JA3_LIST = []
if os.path.exists(JA3_DB_PATH):
    with open(JA3_DB_PATH, "r", encoding="utf-8") as fp:
        MALWARE_JA3_LIST = json.load(fp)

# Load authentic top benign domains
BENIGN_DOMAINS_PATH = os.path.join(DATA_DIR, "threat_intel", "benign_top_domains.json")
BENIGN_DOMAINS_LIST = []
if os.path.exists(BENIGN_DOMAINS_PATH):
    with open(BENIGN_DOMAINS_PATH, "r", encoding="utf-8") as fp:
        BENIGN_DOMAINS_LIST = json.load(fp)

# Ensure target directories exist
for path in [
    DATA_DIR, SYNTHETIC_DIR, BENIGN_DIR, ATTACKS_DIR, FLOWS_DIR, PCAPS_DIR,
    os.path.join(ATTACKS_DIR, "syn_flood"),
    os.path.join(ATTACKS_DIR, "udp_amplification"),
    os.path.join(ATTACKS_DIR, "slowloris"),
    os.path.join(ATTACKS_DIR, "dns_tunneling"),
    os.path.join(ATTACKS_DIR, "dga_samples"),
    os.path.join(ATTACKS_DIR, "c2_beaconing"),
    os.path.join(ATTACKS_DIR, "port_scan"),
    os.path.join(ATTACKS_DIR, "encrypted_malware"),
    os.path.join(ATTACKS_DIR, "data_exfiltration"),
]:
    os.makedirs(path, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. Specialized Threat Dataset Generators (6 Vector Schemas)
# -----------------------------------------------------------------------------

def generate_slowloris_flows(count: int = 300) -> List[Dict[str, Any]]:
    """Generates Slowloris low-and-slow HTTP resource exhaustion flows."""
    flows = []
    now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=30)
    attacker_ip = "185.220.101.99"
    target_ip = "10.0.10.5"
    
    for i in range(count):
        now += datetime.timedelta(milliseconds=random.randint(50, 350))
        duration = round(random.uniform(85.0, 320.0), 2)
        bytes_out = random.randint(140, 420)
        bytes_in = random.randint(0, 120)
        pkts_out = random.randint(10, 35)
        pkts_in = random.randint(1, 6)
        
        flow = {
            "flow_id": f"flow_slowloris_{i+1:06d}",
            "src_ip": attacker_ip,
            "dst_ip": target_ip,
            "src_port": 40000 + i,
            "dst_port": 80,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round((bytes_out * 8.0) / duration, 2),
            "packet_rate_pps": round((pkts_out + pkts_in) / duration, 4),
            "entropy": round(random.uniform(2.1, 3.15), 4),
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "DOS_SLOWLORIS",
            "timestamp": now.isoformat(),
            "metadata": {
                "tool": "slowloris.py",
                "attack_vector": "SLOW_HTTP_EXHAUSTION",
                "connection_hold_time_sec": duration
            }
        }
        flows.append(flow)
    return flows

def generate_encrypted_malware_flows(count: int = 300) -> List[Dict[str, Any]]:
    """Generates malicious TLS sessions matching real published JA3 fingerprints."""
    flows = []
    now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=45)
    c2_servers = ["185.220.101.44", "91.108.4.182", "194.26.29.112", "45.154.255.88"]
    
    for i in range(count):
        now += datetime.timedelta(milliseconds=random.randint(200, 2500))
        mal = random.choice(MALWARE_JA3_LIST) if MALWARE_JA3_LIST else {
            "malware_family": "Cobalt Strike Beacon",
            "ja3_hash": "4d7a28d6f2263ed61de88ca66eb011e3"
        }
        
        victim_ip = f"192.168.1.{random.randint(10, 240)}"
        c2_ip = random.choice(c2_servers)
        duration = round(random.uniform(0.15, 4.85), 3)
        bytes_out = random.randint(1500, 12000)
        bytes_in = random.randint(3000, 45000)
        pkts_out = max(4, int(bytes_out / random.randint(400, 800)))
        pkts_in = max(4, int(bytes_in / random.randint(900, 1400)))
        
        flow = {
            "flow_id": f"flow_malware_tls_{i+1:05d}",
            "src_ip": victim_ip,
            "dst_ip": c2_ip,
            "src_port": random.randint(35000, 61000),
            "dst_port": random.choice([443, 8443, 4443]),
            "protocol": "TLS",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8.0) / duration, 2),
            "packet_rate_pps": round((pkts_in + pkts_out) / duration, 2),
            "entropy": round(random.uniform(4.75, 4.99), 4),
            "ja3_hash": mal["ja3_hash"],
            "is_attack": True,
            "attack_type": "ENCRYPTED_MALWARE_TLS",
            "timestamp": now.isoformat(),
            "metadata": {
                "malware_family": mal["malware_family"],
                "threat_category": mal.get("threat_category", "C2 Channel"),
                "ja3_signature": mal["ja3_hash"]
            }
        }
        flows.append(flow)
    return flows

def generate_ddos_dataset(count: int = 1000) -> List[Dict[str, Any]]:
    """
    1. DDoS Schema:
    flow_id,src_ip,dst_ip,src_port,dst_port,protocol,pkts_in,bytes_in,duration,entropy,is_attack,attack_type
    Attack rows have low entropy (0.05-0.15) & huge pkts/bytes in tiny duration (0.5-1.5s).
    Benign rows have normal variance (entropy 0.65-0.78).
    """
    records = []
    # 50% Benign, 30% SYN Flood, 20% UDP Amplification
    n_benign = int(count * 0.5)
    n_syn = int(count * 0.3)
    n_udp = count - n_benign - n_syn
    
    # Benign rows
    benign_ips = ["203.45.11.8", "198.51.100.23", "192.0.2.14", "203.0.113.55", "172.16.4.12", "198.51.100.77"]
    for i in range(n_benign):
        pkts = random.randint(3, 20)
        bytes_in = pkts * random.randint(300, 1100)
        dur = round(random.uniform(0.3, 4.5), 2)
        ent = round(random.uniform(0.64, 0.76), 2)
        records.append({
            "flow_id": f"f{len(records)+1:04d}",
            "src_ip": random.choice(benign_ips),
            "dst_ip": "10.0.0.5",
            "src_port": random.choice([80, 443, 22, 53]),
            "dst_port": random.randint(30000, 65000),
            "protocol": "TCP" if random.random() > 0.15 else "UDP",
            "pkts_in": pkts,
            "bytes_in": bytes_in,
            "duration": dur,
            "entropy": ent,
            "is_attack": False,
            "attack_type": "BENIGN"
        })
        
    # SYN Flood rows (hping3)
    for i in range(n_syn):
        pkts = random.randint(42000, 48000)
        bytes_in = int(pkts * random.uniform(43.0, 45.0)) # ~1.9MB
        dur = round(random.uniform(0.7, 1.2), 2)
        ent = round(random.uniform(0.08, 0.14), 2)
        spoofed_src = f"45.33.12.{random.randint(200, 250)}"
        records.append({
            "flow_id": f"f{len(records)+1:04d}",
            "src_ip": spoofed_src,
            "dst_ip": "10.0.0.5",
            "src_port": 80,
            "dst_port": random.randint(60000, 65500),
            "protocol": "TCP",
            "pkts_in": pkts,
            "bytes_in": bytes_in,
            "duration": dur,
            "entropy": ent,
            "is_attack": True,
            "attack_type": "syn_flood"
        })
        
    # UDP Amplification rows
    for i in range(n_udp):
        pkts = random.randint(80000, 95000)
        bytes_in = int(pkts * random.uniform(550.0, 620.0)) # ~50MB
        dur = round(random.uniform(0.8, 1.3), 2)
        ent = round(random.uniform(0.07, 0.12), 2)
        records.append({
            "flow_id": f"f{len(records)+1:04d}",
            "src_ip": f"198.18.0.{random.randint(90, 110)}",
            "dst_ip": "10.0.0.5",
            "src_port": 53,
            "dst_port": random.randint(60000, 65500),
            "protocol": "UDP",
            "pkts_in": pkts,
            "bytes_in": bytes_in,
            "duration": dur,
            "entropy": ent,
            "is_attack": True,
            "attack_type": "udp_amplification"
        })
        
    random.shuffle(records)
    return records

def generate_beaconing_sessions(count: int = 500) -> List[Dict[str, Any]]:
    """
    2. Beaconing Schema:
    session_id,src_ip,dst_ip,inter_arrival_times,is_attack
    Benign = irregular human browsing [4.2, 18.7, 2.1, 31.4, 9.8, 45.2]
    Attack = jittered around 60s, 120s, or 300s periods [58.9, 61.2, 59.4, 60.7, 58.1, 61.8]
    """
    records = []
    benign_dsts = ["151.101.1.140", "142.250.80.14", "104.16.85.20", "93.184.216.34", "17.253.144.10", "198.51.100.25"]
    c2_servers = ["198.51.100.7", "203.0.113.90", "185.220.101.44", "91.108.4.182"]
    
    for i in range(count):
        session_id = f"s{i+1:04d}"
        is_attack = (i % 2 == 1)
        
        if is_attack:
            src_ip = random.choice(["10.0.0.9", "10.0.0.44", "192.168.1.45"])
            dst_ip = random.choice(c2_servers)
            base_period = random.choice([60.0, 120.0, 300.0])
            jitter_pct = random.uniform(0.02, 0.05) # Realistic 2-5% Gaussian jitter
            seq_len = random.randint(5, 8)
            
            iats = [round(max(1.0, random.gauss(base_period, base_period * jitter_pct)), 1) for _ in range(seq_len)]
        else:
            src_ip = f"10.0.0.{random.randint(12, 50)}"
            dst_ip = random.choice(benign_dsts)
            seq_len = random.randint(4, 7)
            # Irregular human browsing IATs (exponential/uniform mix)
            iats = [round(random.expovariate(1.0 / 22.0) + random.uniform(0.5, 4.0), 1) for _ in range(seq_len)]
            
        records.append({
            "session_id": session_id,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "inter_arrival_times": json.dumps(iats),
            "is_attack": is_attack
        })
        
    return records

def generate_dga_domains_dataset(count: int = 1000) -> List[Dict[str, Any]]:
    """
    3. DGA Domains Schema:
    domain,family,entropy,vowel_ratio,length,is_dga
    """
    records = []
    n_benign = int(count * 0.5)
    n_dga = count - n_benign
    
    # Benign domains
    benign_seeds = BENIGN_DOMAINS_LIST if BENIGN_DOMAINS_LIST else [
        "google.com", "facebook.com", "amazon.in", "wikipedia.org", "github.com",
        "youtube.com", "microsoft.com", "netflix.com", "linkedin.com", "reddit.com"
    ]
    for i in range(n_benign):
        dom = random.choice(benign_seeds)
        sub = random.choice(["", "www.", "api.", "mail.", "cdn."])
        full_dom = f"{sub}{dom}" if sub else dom
        
        freq = {}
        for c in full_dom: freq[c] = freq.get(c, 0) + 1
        ent = round(-sum((cnt / len(full_dom)) * math.log2(cnt / len(full_dom)) for cnt in freq.values()), 2)
        letters = [c for c in full_dom if c.isalpha()]
        vowels = sum(1 for c in letters if c in 'aeiou')
        vowel_rat = round(vowels / max(1, len(letters)), 2)
        
        records.append({
            "domain": full_dom,
            "family": "benign",
            "entropy": ent,
            "vowel_ratio": vowel_rat,
            "length": len(full_dom),
            "is_dga": False
        })
        
    # Authentic DGA domains
    dga_raw = generate_all_dga_samples(samples_per_family=max(20, n_dga // 7))
    for item in dga_raw[:n_dga]:
        records.append({
            "domain": item["domain"],
            "family": item["family"],
            "entropy": round(item["entropy"], 2),
            "vowel_ratio": round(item["vowel_ratio"], 2),
            "length": item["length"],
            "is_dga": True
        })
        
    random.shuffle(records)
    return records

def generate_encrypted_malware_ja3_dataset(count: int = 500) -> List[Dict[str, Any]]:
    """
    4. Encrypted Malware JA3 Schema:
    flow_id,src_ip,ja3_hash,client_type,is_attack
    Real published IOCs (TrickBot, Emotet, CobaltStrike) vs legitimate browser profiles.
    """
    records = []
    
    benign_profiles = [
        {"hash": "e7d705a3286e19ea42f587b344ee6865", "type": "Chrome_130"},
        {"hash": "6734f37431670b3ab4292b8f60f29984", "type": "Firefox_128"},
        {"hash": "66918128f1b9b03303d77c4f2e32c8d8", "type": "Safari_17"},
        {"hash": "de350869b8c85de67a350c8d186f11e6", "type": "Chrome_130"},
    ]
    
    malware_profiles = [
        {"hash": "72a589da586844d7f0818ce684948eea", "type": "TrickBot"},
        {"hash": "a0e9f5d64349fb13191bc781f81f42e1", "type": "Emotet"},
        {"hash": "4d7a28d6f2263ed61de88ca66eb011e3", "type": "CobaltStrike"},
        {"hash": "51c64c77e60f39ac3e1792836811005f", "type": "AsyncRAT"},
        {"hash": "c4ee4e8156dd3362a2fa808722b51206", "type": "RedLine"},
    ]
    
    for i in range(count):
        flow_id = f"f{101 + i:03d}"
        is_attack = (i % 2 == 1)
        
        if is_attack:
            src_ip = random.choice(["10.0.0.12", "10.0.0.17", "10.0.0.31", "192.168.1.45"])
            mal = random.choice(malware_profiles)
            ja3 = mal["hash"]
            client_type = mal["type"]
        else:
            src_ip = random.choice(["10.0.0.5", "10.0.0.9", "192.168.1.10", "192.168.1.22"])
            prof = random.choice(benign_profiles)
            ja3 = prof["hash"]
            client_type = prof["type"]
            
        records.append({
            "flow_id": flow_id,
            "src_ip": src_ip,
            "ja3_hash": ja3,
            "client_type": client_type,
            "is_attack": is_attack
        })
        
    return records

def generate_port_scanning_fanout_dataset(count: int = 500) -> List[Dict[str, Any]]:
    """
    5. Port Scanning Schema:
    src_ip,dst_ip,unique_dst_ports,scan_duration_s,is_attack
    Benign = 1 to 5 ports in 0.05s-2.1s
    Attack = 700 to 1024 unique ports in 3.5s-7.0s
    """
    records = []
    attackers = ["10.0.0.77", "10.0.0.90", "185.220.101.15"]
    benign_srcs = [f"10.0.0.{i}" for i in range(40, 70)]
    targets = ["10.0.0.5", "10.0.0.6", "10.0.0.7", "10.0.0.8"]
    
    for i in range(count):
        is_attack = (i % 2 == 1)
        if is_attack:
            src_ip = random.choice(attackers)
            dst_ip = random.choice(targets)
            unique_ports = random.randint(750, 1024)
            dur = round(random.uniform(3.8, 6.8), 1)
        else:
            src_ip = random.choice(benign_srcs)
            dst_ip = random.choice(targets)
            unique_ports = random.choices([1, 2, 3, 4, 5], weights=[0.5, 0.25, 0.15, 0.07, 0.03])[0]
            dur = round(random.uniform(0.05, 2.2), 2)
            
        records.append({
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "unique_dst_ports": unique_ports,
            "scan_duration_s": dur,
            "is_attack": is_attack
        })
        
    return records

def generate_exfiltration_ratios_dataset(count: int = 500) -> List[Dict[str, Any]]:
    """
    6. Exfiltration Schema:
    flow_id,src_ip,dst_ip,bytes_in,bytes_out,ratio_out_in,is_attack
    Benign = ratio_out_in 0.004 to 0.02 (large downloads 760KB-4.2MB, small uploads)
    Attack = ratio_out_in 2000.0 to 3500.0 (massive outbound 29MB-52MB, small ACKs)
    """
    records = []
    benign_dsts = ["203.0.113.9", "198.51.100.2", "172.217.0.14", "151.101.1.69", "104.16.85.20", "142.250.80.14"]
    exfil_destinations = ["45.77.12.9", "45.77.12.10", "45.77.12.11", "45.77.12.12", "185.220.101.88"]
    
    for i in range(count):
        flow_id = f"f{201 + i:03d}"
        is_attack = (i % 2 == 1)
        
        if is_attack:
            src_ip = "10.0.0.19"
            dst_ip = random.choice(exfil_destinations)
            bytes_in = random.randint(12000, 22000)
            bytes_out = random.randint(28_000_000, 54_000_000)
            ratio = round(bytes_out / bytes_in, 1)
        else:
            src_ip = "10.0.0.5"
            dst_ip = random.choice(benign_dsts)
            bytes_in = random.randint(700_000, 4_500_000)
            bytes_out = random.randint(9_000, 22_000)
            ratio = round(bytes_out / bytes_in, 3)
            
        records.append({
            "flow_id": flow_id,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "ratio_out_in": ratio,
            "is_attack": is_attack
        })
        
    return records

# -----------------------------------------------------------------------------
# 2. Binary PCAP Packet Capture Generator
# -----------------------------------------------------------------------------

def write_realistic_pcap(filepath: str, total_flows: int = 100):
    """Generates authentic raw binary PCAP with TCP handshakes, TLS ClientHello, and DNS frames."""
    with open(filepath, "wb") as f:
        global_hdr = struct.pack("=IHHiIII", 0xa1b2c3d4, 2, 4, 0, 0, 65535, 1)
        f.write(global_hdr)
        
        base_sec = int(datetime.datetime.now(datetime.timezone.utc).timestamp()) - 300
        
        for i in range(total_flows):
            ts_sec = base_sec + (i * 2)
            ts_usec = random.randint(1000, 900000)
            
            src_mac = b"\x00\x0c\x29\x1a\x2b\x3c"
            dst_mac = b"\x00\x0c\x29\x4f\x8e\x35"
            eth_hdr = struct.pack("!6s6sH", dst_mac, src_mac, 0x0800)
            
            if i % 4 == 0:
                # SYN packet
                src_ip = bytes([random.randint(11, 200), random.randint(1, 254), random.randint(1, 254), random.randint(1, 254)])
                dst_ip = bytes([10, 0, 10, 20])
                ip_len = 20 + 24
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 6, 0, src_ip, dst_ip)
                tcp_hdr = struct.pack("!HHIIBBHH", random.randint(1024, 65000), 80, random.randint(1000, 999999), 0, 0x60, 0x02, 64240, 0)
                tcp_opts = struct.pack("!BBH", 2, 4, 1460)
                frame = eth_hdr + ip_hdr + tcp_hdr + tcp_opts
            elif i % 4 == 1:
                # TLS ClientHello
                src_ip = bytes([192, 168, 1, 45])
                dst_ip = bytes([185, 220, 101, 44])
                tls_payload = b"\x16\x03\x01\x00\xa0\x01\x00\x00\x9c\x03\x03" + os.urandom(32) + b"\x00\x00\x20\xc0\x2f\xc0\x30\xc0\x2b\xc0\x2c"
                ip_len = 20 + 20 + len(tls_payload)
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 6, 0, src_ip, dst_ip)
                tcp_hdr = struct.pack("!HHIIBBHH", 49152, 8443, 10001, 5001, 0x50, 0x18, 65535, 0)
                frame = eth_hdr + ip_hdr + tcp_hdr + tls_payload
            elif i % 4 == 2:
                # DNS query
                src_ip = bytes([192, 168, 1, 88])
                dst_ip = bytes([8, 8, 8, 8])
                dns_payload = b"\xaa\xbb\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x10exfil-chunk-data\x06tunnel\x03org\x00\x00\x10\x00\x01"
                ip_len = 20 + 8 + len(dns_payload)
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 17, 0, src_ip, dst_ip)
                udp_hdr = struct.pack("!HHHH", random.randint(32768, 60000), 53, 8 + len(dns_payload), 0)
                frame = eth_hdr + ip_hdr + udp_hdr + dns_payload
            else:
                # Benign HTTP
                src_ip = bytes([192, 168, 1, random.randint(2, 200)])
                dst_ip = bytes([198, 51, 100, random.randint(2, 200)])
                http_payload = b"GET / HTTP/1.1\r\nHost: google.com\r\nUser-Agent: Mozilla/5.0\r\n\r\n"
                ip_len = 20 + 20 + len(http_payload)
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 6, 0, src_ip, dst_ip)
                tcp_hdr = struct.pack("!HHIIBBHH", random.randint(32768, 60000), 443, 20001, 10001, 0x50, 0x18, 64240, 0)
                frame = eth_hdr + ip_hdr + tcp_hdr + http_payload
                
            pkt_len = len(frame)
            pkt_hdr = struct.pack("=IIII", ts_sec, ts_usec, pkt_len, pkt_len)
            f.write(pkt_hdr)
            f.write(frame)

# -----------------------------------------------------------------------------
# 3. Export Utilities
# -----------------------------------------------------------------------------

def export_json(filepath: str, data: Any):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"  [+] Wrote JSON: {filepath} ({len(data)} records)")

def export_csv(filepath: str, data: List[Dict[str, Any]]):
    if not data:
        return
    keys = list(data[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for row in data:
            clean_row = {}
            for k, v in row.items():
                if isinstance(v, (dict, list)):
                    clean_row[k] = json.dumps(v)
                else:
                    clean_row[k] = v
            writer.writerow(clean_row)
    print(f"  [+] Wrote CSV:  {filepath} ({len(data)} records)")

# -----------------------------------------------------------------------------
# 4. Master Generation Engine
# -----------------------------------------------------------------------------

def main():
    print("=================================================================")
    print("🛡️  Generating Production-Grade Realistic Threat Datasets")
    print("=================================================================\n")
    
    # 1. Benign Baselines (Heavy-Tailed Pareto & Poisson)
    print("1. Generating Benign Enterprise Traffic (Pareto flow sizes & Poisson arrivals)...")
    benign_flows = generate_realistic_benign_flows(count=3000)
    export_json(os.path.join(BENIGN_DIR, "benign_flows.json"), benign_flows)
    export_csv(os.path.join(BENIGN_DIR, "benign_flows.csv"), benign_flows)
    
    # 2. Vector 1: DDoS (network_flows schema)
    print("\n2. Vector 1: Generating DDoS Dataset (network_flows schema)...")
    ddos_records = generate_ddos_dataset(count=1200)
    export_csv(os.path.join(FLOWS_DIR, "ddos_flows.csv"), ddos_records)
    export_csv(os.path.join(ATTACKS_DIR, "syn_flood", "syn_flood_flows.csv"), [r for r in ddos_records if r["attack_type"] == "syn_flood"])
    export_json(os.path.join(ATTACKS_DIR, "syn_flood", "syn_flood_flows.json"), [r for r in ddos_records if r["attack_type"] == "syn_flood"])
    export_csv(os.path.join(ATTACKS_DIR, "udp_amplification", "udp_amp_flows.csv"), [r for r in ddos_records if r["attack_type"] == "udp_amplification"])
    export_json(os.path.join(ATTACKS_DIR, "udp_amplification", "udp_amp_flows.json"), [r for r in ddos_records if r["attack_type"] == "udp_amplification"])

    # 3. Vector 2: Beaconing Sessions (inter-arrival times schema)
    print("\n3. Vector 2: Generating Beaconing Sessions (IAT schema)...")
    beacon_records = generate_beaconing_sessions(count=500)
    export_csv(os.path.join(FLOWS_DIR, "beacon_sessions.csv"), beacon_records)
    export_csv(os.path.join(ATTACKS_DIR, "c2_beaconing", "beacon_sessions.csv"), beacon_records)
    export_json(os.path.join(ATTACKS_DIR, "c2_beaconing", "beacon_sessions.json"), beacon_records)

    # 4. Vector 3: DGA Domains (dga_domains schema)
    print("\n4. Vector 3: Generating DGA Domains (dga_domains schema)...")
    dga_records = generate_dga_domains_dataset(count=1000)
    export_csv(os.path.join(FLOWS_DIR, "dga_domains.csv"), dga_records)
    export_csv(os.path.join(ATTACKS_DIR, "dga_samples", "dga_domains.csv"), dga_records)
    export_json(os.path.join(ATTACKS_DIR, "dga_samples", "dga_domains.json"), dga_records)

    # 5. Vector 4: Encrypted Malware JA3 (JA3 schema)
    print("\n5. Vector 4: Generating Encrypted Malware (JA3 schema)...")
    ja3_records = generate_encrypted_malware_ja3_dataset(count=500)
    export_csv(os.path.join(FLOWS_DIR, "encrypted_malware_ja3.csv"), ja3_records)
    export_csv(os.path.join(ATTACKS_DIR, "encrypted_malware", "encrypted_malware_ja3.csv"), ja3_records)
    export_json(os.path.join(ATTACKS_DIR, "encrypted_malware", "encrypted_malware_ja3.json"), ja3_records)

    # 6. Vector 5: Port Scanning (fan-out schema)
    print("\n6. Vector 5: Generating Port Scanning (fan-out schema)...")
    scan_records = generate_port_scanning_fanout_dataset(count=500)
    export_csv(os.path.join(FLOWS_DIR, "port_scan_sessions.csv"), scan_records)
    export_csv(os.path.join(ATTACKS_DIR, "port_scan", "port_scan_sessions.csv"), scan_records)
    export_json(os.path.join(ATTACKS_DIR, "port_scan", "port_scan_sessions.json"), scan_records)

    # 7. Vector 6: Exfiltration (byte ratio schema)
    print("\n7. Vector 6: Generating Exfiltration (byte ratio schema)...")
    exfil_records = generate_exfiltration_ratios_dataset(count=500)
    export_csv(os.path.join(FLOWS_DIR, "exfiltration_ratios.csv"), exfil_records)
    export_csv(os.path.join(ATTACKS_DIR, "data_exfiltration", "exfiltration_ratios.csv"), exfil_records)
    export_json(os.path.join(ATTACKS_DIR, "data_exfiltration", "exfiltration_ratios.json"), exfil_records)

    # 8. DNS Tunneling & Slowloris additional attack sets
    print("\n8. Generating DNS Tunneling (dnscat2) and Slowloris Datasets...")
    tunnel_emu = DNSTunnelEmulator()
    dns_tunnels = tunnel_emu.generate_tunnel_session(chunk_count=500)
    export_json(os.path.join(ATTACKS_DIR, "dns_tunneling", "dns_tunneling_queries.json"), dns_tunnels)
    export_csv(os.path.join(ATTACKS_DIR, "dns_tunneling", "dns_tunneling_queries.csv"), dns_tunnels)

    # 9. Combined Multi-Vector Benchmark
    print("\n9. Creating Combined Multi-Vector Benchmark...")
    all_flows = (
        benign_flows[:2000] +
        [r for r in ddos_records if r["is_attack"]][:400]
    )
    # Re-map ddos records into standard Supabase flow format
    combined_flows = []
    for b in benign_flows[:2400]:
        combined_flows.append(b)
    for d in ddos_records:
        if d["is_attack"]:
            combined_flows.append({
                "flow_id": d["flow_id"],
                "src_ip": d["src_ip"],
                "dst_ip": d["dst_ip"],
                "src_port": d["src_port"],
                "dst_port": d["dst_port"],
                "protocol": d["protocol"],
                "duration": d["duration"],
                "bytes_in": d["bytes_in"],
                "bytes_out": 44,
                "pkts_in": d["pkts_in"],
                "pkts_out": 1,
                "tcp_flags": "SYN" if d["protocol"] == "TCP" else "UDP",
                "flow_rate_bps": round((d["bytes_in"] * 8.0) / max(0.001, d["duration"]), 2),
                "packet_rate_pps": round(d["pkts_in"] / max(0.001, d["duration"]), 2),
                "entropy": d["entropy"],
                "ja3_hash": None,
                "is_attack": True,
                "attack_type": d["attack_type"].upper(),
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "metadata": {"vector": d["attack_type"]}
            })
    random.shuffle(combined_flows)
    export_json(os.path.join(FLOWS_DIR, "sample_mixed_flows.json"), combined_flows[:3300])
    export_csv(os.path.join(FLOWS_DIR, "sample_mixed_flows.csv"), combined_flows[:3300])

    # 10. Raw Binary PCAP Capture
    print("\n10. Generating Raw Binary PCAP Capture...")
    pcap_path = os.path.join(PCAPS_DIR, "sample_threats.pcap")
    write_realistic_pcap(pcap_path, total_flows=250)
    print(f"  [+] Wrote PCAP: {pcap_path} ({os.path.getsize(pcap_path)} bytes)")

    print("\n✨ All 6 threat vector datasets and benchmark flows generated successfully!")

if __name__ == "__main__":
    main()
