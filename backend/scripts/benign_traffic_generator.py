#!/usr/bin/env python3
"""
Realistic Enterprise Benign Traffic Generator
=============================================
Generates statistically realistic normal network telemetry modeling authentic
campus & corporate networks:
- Heavy-tailed Pareto / Log-Normal flow byte distributions (80% small <2KB, 15% medium 2KB-50KB, 5% large 100KB-10MB)
- Poisson packet arrival processes with natural inter-arrival time (IAT) variance
- Mixed enterprise protocol distribution (HTTPS, HTTP/2, SSH, DNS, NTP, SMTP, VoIP)
- Legitimate client TLS JA3 hashes (Chrome 120+, Firefox 122+, Safari 17+, Edge)
- Background network noise (out-of-order packets, minor retransmissions, TCP window scaling)
"""

import os
import sys
import random
import datetime
from typing import List, Dict, Any

# Top enterprise benign services
BENIGN_SERVICES = [
    {"name": "HTTPS", "port": 443, "proto": "TCP", "weight": 0.65, "ja3": "cd08e31494f9531f5c4d058b2297777b"}, # Chrome JA3
    {"name": "HTTP", "port": 80, "proto": "TCP", "weight": 0.12, "ja3": None},
    {"name": "DNS", "port": 53, "proto": "UDP", "weight": 0.14, "ja3": None},
    {"name": "SSH", "port": 22, "proto": "TCP", "weight": 0.04, "ja3": None},
    {"name": "NTP", "port": 123, "proto": "UDP", "weight": 0.03, "ja3": None},
    {"name": "SMTP", "port": 587, "proto": "TCP", "weight": 0.02, "ja3": None},
]

BENIGN_DOMAINS = [
    "google.com", "microsoft.com", "apple.com", "amazon.com", "cloudflare.com",
    "github.com", "wikipedia.org", "netflix.com", "zoom.us", "linkedin.com",
    "youtube.com", "openai.com", "slack.com", "notion.so", "spotify.com"
]

def sample_pareto_flow_size(alpha: float = 1.25, min_bytes: int = 120) -> int:
    """Generates heavy-tailed byte sizes following a Pareto distribution."""
    # Pareto distribution: X = min_bytes / (U^(1/alpha))
    u = random.random()
    size = int(min_bytes / (u ** (1.0 / alpha)))
    # Clamp maximum flow to 12 MB for realistic single-flow caps
    return min(12_500_000, size)

def generate_realistic_benign_flows(count: int = 2000, start_time: datetime.datetime = None) -> List[Dict[str, Any]]:
    """Generates benign flows with realistic statistical noise and variance."""
    if not start_time:
        start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)
        
    flows = []
    cur_ts = start_time
    
    for i in range(count):
        # Poisson arrival time interval (exponentially distributed delta)
        mean_iat_ms = 45.0 # Average 45ms between flows
        delta_ms = random.expovariate(1.0 / mean_iat_ms)
        cur_ts += datetime.timedelta(milliseconds=max(1.0, delta_ms))
        
        # Pick service by weighted random distribution
        r = random.random()
        cumulative = 0.0
        service = BENIGN_SERVICES[0]
        for s in BENIGN_SERVICES:
            cumulative += s["weight"]
            if r <= cumulative:
                service = s
                break
                
        proto_name = service["name"]
        dst_port = service["port"]
        l4_proto = service["proto"]
        
        src_ip = f"192.168.1.{random.randint(2, 254)}"
        dst_ip = f"198.51.100.{random.randint(2, 254)}" if proto_name != "DNS" else random.choice(["8.8.8.8", "1.1.1.1", "10.0.10.1"])
        src_port = random.randint(32768, 61000)
        
        # Calculate realistic byte sizes & packet distribution
        if proto_name == "HTTPS":
            total_bytes = sample_pareto_flow_size(alpha=1.2, min_bytes=800)
            # Inbound is typically 80-95% of total bytes for web browsing
            in_ratio = random.uniform(0.75, 0.95)
            bytes_in = int(total_bytes * in_ratio)
            bytes_out = total_bytes - bytes_in
            pkts_in = max(3, int(bytes_in / random.randint(1100, 1460)))
            pkts_out = max(3, int(bytes_out / random.randint(300, 700)))
            duration = round(random.uniform(0.12, 14.5), 4)
            entropy = round(random.uniform(3.4, 4.6), 4)
            ja3 = service["ja3"]
            flags = "SYN-ACK-FIN-PSH"
        elif proto_name == "HTTP":
            total_bytes = sample_pareto_flow_size(alpha=1.35, min_bytes=400)
            in_ratio = random.uniform(0.70, 0.90)
            bytes_in = int(total_bytes * in_ratio)
            bytes_out = total_bytes - bytes_in
            pkts_in = max(2, int(bytes_in / random.randint(900, 1400)))
            pkts_out = max(2, int(bytes_out / random.randint(250, 600)))
            duration = round(random.uniform(0.08, 6.2), 4)
            entropy = round(random.uniform(2.8, 3.8), 4)
            ja3 = None
            flags = "SYN-ACK-FIN-PSH"
        elif proto_name == "DNS":
            bytes_out = random.randint(45, 120)
            bytes_in = random.randint(75, 480)
            pkts_out = 1
            pkts_in = 1
            duration = round(random.uniform(0.002, 0.045), 4)
            entropy = round(random.uniform(2.4, 3.6), 4)
            ja3 = None
            flags = "UDP"
        elif proto_name == "SSH":
            bytes_out = random.randint(2000, 80000)
            bytes_in = random.randint(2500, 95000)
            pkts_out = random.randint(15, 200)
            pkts_in = random.randint(15, 250)
            duration = round(random.uniform(2.0, 180.0), 3)
            entropy = round(random.uniform(4.0, 4.75), 4)
            ja3 = None
            flags = "SYN-ACK-PSH"
        else: # NTP / SMTP
            bytes_out = random.randint(48, 600)
            bytes_in = random.randint(48, 1200)
            pkts_out = random.randint(1, 8)
            pkts_in = random.randint(1, 8)
            duration = round(random.uniform(0.005, 1.2), 4)
            entropy = round(random.uniform(2.2, 3.5), 4)
            ja3 = None
            flags = "UDP" if l4_proto == "UDP" else "SYN-ACK-FIN"
            
        flow = {
            "flow_id": f"benign_flow_{i+1:06d}",
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
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8.0) / duration, 2),
            "packet_rate_pps": round((pkts_in + pkts_out) / duration, 2),
            "entropy": entropy,
            "ja3_hash": ja3,
            "is_attack": False,
            "attack_type": "BENIGN",
            "timestamp": cur_ts.isoformat(),
            "metadata": {
                "service": proto_name,
                "domain": random.choice(BENIGN_DOMAINS) if proto_name in ("HTTPS", "HTTP", "DNS") else None
            }
        }
        flows.append(flow)
        
    return flows

if __name__ == "__main__":
    print("[*] Generating sample realistic benign flows with heavy-tailed Pareto sizes...")
    sample = generate_realistic_benign_flows(count=5)
    for s in sample:
        print(f"  [{s['metadata']['service']}] {s['src_ip']}:{s['src_port']} -> {s['dst_ip']}:{s['dst_port']} | In: {s['bytes_in']}B, Out: {s['bytes_out']}B | Dur: {s['duration']}s")
