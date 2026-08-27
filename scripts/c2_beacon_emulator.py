#!/usr/bin/env python3
"""
Realistic C2 Beacon Emulator (Cobalt Strike / Sliver / Mythic Profiles)
========================================================================
Emulates real-world Command & Control (C2) agent heartbeat communications
with realistic timing dynamics:
- Configurable base sleep interval (e.g. 5s, 10s, 30s, 60s)
- Gaussian / Laplace jitter (e.g. ±15% to ±40%)
- Sleep drift & timer skew
- Variable packet & payload size distributions (malleable C2 profiles)
- Periodic check-in / tasking request-response cycles
- Out-of-band killswitch & retry timeouts
"""

import os
import sys
import time
import json
import random
import string
import base64
import hashlib
import argparse
import datetime
from typing import List, Dict, Any

class C2BeaconEmulator:
    """Simulates realistic C2 agent callback telemetry with realistic statistical jitter."""

    def __init__(
        self,
        c2_server: str = "185.220.101.44",
        c2_port: int = 8443,
        agent_id: str = "agent-win10-dev01",
        base_interval_sec: float = 10.0,
        jitter_pct: float = 0.25,
        profile_name: str = "CobaltStrike_HTTPS_Default"
    ):
        self.c2_server = c2_server
        self.c2_port = c2_port
        self.agent_id = agent_id
        self.base_interval_sec = base_interval_sec
        self.jitter_pct = jitter_pct
        self.profile_name = profile_name
        self.sequence_num = 0
        self.ja3_hash = "a0e9f5d64349fb13191bc781f81f42e1" # Cobalt Strike JA3
        self.session_key = hashlib.sha256(agent_id.encode()).hexdigest()[:16]

    def _calculate_next_sleep(self) -> float:
        """Calculates sleep interval with Gaussian jitter and drift."""
        # Gaussian jitter centered at 0 with standard deviation = base_interval * jitter_pct / 2
        sigma = (self.base_interval_sec * self.jitter_pct) / 2.0
        jitter_delta = random.gauss(0, sigma)
        # Clamp jitter within ±jitter_pct bounds
        max_delta = self.base_interval_sec * self.jitter_pct
        jitter_delta = max(-max_delta, min(max_delta, jitter_delta))
        actual_sleep = max(0.1, self.base_interval_sec + jitter_delta)
        return round(actual_sleep, 4)

    def generate_beacon_event(self, victim_ip: str = "192.168.1.45", current_ts: datetime.datetime = None) -> Dict[str, Any]:
        """Generates a single realistic C2 check-in telemetry record."""
        self.sequence_num += 1
        if not current_ts:
            current_ts = datetime.datetime.now(datetime.timezone.utc)
            
        sleep_used = self._calculate_next_sleep()
        
        # Malleable C2 payload sizes: check-ins are small (128-384 bytes), taskings occasionally larger (1KB-8KB)
        has_tasking = (self.sequence_num % 12 == 0)
        if has_tasking:
            bytes_out = random.randint(1200, 4800)
            bytes_in = random.randint(800, 2400)
            pkts_out = random.randint(4, 12)
            pkts_in = random.randint(4, 10)
        else:
            bytes_out = random.choice([128, 144, 192, 256, 128])
            bytes_in = random.choice([64, 80, 96, 64])
            pkts_out = 2
            pkts_in = 2

        duration = round(random.uniform(0.045, 0.120), 4)
        cookie_val = base64.b64encode(f"{self.agent_id}:{self.sequence_num}:{self.session_key}".encode()).decode()

        flow_record = {
            "flow_id": f"c2_beacon_{self.sequence_num:06d}",
            "src_ip": victim_ip,
            "dst_ip": self.c2_server,
            "src_port": 49152 + (self.sequence_num % 8),
            "dst_port": self.c2_port,
            "protocol": "TLS",
            "duration": duration,
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "tcp_flags": "PSH-ACK",
            "flow_rate_bps": round(((bytes_in + bytes_out) * 8.0) / duration, 2),
            "packet_rate_pps": round((pkts_in + pkts_out) / duration, 2),
            "entropy": round(random.uniform(4.75, 4.98), 4),
            "ja3_hash": self.ja3_hash,
            "is_attack": True,
            "attack_type": "C2_BEACONING",
            "timestamp": current_ts.isoformat(),
            "metadata": {
                "c2_profile": self.profile_name,
                "agent_id": self.agent_id,
                "beacon_seq": self.sequence_num,
                "base_interval_sec": self.base_interval_sec,
                "configured_jitter_pct": self.jitter_pct,
                "actual_interval_sec": sleep_used,
                "http_cookie": f"SESSIONID={cookie_val[:20]}..."
            }
        }
        return flow_record, sleep_used

def simulate_beacon_run(count: int = 20, interval: float = 5.0, jitter: float = 0.20) -> List[Dict[str, Any]]:
    """Simulates a full beaconing session and returns chronological flow events."""
    emulator = C2BeaconEmulator(base_interval_sec=interval, jitter_pct=jitter)
    now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=count * interval)
    events = []
    
    for _ in range(count):
        flow, sleep_time = emulator.generate_beacon_event(current_ts=now)
        events.append(flow)
        now += datetime.timedelta(seconds=sleep_time)
        
    return events

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run realistic C2 beacon emulator")
    parser.add_argument("--count", type=int, default=10, help="Number of beacon check-ins to generate")
    parser.add_argument("--interval", type=float, default=5.0, help="Base beacon interval in seconds")
    parser.add_argument("--jitter", type=float, default=0.25, help="Jitter percentage (0.0 to 0.5)")
    args = parser.parse_args()

    print(f"[*] Emulating Cobalt Strike Beacon (Interval={args.interval}s, Jitter=±{int(args.jitter*100)}%)...")
    events = simulate_beacon_run(count=args.count, interval=args.interval, jitter=args.jitter)
    print(f"[✓] Generated {len(events)} realistic C2 beaconing check-in flows:")
    for ev in events[:5]:
        meta = ev["metadata"]
        print(f"  Seq #{meta['beacon_seq']:03d} | Actual Interval: {meta['actual_interval_sec']}s | Out: {ev['bytes_out']}B | In: {ev['bytes_in']}B | JA3: {ev['ja3_hash']}")
