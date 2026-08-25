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
