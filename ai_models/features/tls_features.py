"""
TLS & Encrypted Malware Feature Extraction Pipeline
===================================================
Extracts JA3/JA4 cryptographic fingerprints, handshake metadata,
and payload sequence characteristics from encrypted TLS sessions.
"""

import hashlib
from typing import Dict, Any, List
from ai_models.common.feature_base import BaseFeatureExtractor

# Known threat JA3 database
MALICIOUS_JA3_SET = {
    "a0e9f5d64349fb13191bc781f81f42e1": "Cobalt Strike Beacon",
    "7271429d862a61cbeeb7f0e6158c183a": "TrickBot Banking Trojan",
    "4d7a28d6f22da2d92300e40f1e91a1d2": "Emotet C2 Loader",
    "51c64c77e60f39ac3e1792836811005f": "AsyncRAT Remote Access",
    "b386946a5a44d1ddcc843bc75336df1a": "Qakbot C2 Channel",
    "6734f37431670b3ab4292b8f60f29c51": "Metasploit Meterpreter",
}

class TLSFeatureExtractor(BaseFeatureExtractor):
    """Extracts TLS handshake metadata and JA3/JA4 cryptographic signatures."""

    def __init__(self):
        super().__init__(name="tls_features")

    def get_feature_names(self) -> List[str]:
        return [
            "has_ja3",
            "is_known_malicious_ja3",
            "ja3_threat_confidence",
            "sni_length",
            "cipher_suite_count",
            "is_tls_protocol",
            "encrypted_entropy"
        ]

    def extract(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts cryptographic TLS features."""
        ja3 = str(flow.get("ja3_hash", "") or "").lower().strip()
        proto = str(flow.get("protocol", "")).upper()
        entropy = float(flow.get("entropy", 0.0))
        metadata = flow.get("metadata", {}) or {}

        is_mal = 1 if ja3 in MALICIOUS_JA3_SET else 0
        threat_conf = 0.95 if is_mal else 0.0

        sni = metadata.get("sni", "")
        cipher_count = int(metadata.get("cipher_suite_count", 15))

        return {
            "has_ja3": 1 if ja3 and len(ja3) == 32 else 0,
            "is_known_malicious_ja3": is_mal,
            "ja3_threat_confidence": threat_conf,
            "sni_length": len(sni),
            "cipher_suite_count": cipher_count,
            "is_tls_protocol": 1 if "TLS" in proto or "443" in str(flow.get("dst_port", "")) else 0,
            "encrypted_entropy": entropy
        }
