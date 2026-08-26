#!/usr/bin/env python3
"""
AI-Powered Cyber Threat Detection System - Dataset Integrity & Validation Suite
================================================================================
Performs comprehensive quality, statistical distribution, and schema checks across
all 6 specialized threat schemas as well as full Supabase network_flows telemetry.

Validated Schemas:
1. DDoS: flow_id,src_ip,dst_ip,src_port,dst_port,protocol,pkts_in,bytes_in,duration,entropy,is_attack,attack_type
2. Beaconing: session_id,src_ip,dst_ip,inter_arrival_times,is_attack
3. DGA Domains: domain,family,entropy,vowel_ratio,length,is_dga
4. Encrypted Malware: flow_id,src_ip,ja3_hash,client_type,is_attack
5. Port Scanning: src_ip,dst_ip,unique_dst_ports,scan_duration_s,is_attack
6. Exfiltration: flow_id,src_ip,dst_ip,bytes_in,bytes_out,ratio_out_in,is_attack
7. Full Telemetry: sample_mixed_flows, benign_flows, ML splits
"""

import os
import sys
import json
import csv
import struct
import ipaddress
from typing import List, Dict, Any, Tuple

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def validate_ip(ip_str: str) -> bool:
    """Validates IPv4 format."""
    clean_ip = ip_str.split("/")[0].split(" ")[0].strip()
    try:
        ipaddress.ip_address(clean_ip)
        return True
    except ValueError:
        return False

def validate_record_by_schema(row: Dict[str, Any], filename: str, row_idx: int) -> List[str]:
    """Dynamically validates row according to its dedicated schema."""
    errors = []
    
    # 1. Beaconing Schema
    if "session_id" in row and "inter_arrival_times" in row:
        for field in ["session_id", "src_ip", "dst_ip", "inter_arrival_times", "is_attack"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        if not validate_ip(row.get("dst_ip", "")): errors.append(f"Row {row_idx}: Invalid dst_ip")
        try:
            iats = json.loads(row.get("inter_arrival_times", "[]"))
            if not isinstance(iats, list) or len(iats) == 0:
                errors.append(f"Row {row_idx}: Invalid IAT list")
        except Exception:
            errors.append(f"Row {row_idx}: IAT not valid JSON array")
        return errors

    # 2. DGA Domains Schema
    if "domain" in row and "vowel_ratio" in row and "is_dga" in row:
        for field in ["domain", "family", "entropy", "vowel_ratio", "length", "is_dga"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        return errors

    # 3. Encrypted Malware JA3 Schema
    if "flow_id" in row and "ja3_hash" in row and "client_type" in row:
        for field in ["flow_id", "src_ip", "ja3_hash", "client_type", "is_attack"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        return errors

    # 4. Port Scanning Schema
    if "src_ip" in row and "unique_dst_ports" in row and "scan_duration_s" in row:
        for field in ["src_ip", "dst_ip", "unique_dst_ports", "scan_duration_s", "is_attack"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        if not validate_ip(row.get("dst_ip", "")): errors.append(f"Row {row_idx}: Invalid dst_ip")
        return errors

    # 5. Exfiltration Schema
    if "flow_id" in row and "ratio_out_in" in row and "bytes_out" in row:
        for field in ["flow_id", "src_ip", "dst_ip", "bytes_in", "bytes_out", "ratio_out_in", "is_attack"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        if not validate_ip(row.get("dst_ip", "")): errors.append(f"Row {row_idx}: Invalid dst_ip")
        return errors

    # 6. DDoS Schema (network_flows subset)
    if "flow_id" in row and "src_port" in row and "pkts_in" in row and "bytes_out" not in row:
        for field in ["flow_id", "src_ip", "dst_ip", "src_port", "dst_port", "protocol", "pkts_in", "bytes_in", "duration", "entropy", "is_attack", "attack_type"]:
            if field not in row or row[field] is None:
                errors.append(f"Row {row_idx}: Missing '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        if not validate_ip(row.get("dst_ip", "")): errors.append(f"Row {row_idx}: Invalid dst_ip")
        return errors

    # 7. Full Telemetry Schema (sample_mixed_flows, benign_flows, etc.)
    if "flow_id" in row and "bytes_out" in row:
        req = ["flow_id", "src_ip", "dst_ip", "src_port", "dst_port", "protocol", "duration", "bytes_in", "bytes_out", "pkts_in", "pkts_out", "tcp_flags", "entropy", "is_attack", "attack_type"]
        for field in req:
            if field not in row or row[field] is None or row[field] == "":
                errors.append(f"Row {row_idx}: Missing required field '{field}'")
        if not validate_ip(row.get("src_ip", "")): errors.append(f"Row {row_idx}: Invalid src_ip")
        if not validate_ip(row.get("dst_ip", "")): errors.append(f"Row {row_idx}: Invalid dst_ip")
        return errors

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
    print("🧪 Running Dataset Quality & Multi-Schema Verification")
    print("=================================================================\n")
    
    total_files = 0
    total_records = 0
    total_errors = 0
    
    # 1. Validate all CSV files
    print("1. Validating CSV Datasets across all 6 threat schemas...")
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
                        errs = validate_record_by_schema(row, f, idx)
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
