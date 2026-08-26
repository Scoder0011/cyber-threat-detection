#!/usr/bin/env python3
"""
Realistic DNS Tunneling & Data Exfiltration Emulator (dnscat2 / iodine Profiles)
================================================================================
Emulates covert C2 and data exfiltration channels running over standard DNS resolvers:
- Fragments files / data streams into variable Base32 / Base64 / Hex chunks
- Embeds encoded chunks into TXT, A, AAAA, and CNAME subdomains
- Simulates multi-packet sequence assembly and download/upload sessions
- Computes realistic Shannon character entropy (>4.2) and query rate spikes
"""

import os
import sys
import math
import json
import base64
import random
import string
import datetime
from typing import List, Dict, Any

def calc_entropy(s: str) -> float:
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    l = len(s)
    return round(-sum((cnt / l) * math.log2(cnt / l) for cnt in freq.values()), 4)

class DNSTunnelEmulator:
    """Emulates dnscat2 and iodine DNS tunneling communication channels."""

    def __init__(
        self,
        domain_suffix: str = "tunnel.c2exfil-network.org",
        client_ip: str = "192.168.1.88",
        dns_server_ip: str = "185.220.101.44"
    ):
        self.domain_suffix = domain_suffix
        self.client_ip = client_ip
        self.dns_server_ip = dns_server_ip
        self.session_id = f"{random.randint(1000, 9999):04x}"

    def generate_tunnel_session(self, raw_payload_bytes: bytes = None, chunk_count: int = 50) -> List[Dict[str, Any]]:
        """Splits an exfiltration payload into DNS query records."""
        if not raw_payload_bytes:
            # Generate sample confidential database / document dump
            raw_payload_bytes = ("CONFIDENTIAL_INTERNAL_DB_DUMP_TABLE_USERS_CREDENTIALS_" * (chunk_count * 2)).encode()

        queries = []
        now = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=30)
        
        chunk_size = 32 # 32 bytes = 44-char base64 string
        total_chunks = min(chunk_count, math.ceil(len(raw_payload_bytes) / chunk_size))
        
        for seq in range(total_chunks):
            # Inter-arrival time is tight (burst exfiltration 50ms - 250ms)
            now += datetime.timedelta(milliseconds=random.randint(40, 220))
            chunk = raw_payload_bytes[seq * chunk_size : (seq + 1) * chunk_size]
            
            # Base32 or Base64 encoding without padding
            encoded_chunk = base64.b32encode(chunk).decode().rstrip("=").lower()
            query_name = f"{self.session_id}.seq{seq:03d}.{encoded_chunk}.{self.domain_suffix}"
            
            ent = calc_entropy(query_name)
            qtype = random.choice(["TXT", "TXT", "A", "CNAME"])
            payload_size = len(query_name) + (256 if qtype == "TXT" else 64)
            
            queries.append({
                "query_id": f"dns_tunnel_{self.session_id}_{seq:04d}",
                "client_ip": self.client_ip,
                "server_ip": self.dns_server_ip,
                "query_name": query_name,
                "query_type": qtype,
                "response_code": "NOERROR",
                "payload_size_bytes": payload_size,
                "entropy": ent,
                "is_tunneling": True,
                "tunneling_score": round(random.uniform(0.92, 0.995), 4),
                "timestamp": now.isoformat(),
                "metadata": {
                    "tool": "dnscat2_emulator",
                    "session_id": self.session_id,
                    "seq_num": seq,
                    "total_chunks": total_chunks,
                    "chunk_entropy": ent
                }
            })
            
        return queries

if __name__ == "__main__":
    emulator = DNSTunnelEmulator()
    records = emulator.generate_tunnel_session(chunk_count=10)
    print(f"[*] Generated {len(records)} dnscat2 tunneling query frames:")
    for r in records[:5]:
        print(f"  [{r['query_type']}] {r['query_name'][:55]}... | Entropy: {r['entropy']} | Bytes: {r['payload_size_bytes']}")
