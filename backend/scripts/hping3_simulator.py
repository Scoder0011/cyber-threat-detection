#!/usr/bin/env python3
"""
Realistic Socket Flood & Port Sweep Generator (hping3 & Nmap Emulation)
========================================================================
Generates high-throughput attack flows and scanning sweeps with realistic dynamics:
1. TCP SYN Floods (hping3 -S --flood): Randomized spoofed source IPs, fluctuating burst rates, zero ACKs.
2. UDP Reflection Amplification (hping3 --udp): DNS/NTP reflector nodes, large amplification ratios (35x-80x).
3. Vertical Port Scans (nmap -sS -p 1-1024): Sequential/randomized target port sweeps, realistic timeout/RST returns.
4. Horizontal Subnet Sweeps (nmap -sS -p 445 192.168.1.0/24): Probing fixed port across IP ranges.
"""

import os
import sys
import random
import datetime
from typing import List, Dict, Any

class Hping3Simulator:
    """Generates high-throughput network flood attacks with statistical burst variance."""

    @staticmethod
    def generate_syn_flood(
        count: int = 1000,
        target_ip: str = "10.0.10.20",
        target_port: int = 80,
        start_time: datetime.datetime = None
    ) -> List[Dict[str, Any]]:
        if not start_time:
            start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=45)
            
        flows = []
        cur_ts = start_time
        
        # Botnet size: 128 to 512 distinct compromised hosts
        botnet_ips = [
            f"{random.randint(11, 215)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            for _ in range(256)
        ]
        
        for i in range(count):
            # Realistic flood bursts: microsecond deltas with burst variations
            burst_delay_us = random.choices([50, 100, 250, 600, 1500], weights=[0.4, 0.3, 0.15, 0.1, 0.05])[0]
            cur_ts += datetime.timedelta(microseconds=burst_delay_us)
            
            src_ip = random.choice(botnet_ips)
            src_port = random.randint(1024, 65535)
            duration = round(random.uniform(0.0001, 0.0025), 5)
            
            # TCP SYN packet sizes: 40 (no options), 44 (MSS), 52 (Window scale), 60 (SACK permitted)
            packet_size = random.choice([40, 44, 52, 60])
            
            flow = {
                "flow_id": f"syn_flood_{i+1:06d}",
                "src_ip": src_ip,
                "dst_ip": target_ip,
                "src_port": src_port,
                "dst_port": target_port,
                "protocol": "TCP",
                "duration": duration,
                "bytes_in": 0,
                "bytes_out": packet_size,
                "pkts_in": 0,
                "pkts_out": 1,
                "tcp_flags": "SYN",
                "flow_rate_bps": round((packet_size * 8.0) / duration, 2),
                "packet_rate_pps": round(1.0 / duration, 2),
                "entropy": round(random.uniform(1.15, 2.10), 4),
                "ja3_hash": None,
                "is_attack": True,
                "attack_type": "DDOS_SYN_FLOOD",
                "timestamp": cur_ts.isoformat(),
                "metadata": {
                    "tool": "hping3_syn_flood",
                    "tcp_seq": random.randint(100000, 999999999),
                    "tcp_win_size": random.choice([1024, 2048, 64240, 65535]),
                    "target_service": target_port
                }
            }
            flows.append(flow)
        return flows

    @staticmethod
    def generate_udp_amp_flood(
        count: int = 500,
        victim_ip: str = "10.0.10.20",
        start_time: datetime.datetime = None
    ) -> List[Dict[str, Any]]:
        if not start_time:
            start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=35)
            
        reflectors = [
            ("198.51.100.53", 53, 45.0), # DNS open resolver (45x amp)
            ("203.0.113.123", 123, 70.0), # NTP monlist (70x amp)
            ("185.220.101.53", 53, 50.0),
            ("91.108.4.123", 123, 65.0),
            ("194.26.29.190", 1900, 35.0), # SSDP reflection
        ]
        
        flows = []
        cur_ts = start_time
        
        for i in range(count):
            cur_ts += datetime.timedelta(microseconds=random.randint(150, 1200))
            reflector_ip, ref_port, amp_factor = random.choice(reflectors)
            
            req_bytes = random.randint(45, 65)
            # Response bytes are amplified with Gaussian variance around amp_factor
            actual_amp = max(20.0, random.gauss(amp_factor, 8.0))
            resp_bytes = int(req_bytes * actual_amp)
            duration = round(random.uniform(0.002, 0.035), 4)
            
            flow = {
                "flow_id": f"udp_amp_{i+1:06d}",
                "src_ip": reflector_ip,
                "dst_ip": victim_ip,
                "src_port": ref_port,
                "dst_port": random.randint(32768, 65000),
                "protocol": "UDP",
                "duration": duration,
                "bytes_in": resp_bytes,
                "bytes_out": req_bytes,
                "pkts_in": max(2, int(resp_bytes / 1400)),
                "pkts_out": 1,
                "tcp_flags": "UDP",
                "flow_rate_bps": round(((resp_bytes + req_bytes) * 8.0) / duration, 2),
                "packet_rate_pps": round((max(2, int(resp_bytes / 1400)) + 1) / duration, 2),
                "entropy": round(random.uniform(3.75, 4.85), 4),
                "ja3_hash": None,
                "is_attack": True,
                "attack_type": "DDOS_UDP_AMPLIFICATION",
                "timestamp": cur_ts.isoformat(),
                "metadata": {
                    "tool": "hping3_udp_reflection",
                    "reflector": reflector_ip,
                    "amplification_ratio": round(actual_amp, 1)
                }
            }
            flows.append(flow)
        return flows

    @staticmethod
    def generate_nmap_scans(start_time: datetime.datetime = None) -> List[Dict[str, Any]]:
        """Generates realistic nmap SYN port sweeps and subnet sweeps."""
        if not start_time:
            start_time = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=50)
            
        flows = []
        attacker_ip = "185.220.101.15"
        cur_ts = start_time
        
        # 1. Vertical Port Scan (Ports 1 to 200 on server 10.0.10.5)
        open_ports = {22: "SSH", 80: "HTTP", 443: "HTTPS", 3306: "MySQL", 8080: "HTTP-Proxy"}
        for port in range(1, 201):
            cur_ts += datetime.timedelta(milliseconds=random.randint(4, 20))
            is_open = port in open_ports
            duration = round(random.uniform(0.0015, 0.008), 4)
            
            flow = {
                "flow_id": f"nmap_vscan_{port:04d}",
                "src_ip": attacker_ip,
                "dst_ip": "10.0.10.5",
                "src_port": 51000 + (port % 1000),
                "dst_port": port,
                "protocol": "TCP",
                "duration": duration,
                "bytes_in": 44 if is_open else 40,
                "bytes_out": 44,
                "pkts_in": 1,
                "pkts_out": 1,
                "tcp_flags": "SYN-ACK" if is_open else "SYN-RST",
                "flow_rate_bps": round(88 * 8.0 / duration, 2),
                "packet_rate_pps": round(2.0 / duration, 2),
                "entropy": 1.45,
                "ja3_hash": None,
                "is_attack": True,
                "attack_type": "PORT_SCAN_VERTICAL",
                "timestamp": cur_ts.isoformat(),
                "metadata": {
                    "tool": "nmap -sS (Vertical Port Scan)",
                    "scanned_port": port,
                    "service_detected": open_ports.get(port, "Closed")
                }
            }
            flows.append(flow)
        return flows

if __name__ == "__main__":
    print("[*] Generating sample hping3 SYN flood flows...")
    syn_sample = Hping3Simulator.generate_syn_flood(count=5)
    for s in syn_sample:
        print(f"  {s['src_ip']}:{s['src_port']} -> {s['dst_ip']}:{s['dst_port']} | {s['tcp_flags']} | {s['bytes_out']} bytes | Rate: {s['flow_rate_bps']} bps")
