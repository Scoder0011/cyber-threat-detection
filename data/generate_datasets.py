#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Synthetic Dataset Generator
========================================================================
Generates high-fidelity, statistically realistic synthetic datasets for:
1. Benign network baseline (HTTP/HTTPS, SSH, DNS, NTP, SMTP)
2. 6 Specialist Threat Vectors:
   - DDoS / DoS (SYN Flood, UDP Amplification, Slowloris)
   - C2 Beaconing (Periodic heartbeat & jitter)
   - DGA DNS (Algorithmic domains vs benign controls)
   - Encrypted Malware (JA3/JA4 TLS fingerprints)
   - Port Scanning & Recon (Horizontal subnet sweeps & vertical port scans)
   - Data Exfiltration (High-volume outbound & DNS tunneling)
3. Combined Multi-Vector Evaluation Flows (JSON, CSV)
4. Multi-Stage APT Attack Scenario (Recon -> C2 -> Exfil -> DDoS)
5. Binary PCAP packet capture (valid raw PCAP file)
6. Supabase PostgreSQL Seed SQL script (ready for Supabase SQL editor)

Zero external dependencies (uses standard Python library + optional NumPy).
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
import uuid
from datetime import datetime, timedelta, timezone

# Set deterministic random seed
SEED = 42
random.seed(SEED)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = BASE_DIR
SYNTHETIC_DIR = os.path.join(DATA_DIR, "synthetic")
BENIGN_DIR = os.path.join(SYNTHETIC_DIR, "benign")
ATTACKS_DIR = os.path.join(SYNTHETIC_DIR, "attacks")
FLOWS_DIR = os.path.join(DATA_DIR, "flows")
PCAPS_DIR = os.path.join(DATA_DIR, "pcaps")

# Ensure all directories exist
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
# Constant Catalogs & Realistic Profiles
# -----------------------------------------------------------------------------

BENIGN_DOMAINS = [
    "google.com", "microsoft.com", "apple.com", "amazon.com", "cloudflare.com",
    "github.com", "wikipedia.org", "netflix.com", "zoom.us", "linkedin.com",
    "youtube.com", "openai.com", "gitlab.com", "stackoverflow.com", "docker.com",
    "fastapi.tiangolo.com", "python.org", "supabase.com", "kernel.org", "debian.org",
    "ubuntu.com", "archlinux.org", "slack.com", "notion.so", "spotify.com",
    "reddit.com", "cloudflare-dns.com", "quad9.net", "akamai.net", "jsdelivr.net"
]

BENIGN_JA3 = [
    {"name": "Chrome 120+ (Windows)", "hash": "cd08e31494f9531f5c4d058b2297777b"},
    {"name": "Firefox 122+ (Linux)", "hash": "6b4e05b57f00693a1c6e1aa7dd31767e"},
    {"name": "Safari 17+ (macOS)", "hash": "439ea1914eb1d9fb9f82d2571217e573"},
    {"name": "Edge 120+ (Windows)", "hash": "773906b0efecd2e917d5237dda4e6d16"},
    {"name": "curl 8.5+ (Linux)", "hash": "2f42a5efbc3f82054ff346294b41b9ef"},
    {"name": "Python requests 2.31+", "hash": "9e107d9d372bb6826bd81d3542a419d6"},
]

MALWARE_JA3 = [
    {"name": "Cobalt Strike Beacon", "hash": "a0e9f5d64349fb13191bc781f81f42e1"},
    {"name": "TrickBot Banking Trojan", "hash": "7271429d862a61cbeeb7f0e6158c183a"},
    {"name": "Emotet C2 Loader", "hash": "4d7a28d6f22da2d92300e40f1e91a1d2"},
    {"name": "AsyncRAT Remote Access", "hash": "51c64c77e60f39ac3e1792836811005f"},
    {"name": "Qakbot C2 Channel", "hash": "b386946a5a44d1ddcc843bc75336df1a"},
    {"name": "Metasploit Meterpreter", "hash": "6734f37431670b3ab4292b8f60f29c51"},
]

INTERNAL_SUBNETS = ["192.168.1.", "10.0.10.", "172.16.5."]
EXTERNAL_IPS = ["198.51.100.", "203.0.113.", "185.220.101.", "91.108.4."]
C2_SERVERS = ["185.220.101.44", "91.108.4.182", "194.26.29.112", "45.154.255.88"]
TARGET_SERVERS = ["10.0.10.5", "10.0.10.20", "192.168.1.100"]

def calc_shannon_entropy(s: str) -> float:
    """Calculates Shannon character entropy."""
    if not s:
        return 0.0
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    length = len(s)
    ent = -sum((count / length) * math.log2(count / length) for count in freq.values())
    return round(ent, 4)

def get_vowel_ratio(s: str) -> float:
    """Calculates vowel to letter ratio."""
    letters = [c.lower() for c in s if c.isalpha()]
    if not letters:
        return 0.0
    vowels = sum(1 for c in letters if c in 'aeiou')
    return round(vowels / len(letters), 4)

def random_internal_ip():
    return f"{random.choice(INTERNAL_SUBNETS)}{random.randint(2, 254)}"

def random_external_ip():
    return f"{random.choice(EXTERNAL_IPS)}{random.randint(2, 254)}"

# -----------------------------------------------------------------------------
# 1. Benign Traffic Generation
# -----------------------------------------------------------------------------

def generate_benign_flows(count=2000, start_time=None):
    """Generates standard normal enterprise flows."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(hours=2)
    flows = []
    
    protocols = [
        ("HTTPS", 443, "TCP", 0.60),
        ("HTTP", 80, "TCP", 0.15),
        ("DNS", 53, "UDP", 0.15),
        ("SSH", 22, "TCP", 0.05),
        ("NTP", 123, "UDP", 0.03),
        ("SMTP", 587, "TCP", 0.02),
    ]
    
    curr_time = start_time
    for i in range(count):
        curr_time += timedelta(milliseconds=random.randint(10, 200))
        # Choose service by weighted distribution
        r = random.random()
        cumulative = 0.0
        proto_name, dst_port, l4_proto, _ = protocols[0]
        for p, port, proto, weight in protocols:
            cumulative += weight
            if r <= cumulative:
                proto_name, dst_port, l4_proto = p, port, proto
                break
                
        src_ip = random_internal_ip()
        dst_ip = random_external_ip() if proto_name not in ["DNS", "NTP"] else random.choice(["8.8.8.8", "1.1.1.1", "10.0.10.1"])
        src_port = random.randint(32768, 61000)
        
        duration = round(random.uniform(0.02, 12.0), 4) if l4_proto == "TCP" else round(random.uniform(0.001, 0.05), 4)
        if proto_name == "HTTPS":
            bytes_out = random.randint(400, 8000)
            bytes_in = random.randint(2000, 450000)
            pkts_out = max(3, int(bytes_out / 700))
            pkts_in = max(3, int(bytes_in / 1200))
            entropy = round(random.uniform(3.2, 4.4), 4)
            ja3 = random.choice(BENIGN_JA3)["hash"]
            flags = "SYN-ACK-FIN-PSH"
        elif proto_name == "HTTP":
            bytes_out = random.randint(200, 3000)
            bytes_in = random.randint(800, 150000)
            pkts_out = max(2, int(bytes_out / 600))
            pkts_in = max(2, int(bytes_in / 1000))
            entropy = round(random.uniform(2.8, 3.8), 4)
            ja3 = None
            flags = "SYN-ACK-FIN-PSH"
        elif proto_name == "DNS":
            bytes_out = random.randint(50, 120)
            bytes_in = random.randint(80, 500)
            pkts_out = 1
            pkts_in = 1
            entropy = round(random.uniform(2.5, 3.6), 4)
            ja3 = None
            flags = "UDP"
        elif proto_name == "SSH":
            bytes_out = random.randint(1500, 25000)
            bytes_in = random.randint(1500, 35000)
            pkts_out = random.randint(10, 120)
            pkts_in = random.randint(10, 150)
            entropy = round(random.uniform(3.8, 4.6), 4)
            ja3 = None
            flags = "SYN-ACK-PSH"
        else: # NTP/SMTP
            bytes_out = random.randint(48, 500)
            bytes_in = random.randint(48, 1200)
            pkts_out = random.randint(1, 6)
            pkts_in = random.randint(1, 6)
            entropy = round(random.uniform(2.0, 3.5), 4)
            ja3 = None
            flags = "UDP" if l4_proto == "UDP" else "SYN-ACK-FIN"
            
        flow = {
            "flow_id": f"flow_benign_{i+1:06d}",
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": l4_proto,
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "tcp_flags": flags,
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8) / max(0.001, duration), 2),
            "packet_rate_pps": round((pkts_in + pkts_out) / max(0.001, duration), 2),
            "entropy": entropy,
            "ja3_hash": ja3,
            "is_attack": False,
            "attack_type": "BENIGN",
            "timestamp": curr_time.isoformat(),
            "metadata": {"service": proto_name}
        }
        flows.append(flow)
    return flows

def generate_benign_dns(count=500):
    """Generates benign DNS query records."""
    records = []
    types = ["A", "AAAA", "CNAME", "MX", "TXT"]
    for i in range(count):
        dom = random.choice(BENIGN_DOMAINS)
        sub = random.choice(["", "www.", "api.", "cdn.", "mail.", "auth."])
        query_name = f"{sub}{dom}" if sub else dom
        q_type = random.choice(types)
        ent = calc_shannon_entropy(query_name)
        vowel_rat = get_vowel_ratio(query_name)
        records.append({
            "query_id": f"dns_benign_{i+1:05d}",
            "client_ip": random_internal_ip(),
            "server_ip": random.choice(["8.8.8.8", "1.1.1.1", "10.0.10.1"]),
            "query_name": query_name,
            "query_type": q_type,
            "response_code": "NOERROR",
            "payload_size_bytes": random.randint(45, 180),
            "entropy": ent,
            "vowel_ratio": vowel_rat,
            "is_tunneling": False,
            "tunneling_score": 0.02,
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 120))).isoformat()
        })
    return records

def generate_benign_tls(count=300):
    """Generates benign client TLS handshake profiles."""
    records = []
    for i in range(count):
        profile = random.choice(BENIGN_JA3)
        records.append({
            "tls_id": f"tls_benign_{i+1:04d}",
            "client_ip": random_internal_ip(),
            "server_ip": random_external_ip(),
            "client_name": profile["name"],
            "ja3_hash": profile["hash"],
            "sni": f"www.{random.choice(BENIGN_DOMAINS)}",
            "alpn": "h2,http/1.1",
            "cipher_suite_count": random.randint(12, 28),
            "is_malicious": False,
            "threat_label": "BENIGN"
        })
    return records

# -----------------------------------------------------------------------------
# 2. Attack Vector Generators
# -----------------------------------------------------------------------------

def generate_syn_flood_flows(count=1000, target_ip="10.0.10.20", start_time=None):
    """Generates high-rate TCP SYN flood attack flows."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=45)
    flows = []
    curr_time = start_time
    
    for i in range(count):
        # Very high frequency bursts
        curr_time += timedelta(microseconds=random.randint(50, 400))
        spoofed_src = f"{random.randint(11, 220)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
        src_port = random.randint(1024, 65535)
        dst_port = random.choice([80, 443, 8080])
        duration = round(random.uniform(0.0001, 0.005), 5)
        
        flow = {
            "flow_id": f"flow_synflood_{i+1:06d}",
            "src_ip": spoofed_src,
            "dst_ip": target_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": 0, # Target cannot finish handshake
            "bytes_out": random.choice([40, 52, 60]), # Raw SYN packet
            "pkts_in": 0,
            "pkts_out": 1,
            "tcp_flags": "SYN",
            "flow_rate_bps": round((60 * 8) / duration, 2),
            "packet_rate_pps": round(1 / duration, 2),
            "entropy": round(random.uniform(1.2, 2.1), 4),
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "DDOS_SYN_FLOOD",
            "timestamp": curr_time.isoformat(),
            "metadata": {"attack_vector": "SYN_FLOOD", "target": target_ip}
        }
        flows.append(flow)
    return flows

def generate_udp_amp_flows(count=500, target_ip="10.0.10.20", start_time=None):
    """Generates UDP amplification reflection attack flows."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=35)
    flows = []
    curr_time = start_time
    
    reflectors = ["198.51.100.53", "203.0.113.123", "185.220.101.53", "91.108.4.123"]
    for i in range(count):
        curr_time += timedelta(microseconds=random.randint(200, 1500))
        reflector_ip = random.choice(reflectors)
        src_port = 53 if "53" in reflector_ip else 123
        dst_port = random.randint(32768, 65000)
        
        # Amplification ratio 40x to 75x
        request_bytes = random.randint(45, 65)
        response_bytes = request_bytes * random.randint(40, 75)
        duration = round(random.uniform(0.001, 0.02), 4)
        
        flow = {
            "flow_id": f"flow_udpamp_{i+1:06d}",
            "src_ip": reflector_ip,
            "dst_ip": target_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": "UDP",
            "duration": duration,
            "bytes_in": response_bytes,
            "bytes_out": request_bytes,
            "pkts_in": random.randint(3, 8),
            "pkts_out": 1,
            "tcp_flags": "UDP",
            "flow_rate_bps": round(((response_bytes + request_bytes) * 8) / duration, 2),
            "packet_rate_pps": round(6 / duration, 2),
            "entropy": round(random.uniform(3.6, 4.8), 4),
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "DDOS_UDP_AMPLIFICATION",
            "timestamp": curr_time.isoformat(),
            "metadata": {"amplification_ratio": round(response_bytes / request_bytes, 1), "reflector": reflector_ip}
        }
        flows.append(flow)
    return flows

def generate_slowloris_flows(count=200, target_ip="10.0.10.5", start_time=None):
    """Generates low-and-slow Slowloris HTTP resource exhaustion flows."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=25)
    flows = []
    attacker_ip = "185.220.101.99"
    curr_time = start_time
    
    for i in range(count):
        curr_time += timedelta(milliseconds=random.randint(50, 200))
        src_port = 40000 + i
        duration = round(random.uniform(90.0, 300.0), 2) # Long lasting connection
        bytes_out = random.randint(120, 280) # Trickling partial HTTP headers
        bytes_in = random.randint(0, 80)
        
        flow = {
            "flow_id": f"flow_slowloris_{i+1:06d}",
            "src_ip": attacker_ip,
            "dst_ip": target_ip,
            "src_port": src_port,
            "dst_port": 80,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": random.randint(1, 4),
            "pkts_out": random.randint(8, 25),
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round((bytes_out * 8) / duration, 2),
            "packet_rate_pps": round(15 / duration, 4),
            "entropy": round(random.uniform(2.1, 3.2), 4),
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "DOS_SLOWLORIS",
            "timestamp": curr_time.isoformat(),
            "metadata": {"attack_vector": "SLOWLORIS", "connection_hold_sec": duration}
        }
        flows.append(flow)
    return flows

def generate_c2_beaconing_flows(count=300, victim_ip="192.168.1.45", c2_ip="185.220.101.44", interval_sec=10.0, start_time=None):
    """Generates periodic C2 callback beaconing flows with deterministic intervals."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(hours=1)
    flows = []
    curr_time = start_time
    
    for i in range(count):
        # Strict periodic interval with tiny jitter (±0.05s)
        jitter = random.uniform(-0.05, 0.05)
        curr_time += timedelta(seconds=interval_sec + jitter)
        src_port = 49152 + (i % 8) # Persistent or small port pool
        duration = round(random.uniform(0.04, 0.09), 4)
        
        # Identical or near-identical packet sizes
        bytes_out = random.choice([128, 256, 128, 128])
        bytes_in = random.choice([64, 96, 64])
        
        flow = {
            "flow_id": f"flow_beacon_{i+1:06d}",
            "src_ip": victim_ip,
            "dst_ip": c2_ip,
            "src_port": src_port,
            "dst_port": 8443,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": 2,
            "pkts_out": 2,
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8) / duration, 2),
            "packet_rate_pps": round(4 / duration, 2),
            "entropy": round(random.uniform(4.5, 4.9), 4),
            "ja3_hash": "a0e9f5d64349fb13191bc781f81f42e1", # Cobalt Strike JA3
            "is_attack": True,
            "attack_type": "C2_BEACONING",
            "timestamp": curr_time.isoformat(),
            "metadata": {
                "beacon_interval_sec": interval_sec,
                "jitter_variance": round(abs(jitter), 4),
                "payload_uniformity": 0.98
            }
        }
        flows.append(flow)
    return flows

def generate_dga_domains(count=800):
    """Generates synthetic DGA domains across multiple real malware algorithmic schemes."""
    records = []
    families = ["cryptolocker", "necurs", "banjori", "suppobox", "mirai", "matsnu"]
    
    tlds = [".com", ".net", ".org", ".biz", ".info", ".cc", ".top", ".xyz"]
    
    # Words for dictionary DGAs (suppobox / matsnu)
    words = ["system", "update", "secure", "cloud", "global", "direct", "matrix", "agent", "service", "portal", "stream", "packet", "vector", "shield"]
    
    for i in range(count):
        family = random.choice(families)
        tld = random.choice(tlds)
        
        if family == "cryptolocker":
            length = random.randint(12, 19)
            raw = "".join(random.choices(string.ascii_lowercase + string.digits, k=length))
        elif family == "necurs":
            length = random.randint(9, 15)
            # Alternating consonant clusters
            cons = "bcdfghjklmnpqrstvwxyz"
            vows = "aeiou"
            raw = "".join(random.choice(cons) + random.choice(vows) + random.choice(cons) for _ in range(length // 3))
        elif family == "banjori":
            # Seed shifted string
            prefix = "".join(random.choices(string.ascii_lowercase, k=4))
            raw = prefix + "".join(chr(((ord(c) - 97 + i) % 26) + 97) for c in prefix * 3)[:14]
        elif family == "suppobox":
            raw = random.choice(words) + random.choice(words) + str(random.randint(10, 99))
        elif family == "mirai":
            length = random.randint(10, 16)
            raw = "".join(random.choices("0123456789abcdef", k=length))
        else: # matsnu
            raw = random.choice(words) + "".join(random.choices(string.ascii_lowercase, k=5))
            
        domain = f"{raw}{tld}"
        ent = calc_shannon_entropy(domain)
        vowel_rat = get_vowel_ratio(domain)
        
        records.append({
            "domain_id": f"dga_{i+1:05d}",
            "domain": domain,
            "family": family,
            "entropy": ent,
            "vowel_ratio": vowel_rat,
            "length": len(domain),
            "is_dga": True,
            "confidence": round(random.uniform(0.88, 0.99), 4),
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 300))).isoformat()
        })
    return records

def generate_dns_tunneling_queries(count=400, client_ip="192.168.1.88", c2_server="tunnel.c2exfil-network.org"):
    """Generates DNS exfiltration and tunneling query records."""
    queries = []
    
    for i in range(count):
        # Base64/Hex chunks encoded inside subdomains
        chunk_len = random.randint(32, 60)
        chunk = "".join(random.choices(string.ascii_letters + string.digits + "-_", k=chunk_len))
        query_name = f"{chunk}.{c2_server}"
        ent = calc_shannon_entropy(query_name)
        payload_size = random.randint(220, 512)
        
        queries.append({
            "query_id": f"dns_tunnel_{i+1:05d}",
            "client_ip": client_ip,
            "server_ip": "185.220.101.44",
            "query_name": query_name,
            "query_type": random.choice(["TXT", "NULL", "A", "TXT"]),
            "response_code": "NOERROR",
            "payload_size_bytes": payload_size,
            "entropy": ent,
            "is_tunneling": True,
            "tunneling_score": round(random.uniform(0.85, 0.99), 4),
            "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 45))).isoformat()
        })
    return queries

def generate_port_scan_flows(start_time=None):
    """Generates horizontal subnet sweep and vertical port scans."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=50)
    flows = []
    attacker_ip = "185.220.101.15"
    curr_time = start_time
    
    # 1. Vertical Port Scan: Scan ports 1 to 150 on target 10.0.10.5
    target_ip = "10.0.10.5"
    for port in range(1, 151):
        curr_time += timedelta(milliseconds=random.randint(5, 25))
        duration = round(random.uniform(0.001, 0.01), 4)
        is_open = port in [22, 80, 443, 3306, 8080]
        flow = {
            "flow_id": f"flow_vscan_{port:04d}",
            "src_ip": attacker_ip,
            "dst_ip": target_ip,
            "src_port": 50000 + (port % 1000),
            "dst_port": port,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": 44 if is_open else 0,
            "bytes_out": 44, # SYN packet
            "pkts_in": 1 if is_open else 0,
            "pkts_out": 1,
            "tcp_flags": "SYN-ACK" if is_open else "SYN-RST",
            "flow_rate_bps": round(88 * 8 / duration, 2),
            "packet_rate_pps": round(2 / duration, 2),
            "entropy": 1.5,
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "PORT_SCAN_VERTICAL",
            "timestamp": curr_time.isoformat(),
            "metadata": {"scan_type": "VERTICAL", "scanned_port": port, "target_open": is_open}
        }
        flows.append(flow)
        
    # 2. Horizontal Subnet Sweep: Scan port 445 (SMB) across 192.168.1.1 to 192.168.1.100
    for host in range(1, 101):
        curr_time += timedelta(milliseconds=random.randint(10, 30))
        target_subnet_ip = f"192.168.1.{host}"
        duration = round(random.uniform(0.001, 0.01), 4)
        flow = {
            "flow_id": f"flow_hscan_{host:04d}",
            "src_ip": attacker_ip,
            "dst_ip": target_subnet_ip,
            "src_port": 52100 + host,
            "dst_port": 445,
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": 0,
            "bytes_out": 44,
            "pkts_in": 0,
            "pkts_out": 1,
            "tcp_flags": "SYN",
            "flow_rate_bps": round(44 * 8 / duration, 2),
            "packet_rate_pps": round(1 / duration, 2),
            "entropy": 1.4,
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "PORT_SCAN_HORIZONTAL",
            "timestamp": curr_time.isoformat(),
            "metadata": {"scan_type": "HORIZONTAL_SWEEP", "target_ip": target_subnet_ip, "port": 445}
        }
        flows.append(flow)
    return flows

def generate_encrypted_malware_flows(count=200, start_time=None):
    """Generates malicious TLS flows matching known malware JA3 signatures."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=40)
    flows = []
    curr_time = start_time
    
    for i in range(count):
        curr_time += timedelta(seconds=random.randint(2, 15))
        mal = random.choice(MALWARE_JA3)
        victim_ip = random_internal_ip()
        c2_server = random.choice(C2_SERVERS)
        duration = round(random.uniform(0.5, 4.0), 3)
        bytes_out = random.randint(1500, 8000)
        bytes_in = random.randint(2000, 15000)
        
        flow = {
            "flow_id": f"flow_malware_tls_{i+1:05d}",
            "src_ip": victim_ip,
            "dst_ip": c2_server,
            "src_port": random.randint(35000, 60000),
            "dst_port": random.choice([443, 8443, 4443]),
            "protocol": "TLS",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": random.randint(6, 20),
            "pkts_out": random.randint(6, 18),
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8) / duration, 2),
            "packet_rate_pps": round(25 / duration, 2),
            "entropy": round(random.uniform(4.7, 5.0), 4), # Highly encrypted payload
            "ja3_hash": mal["hash"],
            "is_attack": True,
            "attack_type": "ENCRYPTED_MALWARE_TLS",
            "timestamp": curr_time.isoformat(),
            "metadata": {
                "malware_family": mal["name"],
                "ja3_match": mal["hash"],
                "cert_issuer": "Untrusted / Self-Signed Root CA"
            }
        }
        flows.append(flow)
    return flows

def generate_exfiltration_flows(count=150, start_time=None):
    """Generates anomalous high outbound volume data exfiltration flows."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(minutes=20)
    flows = []
    curr_time = start_time
    
    for i in range(count):
        curr_time += timedelta(seconds=random.randint(1, 10))
        victim_ip = "192.168.1.100" # Internal database server
        exfil_drop_ip = "185.220.101.88" # External rogue drop server
        duration = round(random.uniform(1.2, 8.5), 3)
        # Outbound-to-inbound ratio is extremely high (100:1 to 500:1)
        bytes_out = random.randint(500000, 8500000) # 500KB to 8.5MB per chunk
        bytes_in = random.randint(500, 2500) # Only ACKs
        
        flow = {
            "flow_id": f"flow_exfil_{i+1:05d}",
            "src_ip": victim_ip,
            "dst_ip": exfil_drop_ip,
            "src_port": random.randint(40000, 60000),
            "dst_port": random.choice([443, 8080, 21, 9001]),
            "protocol": "TCP",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": max(5, int(bytes_in / 60)),
            "pkts_out": max(20, int(bytes_out / 1400)),
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8) / duration, 2),
            "packet_rate_pps": round((int(bytes_out / 1400)) / duration, 2),
            "entropy": round(random.uniform(4.6, 4.95), 4),
            "ja3_hash": None,
            "is_attack": True,
            "attack_type": "DATA_EXFILTRATION",
            "timestamp": curr_time.isoformat(),
            "metadata": {
                "exfil_method": "ENCRYPTED_HTTPS_POST",
                "outbound_ratio": round(bytes_out / max(1, bytes_in), 1),
                "total_megabytes": round(bytes_out / (1024 * 1024), 2)
            }
        }
        flows.append(flow)
    return flows

# -----------------------------------------------------------------------------
# 3. Multi-Stage APT Attack Scenario
# -----------------------------------------------------------------------------

def generate_multi_stage_scenario():
    """Generates an end-to-end multi-stage cyber campaign timeline."""
    now = datetime.now(timezone.utc)
    scenario = {
        "campaign_name": "Operation ShadowInfiltrate (APT-29 Simulation)",
        "victim_organization": "National Infrastructure Agency",
        "attacker_c2": "185.220.101.44",
        "stages": [
            {
                "stage": 1,
                "phase": "Reconnaissance (Port & Subnet Scanning)",
                "timestamp": (now - timedelta(minutes=60)).isoformat(),
                "vector": "PORT_SCAN",
                "attacker_ip": "185.220.101.15",
                "target_ip": "10.0.10.5",
                "evidence": "Vertical port scan probing ports 1-1024. Discovered open port 8080 (Vulnerable WebApp)."
            },
            {
                "stage": 2,
                "phase": "Weaponization & C2 Rendezvous (DGA DNS)",
                "timestamp": (now - timedelta(minutes=45)).isoformat(),
                "vector": "DGA_DNS",
                "attacker_ip": "10.0.10.5",
                "target_ip": "8.8.8.8",
                "evidence": "High-entropy DGA domain lookups (kdfj934jsd834kf.net) to locate dynamic C2 IP."
            },
            {
                "stage": 3,
                "phase": "Payload Delivery & Dropper (Encrypted Malware TLS)",
                "timestamp": (now - timedelta(minutes=35)).isoformat(),
                "vector": "ENCRYPTED_MALWARE",
                "attacker_ip": "10.0.10.5",
                "target_ip": "185.220.101.44",
                "evidence": "Outbound TLS handshake matching Cobalt Strike Beacon JA3 hash (a0e9f5d64349fb13191bc781f81f42e1)."
            },
            {
                "stage": 4,
                "phase": "Command & Control Persistence (Periodic Beaconing)",
                "timestamp": (now - timedelta(minutes=25)).isoformat(),
                "vector": "C2_BEACONING",
                "attacker_ip": "10.0.10.5",
                "target_ip": "185.220.101.44",
                "evidence": "Heartbeat beaconing every exactly 10.0s (jitter < 0.05s) sending keep-alives."
            },
            {
                "stage": 5,
                "phase": "Data Collection & Exfiltration",
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "vector": "DATA_EXFILTRATION",
                "attacker_ip": "10.0.10.5",
                "target_ip": "185.220.101.88",
                "evidence": "Burst transfer of 14.8 MB database archive over HTTPS POST, outbound ratio 450:1."
            },
            {
                "stage": 6,
                "phase": "Cover Tracks & Distraction (DDoS SYN Flood)",
                "timestamp": (now - timedelta(minutes=5)).isoformat(),
                "vector": "DDOS_SYN_FLOOD",
                "attacker_ip": "Spoofed Botnet (500+ IPs)",
                "target_ip": "10.0.10.20",
                "evidence": "Massive 25,000 pps SYN flood hitting border gateway to blind SOC monitoring."
            }
        ]
    }
    return scenario

# -----------------------------------------------------------------------------
# 4. Pure Python Binary PCAP Generator
# -----------------------------------------------------------------------------

def write_sample_pcap(filepath, packet_count=100):
    """Writes a valid raw binary PCAP file (Wireshark / tcpdump compatible)."""
    with open(filepath, "wb") as f:
        # PCAP Global Header: magic_number, version_major, version_minor, thiszone, sigfigs, snaplen, network
        # magic: 0xa1b2c3d4, major: 2, minor: 4, snaplen: 65535, linktype: 1 (Ethernet)
        global_hdr = struct.pack("=IHHiIII", 0xa1b2c3d4, 2, 4, 0, 0, 65535, 1)
        f.write(global_hdr)
        
        base_time = int(datetime.now(timezone.utc).timestamp()) - 300
        
        for i in range(packet_count):
            ts_sec = base_time + (i // 10)
            ts_usec = (i % 10) * 100000
            
            # Ethernet Header (14 bytes): Dst MAC, Src MAC, EtherType (0x0800 IPv4)
            eth_hdr = struct.pack("!6s6sH", b"\x00\x0c\x29\x4f\x8e\x35", b"\x00\x0c\x29\x1a\x2b\x3c", 0x0800)
            
            # Decide packet type: SYN flood, DNS query, or normal HTTP
            if i % 3 == 0:
                # SYN packet
                src_ip_bytes = bytes([random.randint(11, 200), random.randint(1, 254), random.randint(1, 254), random.randint(1, 254)])
                dst_ip_bytes = bytes([10, 0, 10, 20])
                ip_len = 20 + 20
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 6, 0, src_ip_bytes, dst_ip_bytes)
                # TCP SYN (flags: 0x02 SYN)
                tcp_hdr = struct.pack("!HHIIBBHHH", random.randint(1024, 65000), 80, random.randint(1000, 999999), 0, 0x50, 0x02, 64240, 0, 0)
                frame = eth_hdr + ip_hdr + tcp_hdr
            else:
                # Normal DNS or HTTP packet
                src_ip_bytes = bytes([192, 168, 1, random.randint(2, 200)])
                dst_ip_bytes = bytes([8, 8, 8, 8])
                payload = b"\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x06google\x03com\x00\x00\x01\x00\x01"
                ip_len = 20 + 8 + len(payload)
                ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_len, i, 0x4000, 64, 17, 0, src_ip_bytes, dst_ip_bytes)
                udp_hdr = struct.pack("!HHHH", random.randint(32768, 60000), 53, 8 + len(payload), 0)
                frame = eth_hdr + ip_hdr + udp_hdr + payload
                
            pkt_len = len(frame)
            pkt_hdr = struct.pack("=IIII", ts_sec, ts_usec, pkt_len, pkt_len)
            f.write(pkt_hdr)
            f.write(frame)

# -----------------------------------------------------------------------------
# 5. Supabase SQL Seed Script Generator
# -----------------------------------------------------------------------------

def generate_supabase_seed_sql(filepath, alerts_count=10, flows_count=50):
    """Generates direct SQL statements for instant Supabase seeding."""
    now = datetime.now(timezone.utc)
    
    with open(filepath, "w") as f:
        f.write("-- ============================================================================\n")
        f.write("-- Supabase Initial Seed Data - AI Cyber Threat Detection System\n")
        f.write("-- Generated on: " + now.isoformat() + "\n")
        f.write("-- ============================================================================\n\n")
        
        # 1. Bot Metrics
        f.write("-- 1. Seed Bot Metrics\n")
        bots = [
            ("ddos_bot", "DDoS & DoS Specialist", "HEALTHY", 1.25, 4.2, 145.0, 154200, 243, 0.992, 0.989),
            ("beaconing_bot", "C2 Beaconing Detector", "HEALTHY", 2.10, 6.8, 180.5, 98400, 89, 0.985, 0.981),
            ("dga_dns_bot", "DGA DNS Classifier", "HEALTHY", 0.85, 3.1, 112.0, 342100, 512, 0.994, 0.993),
            ("encrypted_malware_bot", "Encrypted Malware & TLS Bot", "HEALTHY", 3.40, 8.5, 220.0, 67800, 74, 0.978, 0.975),
            ("scanning_bot", "Reconnaissance & Scan Bot", "HEALTHY", 1.10, 3.8, 130.2, 210500, 318, 0.988, 0.986),
            ("exfiltration_bot", "Data Exfiltration Guardian", "HEALTHY", 2.80, 5.4, 165.8, 89300, 42, 0.982, 0.979),
        ]
        f.write("INSERT INTO bot_metrics (bot_name, display_name, status, latency_ms, cpu_percent, memory_mb, predictions_count, threats_detected, accuracy_score, f1_score) VALUES\n")
        bot_rows = []
        for b in bots:
            bot_rows.append(f"('{b[0]}', '{b[1]}', '{b[2]}', {b[3]}, {b[4]}, {b[5]}, {b[6]}, {b[7]}, {b[8]}, {b[9]})")
        f.write(",\n".join(bot_rows))
        f.write("\nON CONFLICT (bot_name) DO UPDATE SET\n")
        f.write("  status = EXCLUDED.status, latency_ms = EXCLUDED.latency_ms, predictions_count = EXCLUDED.predictions_count, threats_detected = EXCLUDED.threats_detected;\n\n")
        
        # 2. Threat Alerts
        f.write("-- 2. Seed Threat Alerts & Blockchain Logs\n")
        alerts = [
            (
                "alert_2026_001",
                "Massive Distributed SYN Flood Detected",
                "Multi-source TCP SYN flood exceeding 20,000 pps targeting border gateway web service.",
                "CRITICAL",
                "DDOS_SYN_FLOOD",
                "198.51.100.0/24 (Botnet)",
                "10.0.10.20",
                80,
                0.9890,
                "['ddos_bot']",
                '{"ddos_bot": 0.995, "scanning_bot": 0.32}',
                '{"pps": 24500, "syn_ack_ratio": 99.8, "unique_sources": 512}',
                "NEW",
                "0x7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef0123456789",
                True,
                19450231
            ),
            (
                "alert_2026_002",
                "Cobalt Strike C2 Beaconing Channel Active",
                "Deterministic periodic callback pattern every 10.0s detected with Cobalt Strike JA3 signature.",
                "HIGH",
                "C2_BEACONING",
                "192.168.1.45",
                "185.220.101.44",
                8443,
                0.9650,
                "['beaconing_bot', 'encrypted_malware_bot']",
                '{"beaconing_bot": 0.98, "encrypted_malware_bot": 0.95}',
                '{"interval_sec": 10.0, "jitter": 0.02, "ja3": "a0e9f5d64349fb13191bc781f81f42e1"}',
                "INVESTIGATING",
                "0x4a1c7f99b2e048d3c67d821345e56789abcdef0123456789abcdef0123456789",
                True,
                19450245
            ),
            (
                "alert_2026_003",
                "Algorithmic DGA Domain Generation Queries",
                "Host generating high-entropy pseudo-random domain queries matching Cryptolocker seed.",
                "HIGH",
                "DGA_DNS",
                "192.168.1.88",
                "8.8.8.8",
                53,
                0.9520,
                "['dga_dns_bot']",
                '{"dga_dns_bot": 0.97}',
                '{"sample_domain": "kdfj934jsd834kf.net", "entropy": 3.92, "vowel_ratio": 0.12}',
                "NEW",
                "0x9f3d2e1a4b5c67890abcdef1234567890abcdef1234567890abcdef123456789",
                True,
                19450250
            ),
            (
                "alert_2026_004",
                "Anomalous Outbound Database Exfiltration",
                "Unusual large volume egress transfer (14.8 MB) to unknown external IP via HTTPS POST.",
                "CRITICAL",
                "DATA_EXFILTRATION",
                "192.168.1.100",
                "185.220.101.88",
                443,
                0.9780,
                "['exfiltration_bot']",
                '{"exfiltration_bot": 0.985, "encrypted_malware_bot": 0.72}',
                '{"outbound_mb": 14.8, "outbound_ratio": 450.2, "transfer_duration_sec": 4.2}',
                "NEW",
                "0x2b8e9f1a4c5d67890abcdef1234567890abcdef1234567890abcdef123456789",
                True,
                19450262
            ),
            (
                "alert_2026_005",
                "Subnet Reconnaissance & Port Sweep",
                "Vertical port sweep probing 150 consecutive ports on central application server.",
                "MEDIUM",
                "PORT_SCAN",
                "185.220.101.15",
                "10.0.10.5",
                8080,
                0.9210,
                "['scanning_bot']",
                '{"scanning_bot": 0.94}',
                '{"ports_scanned": 150, "rate_pps": 350, "open_found": [22, 80, 443, 8080]}',
                "RESOLVED",
                "0x5e7c9b8e21a4f039d5b78c9102345e6789abcdef0123456789abcdef01234567",
                True,
                19450275
            ),
        ]
        
        for a in alerts:
            f.write(f"""INSERT INTO threat_alerts (alert_id, title, description, severity, attack_type, source_ip, target_ip, target_port, confidence_score, contributing_bots, bot_scores, evidence, status, blockchain_tx_hash, blockchain_verified, blockchain_block_num)
VALUES ('{a[0]}', '{a[1]}', '{a[2]}', '{a[3]}', '{a[4]}', '{a[5]}', '{a[6]}', {a[7]}, {a[8]}, ARRAY{a[9]}, '{a[10]}'::jsonb, '{a[11]}'::jsonb, '{a[12]}', '{a[13]}', {str(a[14]).lower()}, {a[15]})
ON CONFLICT (alert_id) DO NOTHING;

INSERT INTO blockchain_logs (alert_id, alert_hash, tx_hash, block_number, contract_address, sender_address, gas_used)
VALUES ('{a[0]}', '0x{hashlib.sha256(a[0].encode()).hexdigest()}', '{a[13]}', {a[15]}, '0x71C84167B33ab71e0FE3b299c0E25F6C665673E0', '0xFe8446b48A4E90F4c9a6a8f15dE35aDe798C3911', 48200)
ON CONFLICT (alert_id) DO NOTHING;
""")
        f.write("\n")

# -----------------------------------------------------------------------------
# 6. Main Orchestrator
# -----------------------------------------------------------------------------

def export_json(filepath, data):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"  [+] Wrote JSON: {filepath} ({len(data)} records)")

def export_csv(filepath, data):
    if not data:
        return
    keys = list(data[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        for row in data:
            # Flatten dict/list fields for clean CSV compatibility
            clean_row = {}
            for k, v in row.items():
                if isinstance(v, (dict, list)):
                    clean_row[k] = json.dumps(v)
                else:
                    clean_row[k] = v
            writer.writerow(clean_row)
    print(f"  [+] Wrote CSV:  {filepath} ({len(data)} records)")

def main():
    print("=================================================================")
    print("🛡️  Generating AI Cyber Threat Detection Synthetic Datasets")
    print("=================================================================\n")
    
    # 1. Benign Datasets
    print("1. Generating Benign Baselines...")
    benign_flows = generate_benign_flows(count=3000)
    export_json(os.path.join(BENIGN_DIR, "benign_flows.json"), benign_flows)
    export_csv(os.path.join(BENIGN_DIR, "benign_flows.csv"), benign_flows)
    
    benign_dns = generate_benign_dns(count=600)
    export_csv(os.path.join(BENIGN_DIR, "benign_dns.csv"), benign_dns)
    
    benign_tls = generate_benign_tls(count=400)
    export_csv(os.path.join(BENIGN_DIR, "benign_tls.csv"), benign_tls)
    
    # 2. Attack Vectors
    print("\n2. Generating Specialist Threat Vectors...")
    
    # 2.1 SYN Flood
    syn_flows = generate_syn_flood_flows(count=1200)
    export_json(os.path.join(ATTACKS_DIR, "syn_flood", "syn_flood_flows.json"), syn_flows)
    export_csv(os.path.join(ATTACKS_DIR, "syn_flood", "syn_flood_flows.csv"), syn_flows)
    
    # 2.2 UDP Amplification
    udp_flows = generate_udp_amp_flows(count=600)
    export_json(os.path.join(ATTACKS_DIR, "udp_amplification", "udp_amp_flows.json"), udp_flows)
    export_csv(os.path.join(ATTACKS_DIR, "udp_amplification", "udp_amp_flows.csv"), udp_flows)
    
    # 2.3 Slowloris
    slow_flows = generate_slowloris_flows(count=300)
    export_json(os.path.join(ATTACKS_DIR, "slowloris", "slowloris_flows.json"), slow_flows)
    export_csv(os.path.join(ATTACKS_DIR, "slowloris", "slowloris_flows.csv"), slow_flows)
    
    # 2.4 DNS Tunneling
    dns_tunnels = generate_dns_tunneling_queries(count=500)
    export_json(os.path.join(ATTACKS_DIR, "dns_tunneling", "dns_tunneling_queries.json"), dns_tunnels)
    export_csv(os.path.join(ATTACKS_DIR, "dns_tunneling", "dns_tunneling_queries.csv"), dns_tunnels)
    
    # 2.5 DGA Domains
    dga_domains = generate_dga_domains(count=1000)
    export_json(os.path.join(ATTACKS_DIR, "dga_samples", "dga_queries.json"), dga_domains)
    export_csv(os.path.join(ATTACKS_DIR, "dga_samples", "dga_domains.csv"), dga_domains)
    
    # 2.6 C2 Beaconing
    c2_flows = generate_c2_beaconing_flows(count=400)
    export_json(os.path.join(ATTACKS_DIR, "c2_beaconing", "c2_beaconing_flows.json"), c2_flows)
    export_csv(os.path.join(ATTACKS_DIR, "c2_beaconing", "c2_beaconing_flows.csv"), c2_flows)
    
    # 2.7 Port Scans
    scan_flows = generate_port_scan_flows()
    export_json(os.path.join(ATTACKS_DIR, "port_scan", "port_scan_flows.json"), scan_flows)
    export_csv(os.path.join(ATTACKS_DIR, "port_scan", "port_scan_flows.csv"), scan_flows)
    
    # 2.8 Encrypted Malware TLS
    mal_flows = generate_encrypted_malware_flows(count=300)
    export_json(os.path.join(ATTACKS_DIR, "encrypted_malware", "encrypted_malware_flows.json"), mal_flows)
    export_csv(os.path.join(ATTACKS_DIR, "encrypted_malware", "encrypted_malware_flows.csv"), mal_flows)
    
    # 2.9 Data Exfiltration
    exfil_flows = generate_exfiltration_flows(count=200)
    export_json(os.path.join(ATTACKS_DIR, "data_exfiltration", "exfiltration_flows.json"), exfil_flows)
    export_csv(os.path.join(ATTACKS_DIR, "data_exfiltration", "exfiltration_flows.csv"), exfil_flows)
    
    # 3. Combined Multi-Vector Evaluation Flows
    print("\n3. Creating Combined Multi-Vector Benchmark...")
    all_flows = (
        benign_flows[:2000] +
        syn_flows[:400] +
        udp_flows[:200] +
        slow_flows[:100] +
        c2_flows[:200] +
        scan_flows[:150] +
        mal_flows[:150] +
        exfil_flows[:100]
    )
    random.shuffle(all_flows)
    export_json(os.path.join(FLOWS_DIR, "sample_mixed_flows.json"), all_flows)
    export_csv(os.path.join(FLOWS_DIR, "sample_mixed_flows.csv"), all_flows)
    
    # 4. Multi-Stage APT Attack Scenario
    print("\n4. Generating Multi-Stage Scenario...")
    scenario = generate_multi_stage_scenario()
    export_json(os.path.join(FLOWS_DIR, "multi_stage_scenario.json"), scenario)
    
    # 5. Raw PCAP Capture
    print("\n5. Generating Raw Binary PCAP Capture...")
    pcap_path = os.path.join(PCAPS_DIR, "sample_threats.pcap")
    write_sample_pcap(pcap_path, packet_count=250)
    print(f"  [+] Wrote PCAP: {pcap_path} ({os.path.getsize(pcap_path)} bytes)")
    
    # 6. Supabase Seed SQL
    print("\n6. Generating Supabase SQL Seed Script...")
    seed_sql_path = os.path.join(DATA_DIR, "supabase_seed.sql")
    generate_supabase_seed_sql(seed_sql_path)
    print(f"  [+] Wrote SQL:  {seed_sql_path} ({os.path.getsize(seed_sql_path)} bytes)")
    
    print("\n✨ All synthetic datasets generated successfully!")

if __name__ == "__main__":
    main()
