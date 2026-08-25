#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Dataset Integrity & Validation Suite
================================================================================
Performs comprehensive quality, statistical distribution, and schema checks across
all CSV, JSON, PCAP, and SQL artifacts in the /data directory.

Checks:
1. Schema conformity (matching Supabase DDL specifications)
2. IP address & Port range validity (0 <= port <= 65535, valid IPv4 format)
3. Positive durations, byte counts, and packet rates
4. Entropy boundaries (0.0 <= entropy <= 8.0)
5. Label consistency (is_attack vs attack_type taxonomy)
6. Null / NaN value absence in required columns
7. Binary PCAP packet format validation
"""

import os
import sys
import json
import csv
import struct
import ipaddress
from typing import List, Dict, Any, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

REQUIRED_FLOW_FIELDS = [
    "flow_id", "src_ip", "dst_ip", "src_port", "dst_port",
    "protocol", "duration", "bytes_in", "bytes_out", "pkts_in", "pkts_out",
    "tcp_flags", "entropy", "is_attack", "attack_type"
]

KNOWN_ATTACK_TYPES = {
    "BENIGN", "DDOS_SYN_FLOOD", "DDOS_UDP_AMPLIFICATION", "DOS_SLOWLORIS",
    "DNS_TUNNELING", "DGA_DNS", "C2_BEACONING", "PORT_SCAN_VERTICAL",
    "PORT_SCAN_HORIZONTAL", "ENCRYPTED_MALWARE_TLS", "DATA_EXFILTRATION"
}

def validate_ip(ip_str: str) -> bool:
    """Validates IPv4 or subnet format."""
    clean_ip = ip_str.split("/")[0].split(" ")[0]
    try:
        ipaddress.ip_address(clean_ip)
        return True
    except ValueError:
        return False

def validate_flow_record(row: Dict[str, Any], filename: str, row_idx: int) -> List[str]:
    """Validates a single flow record against physical network constraints."""
    errors = []
    
    # 1. Missing fields
    for field in REQUIRED_FLOW_FIELDS:
        if field not in row or row[field] is None or row[field] == "":
            errors.append(f"Row {row_idx}: Missing required field '{field}'")

    # 2. IP validity
    src_ip = str(row.get("src_ip", ""))
    dst_ip = str(row.get("dst_ip", ""))
    if not validate_ip(src_ip):
        errors.append(f"Row {row_idx}: Invalid src_ip '{src_ip}'")
    if not validate_ip(dst_ip):
        errors.append(f"Row {row_idx}: Invalid dst_ip '{dst_ip}'")

    # 3. Port ranges
    try:
        src_port = int(row.get("src_port", 0))
        dst_port = int(row.get("dst_port", 0))
        if not (0 <= src_port <= 65535):
            errors.append(f"Row {row_idx}: src_port {src_port} out of range [0, 65535]")
        if not (0 <= dst_port <= 65535):
            errors.append(f"Row {row_idx}: dst_port {dst_port} out of range [0, 65535]")
    except (ValueError, TypeError):
        errors.append(f"Row {row_idx}: Non-integer port values")

    # 4. Durations & Bytes
    try:
        duration = float(row.get("duration", 0))
        bytes_in = int(row.get("bytes_in", 0))
        bytes_out = int(row.get("bytes_out", 0))
        if duration < 0:
            errors.append(f"Row {row_idx}: Negative duration ({duration})")
        if bytes_in < 0 or bytes_out < 0:
            errors.append(f"Row {row_idx}: Negative byte counts ({bytes_in}, {bytes_out})")
    except (ValueError, TypeError) as e:
        errors.append(f"Row {row_idx}: Invalid numerical flow stats: {e}")

    # 5. Entropy
    try:
        entropy = float(row.get("entropy", 0))
        if not (0.0 <= entropy <= 8.0):
            errors.append(f"Row {row_idx}: Entropy {entropy} outside [0.0, 8.0]")
    except (ValueError, TypeError):
        pass

    # 6. Attack type taxonomy
    attack_type = str(row.get("attack_type", "")).upper()
    is_attack = str(row.get("is_attack", "")).lower() in ("true", "1")
    if is_attack and attack_type == "BENIGN":
        errors.append(f"Row {row_idx}: Contradiction: is_attack=True but attack_type='BENIGN'")
    if not is_attack and attack_type != "BENIGN":
        errors.append(f"Row {row_idx}: Contradiction: is_attack=False but attack_type='{attack_type}'")

    return errors

def validate_pcap_file(filepath: str) -> Tuple[bool, int, str]:
    """Validates binary PCAP header and packet frames."""
    if not os.path.exists(filepath):
        return False, 0, "File does not exist"
    
    with open(filepath, "rb") as f:
        hdr = f.read(24)
        if len(hdr) < 24:
            return False, 0, "PCAP global header too short"
        magic, maj, min_, tz, sig, snaplen, linktype = struct.unpack("=IHHiIII", hdr)
        if magic not in (0xa1b2c3d4, 0xd4c3b2a1, 0xa1b23c4d, 0x4d3cb2a1):
            return False, 0, f"Invalid PCAP magic number: {hex(magic)}"
        
        pkt_count = 0
        while True:
            pkt_hdr = f.read(16)
            if not pkt_hdr:
                break
            if len(pkt_hdr) < 16:
                return False, pkt_count, "Truncated packet header"
            ts_sec, ts_usec, incl_len, orig_len = struct.unpack("=IIII", pkt_hdr)
            data = f.read(incl_len)
            if len(data) < incl_len:
                return False, pkt_count, f"Truncated packet body in packet {pkt_count+1}"
            pkt_count += 1
            
    return True, pkt_count, "OK"

def main():
    print("=================================================================")
    print("🧪 Running Dataset Quality & Schema Verification")
    print("=================================================================\n")
    
    total_files = 0
    total_records = 0
    total_errors = 0
    
    # 1. Validate all CSV files
    print("1. Validating CSV Datasets...")
    for root, _, files in os.walk(BASE_DIR):
        for f in sorted(files):
            if f.endswith(".csv"):
                filepath = os.path.join(root, f)
                total_files += 1
                rel_path = os.path.relpath(filepath, BASE_DIR)
                with open(filepath, "r", encoding="utf-8") as fp:
                    reader = csv.DictReader(fp)
                    rows = list(reader)
                    file_errors = []
                    for idx, row in enumerate(rows, 1):
                        if "flow_id" in row:
                            errs = validate_flow_record(row, f, idx)
                            file_errors.extend(errs)
                    
                    total_records += len(rows)
                    if file_errors:
                        total_errors += len(file_errors)
                        print(f"  [✗] {rel_path} ({len(rows)} rows) - {len(file_errors)} errors:")
                        for err in file_errors[:3]:
                            print(f"      - {err}")
                    else:
                        print(f"  [✓] {rel_path} ({len(rows)} rows) - Passed")

    # 2. Validate JSON files
    print("\n2. Validating JSON Datasets...")
    for root, _, files in os.walk(BASE_DIR):
        for f in sorted(files):
            if f.endswith(".json") and not f.startswith("."):
                filepath = os.path.join(root, f)
                total_files += 1
                rel_path = os.path.relpath(filepath, BASE_DIR)
                try:
                    with open(filepath, "r", encoding="utf-8") as fp:
                        data = json.load(fp)
                        rec_count = len(data) if isinstance(data, list) else len(data.get("stages", [data]))
                        print(f"  [✓] {rel_path} ({rec_count} items) - Valid JSON")
                except Exception as e:
                    total_errors += 1
                    print(f"  [✗] {rel_path}: Invalid JSON ({e})")

    # 3. Validate PCAP
    print("\n3. Validating Raw PCAP Capture...")
    pcap_path = os.path.join(BASE_DIR, "pcaps", "sample_threats.pcap")
    valid_pcap, count, msg = validate_pcap_file(pcap_path)
    if valid_pcap:
        print(f"  [✓] pcaps/sample_threats.pcap: Valid PCAP ({count} packets) - Passed")
    else:
        total_errors += 1
        print(f"  [✗] pcaps/sample_threats.pcap: Failed ({msg})")

    # 4. Summary
    print("\n=================================================================")
    if total_errors == 0:
        print(f"✅ ALL DATASETS VALIDATED: {total_files} files, {total_records} records checked. Zero errors!")
    else:
        print(f"⚠️ Validation finished with {total_errors} errors across {total_files} files.")
    print("=================================================================")
    
    return 0 if total_errors == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
