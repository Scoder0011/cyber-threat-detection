"""
Unified Threat Feature Extraction Engine
========================================
Combines Flow, DNS, and TLS extractors into a single high-throughput
pipeline that produces formatted feature vectors for ML models and Supabase persistence.
"""

from typing import Dict, Any, List
from ai_models.common.feature_base import BaseFeatureExtractor
from ai_models.features.flow_features import FlowFeatureExtractor
from ai_models.features.dns_features import DNSFeatureExtractor
from ai_models.features.tls_features import TLSFeatureExtractor

class UnifiedFeatureExtractor(BaseFeatureExtractor):
    """Orchestrates flow, DNS, and TLS feature extraction in parallel."""

    def __init__(self):
        super().__init__(name="unified_feature_extractor")
        self.flow_extractor = FlowFeatureExtractor()
        self.dns_extractor = DNSFeatureExtractor()
        self.tls_extractor = TLSFeatureExtractor()

    def get_feature_names(self) -> List[str]:
        return (
            self.flow_extractor.get_feature_names() +
            self.dns_extractor.get_feature_names() +
            self.tls_extractor.get_feature_names()
        )

    def extract(self, raw_telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts a unified, combined numerical feature representation.

        Args:
            raw_telemetry: Network flow dict or packet summary.

        Returns:
            Dictionary containing flow, DNS, and TLS extracted metrics.
        """
        flow_feats = self.flow_extractor.extract(raw_telemetry)
        dns_feats = self.dns_extractor.extract(raw_telemetry)
        tls_feats = self.tls_extractor.extract(raw_telemetry)

        combined = {**flow_feats, **dns_feats, **tls_feats}
        return combined

    def extract_for_db(self, raw_telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts and formats telemetry specifically mapped to the Supabase `network_flows` schema.
        """
        duration = float(raw_telemetry.get("duration", 0.001))
        bytes_in = int(raw_telemetry.get("bytes_in", 0))
        bytes_out = int(raw_telemetry.get("bytes_out", 0))
        pkts_in = int(raw_telemetry.get("pkts_in", 0))
        pkts_out = int(raw_telemetry.get("pkts_out", 0))
        total_bytes = bytes_in + bytes_out
        total_pkts = pkts_in + pkts_out

        return {
            "flow_id": str(raw_telemetry.get("flow_id", "")),
            "src_ip": str(raw_telemetry.get("src_ip", "0.0.0.0")),
            "dst_ip": str(raw_telemetry.get("dst_ip", "0.0.0.0")),
            "src_port": int(raw_telemetry.get("src_port", 0)),
            "dst_port": int(raw_telemetry.get("dst_port", 0)),
            "protocol": str(raw_telemetry.get("protocol", "TCP")),
            "duration": round(duration, 4),
            "bytes_in": bytes_in,
            "bytes_out": bytes_out,
            "pkts_in": pkts_in,
            "pkts_out": pkts_out,
            "tcp_flags": str(raw_telemetry.get("tcp_flags", "SYN-ACK")),
            "flow_rate_bps": round((total_bytes * 8.0) / max(0.0001, duration), 2),
            "packet_rate_pps": round(total_pkts / max(0.0001, duration), 2),
            "entropy": float(raw_telemetry.get("entropy", 0.0)),
            "ja3_hash": raw_telemetry.get("ja3_hash", None),
            "is_attack": bool(raw_telemetry.get("is_attack", False)),
            "attack_type": str(raw_telemetry.get("attack_type", "BENIGN")),
            "timestamp": str(raw_telemetry.get("timestamp", "")),
            "metadata": raw_telemetry.get("metadata", {})
        }
