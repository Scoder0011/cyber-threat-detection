"""
Flow Feature Extraction Pipeline
================================
Extracts statistical, bidirectional, and TCP flag characteristics
from raw network flows (NetFlow / IPFIX / packet aggregations).
"""

import math
from typing import Dict, Any, List
from ai_models.common.feature_base import BaseFeatureExtractor

class FlowFeatureExtractor(BaseFeatureExtractor):
    """Extracts standard L3/L4 statistical flow characteristics."""

    def __init__(self):
        super().__init__(name="flow_features")

    def get_feature_names(self) -> List[str]:
        return [
            "duration",
            "bytes_in",
            "bytes_out",
            "pkts_in",
            "pkts_out",
            "total_bytes",
            "total_pkts",
            "byte_ratio_out_in",
            "pkt_ratio_out_in",
            "flow_rate_bps",
            "packet_rate_pps",
            "avg_pkt_size_in",
            "avg_pkt_size_out",
            "is_tcp",
            "is_udp",
            "has_syn",
            "has_ack",
            "has_fin",
            "has_rst",
            "has_psh",
            "entropy"
        ]

    def extract(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts numerical flow vector from a flow dict."""
        duration = float(flow.get("duration", 0.001))
        duration = max(0.0001, duration)

        bytes_in = int(flow.get("bytes_in", 0))
        bytes_out = int(flow.get("bytes_out", 0))
        pkts_in = int(flow.get("pkts_in", 0))
        pkts_out = int(flow.get("pkts_out", 0))

        total_bytes = bytes_in + bytes_out
        total_pkts = pkts_in + pkts_out

        # Ratios
        byte_ratio_out_in = round(bytes_out / max(1, bytes_in), 4)
        pkt_ratio_out_in = round(pkts_out / max(1, pkts_in), 4)

        # Rates
        flow_rate_bps = round((total_bytes * 8.0) / duration, 2)
        packet_rate_pps = round(total_pkts / duration, 2)

        # Average packet sizes
        avg_pkt_size_in = round(bytes_in / max(1, pkts_in), 2)
        avg_pkt_size_out = round(bytes_out / max(1, pkts_out), 2)

        # Protocols & TCP Flags
        proto = str(flow.get("protocol", "TCP")).upper()
        flags = str(flow.get("tcp_flags", "")).upper()

        return {
            "duration": round(duration, 4),
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "total_bytes": total_bytes,
            "total_pkts": total_pkts,
            "byte_ratio_out_in": byte_ratio_out_in,
            "pkt_ratio_out_in": pkt_ratio_out_in,
            "flow_rate_bps": flow_rate_bps,
            "packet_rate_pps": packet_rate_pps,
            "avg_pkt_size_in": avg_pkt_size_in,
            "avg_pkt_size_out": avg_pkt_size_out,
            "is_tcp": 1 if "TCP" in proto else 0,
            "is_udp": 1 if "UDP" in proto else 0,
            "has_syn": 1 if "SYN" in flags else 0,
            "has_ack": 1 if "ACK" in flags else 0,
            "has_fin": 1 if "FIN" in flags else 0,
            "has_rst": 1 if "RST" in flags else 0,
            "has_psh": 1 if "PSH" in flags else 0,
            "entropy": float(flow.get("entropy", 0.0))
        }


def extract_flow_features(raw_input: dict) -> dict:
    """Extract DDoS/DoS flow features expected by ddos_bot."""
    if not isinstance(raw_input, dict):
        raw_input = {}

    duration = float(raw_input.get("duration", 0.001))
    duration = max(0.0001, duration)

    total_packets = float(raw_input.get("total_packets", float(raw_input.get("pkts_in", 0)) + float(raw_input.get("pkts_out", 0))))
    total_bytes = float(raw_input.get("total_bytes", float(raw_input.get("bytes_in", 0)) + float(raw_input.get("bytes_out", 0))))

    syn_count = float(raw_input.get("syn_count", raw_input.get("syn", 0.0)))
    ack_count = float(raw_input.get("ack_count", raw_input.get("ack", 0.0)))
    rst_count = float(raw_input.get("rst_count", raw_input.get("rst", 0.0)))
    unique_src_ports = float(raw_input.get("unique_src_ports", raw_input.get("src_port", raw_input.get("src_ports", 1.0))))

    packets_per_second = total_packets / duration
    bytes_per_second = total_bytes / duration
    bytes_per_packet = total_bytes / max(1.0, total_packets)
    syn_ack_ratio = syn_count / max(1.0, ack_count)
    rst_ratio = rst_count / max(1.0, total_packets)

    return {
        "duration": round(duration, 4),
        "total_packets": round(total_packets, 4),
        "total_bytes": round(total_bytes, 4),
        "packets_per_second": round(packets_per_second, 4),
        "bytes_per_second": round(bytes_per_second, 4),
        "bytes_per_packet": round(bytes_per_packet, 4),
        "syn_ack_ratio": round(syn_ack_ratio, 4),
        "rst_ratio": round(rst_ratio, 4),
        "unique_src_ports": round(unique_src_ports, 4),
    }


def extract_timing_features(raw_input: dict) -> dict:
    """Extract C2 beaconing interval/timing features expected by beaconing_bot."""
    import numpy as np
    if not isinstance(raw_input, dict):
        raw_input = {}

    intervals = []
    if "inter_arrival_times" in raw_input:
        val = raw_input["inter_arrival_times"]
        if isinstance(val, str):
            try:
                import json
                intervals = json.loads(val)
            except Exception:
                import ast
                intervals = ast.literal_eval(val)
        elif isinstance(val, (list, tuple)):
            intervals = list(val)
    elif "intervals" in raw_input:
        intervals = list(raw_input["intervals"])
    elif "timestamps" in raw_input:
        ts = sorted(raw_input["timestamps"])
        if len(ts) > 1:
            intervals = [t2 - t1 for t1, t2 in zip(ts[:-1], ts[1:])]
        else:
            intervals = [0.0]

    if not intervals:
        intervals = [float(raw_input.get("interval", 1.0))]

    intervals = [float(x) for x in intervals]
    packet_count = float(len(intervals) + 1 if "timestamps" in raw_input or "inter_arrival_times" in raw_input else len(intervals))
    session_span = float(sum(intervals))

    mean_interval = float(np.mean(intervals)) if len(intervals) > 0 else 0.0
    std_interval = float(np.std(intervals)) if len(intervals) > 0 else 0.0
    cv_interval = std_interval / max(1e-5, mean_interval)

    if len(intervals) > 1:
        jitter_diffs = [abs(intervals[i+1] - intervals[i]) for i in range(len(intervals)-1)]
        jitter_ratio = float(np.mean(jitter_diffs)) / max(1e-5, mean_interval)
    else:
        jitter_ratio = 0.0

    return {
        "mean_interval": round(mean_interval, 4),
        "std_interval": round(std_interval, 4),
        "cv_interval": round(cv_interval, 4),
        "jitter_ratio": round(jitter_ratio, 4),
        "packet_count": round(packet_count, 4),
        "session_span": round(session_span, 4),
    }


def extract_volume_features(raw_input: dict) -> dict:
    """Extract exfiltration volume and ratio features expected by exfiltration_bot."""
    if not isinstance(raw_input, dict):
        raw_input = {}

    outbound = float(raw_input.get("outbound_bytes", raw_input.get("bytes_out", 0.0)))
    inbound = float(raw_input.get("inbound_bytes", raw_input.get("bytes_in", 0.0)))

    if "out_in_ratio" in raw_input:
        out_in_ratio = float(raw_input["out_in_ratio"])
    elif "ratio_out_in" in raw_input:
        out_in_ratio = float(raw_input["ratio_out_in"])
    else:
        out_in_ratio = outbound / max(1.0, inbound)

    duration = float(raw_input.get("duration", 1.0))
    duration = max(0.0001, duration)

    request_count = float(raw_input.get("request_count", raw_input.get("total_packets", raw_input.get("pkts_out", 1.0))))
    request_count = max(1.0, request_count)

    bytes_per_request = outbound / request_count
    outbound_rate = outbound / duration

    return {
        "outbound_bytes": round(outbound, 4),
        "inbound_bytes": round(inbound, 4),
        "out_in_ratio": round(out_in_ratio, 4),
        "bytes_per_request": round(bytes_per_request, 4),
        "outbound_rate": round(outbound_rate, 4),
    }
