"""
bots/scanning_bot/model.py

Detects host discovery and port scanning: a single source touching
an unusually large number of distinct destination IPs/ports in a
short window, typically with a high ratio of half-open (SYN, no
SYN-ACK) connections -- the classic reconnaissance-before-attack
pattern (nmap sweeps, credential-stuffing scanners, worm propagation).
"""
from ai_models.common.bot_base import SpecialistBot
from ai_models.common.feature_base import BaseFeatureExtractor

FEATURE_NAMES = [
    "unique_dst_ips",
    "unique_dst_ports",
    "targets_per_second",
    "half_open_ratio",
    "packets_per_target",
    "duration",
]


def extract_scan_features(raw_input: dict) -> dict:
    """Extract scan features from raw telemetry/session dict gracefully defaulting missing fields to 0."""
    if not isinstance(raw_input, dict):
        raw_input = {}

    unique_dst_ips = float(raw_input.get("unique_dst_ips", raw_input.get("dst_ips", raw_input.get("unique_ips", 0.0))))
    unique_dst_ports = float(raw_input.get("unique_dst_ports", raw_input.get("dst_ports", raw_input.get("unique_ports", raw_input.get("ports_scanned", raw_input.get("port_count", 0.0))))))
    duration = float(raw_input.get("duration", raw_input.get("scan_duration", 0.0)))

    syn_count = float(raw_input.get("syn_count", raw_input.get("syn", 0.0)))
    synack_count = float(raw_input.get("synack_count", raw_input.get("syn_ack_count", raw_input.get("synack", 0.0))))
    total_packets = float(raw_input.get("total_packets", raw_input.get("pkts", raw_input.get("packets", syn_count + synack_count))))

    targets = unique_dst_ips * unique_dst_ports if (unique_dst_ips > 0 and unique_dst_ports > 0) else (unique_dst_ips + unique_dst_ports)

    if "targets_per_second" in raw_input:
        targets_per_second = float(raw_input.get("targets_per_second", 0.0))
    else:
        if duration > 0 and targets > 0:
            targets_per_second = targets / duration
        elif targets > 0:
            targets_per_second = float(targets)
        else:
            targets_per_second = 0.0

    if "half_open_ratio" in raw_input:
        half_open_ratio = float(raw_input.get("half_open_ratio", 0.0))
    else:
        if syn_count > 0:
            half_open_ratio = max(0.0, min(1.0, (syn_count - synack_count) / syn_count))
        else:
            half_open_ratio = 0.0

    if "packets_per_target" in raw_input:
        packets_per_target = float(raw_input.get("packets_per_target", 0.0))
    else:
        if targets > 0:
            packets_per_target = total_packets / targets
        else:
            packets_per_target = 0.0

    return {
        "unique_dst_ips": unique_dst_ips,
        "unique_dst_ports": unique_dst_ports,
        "targets_per_second": round(targets_per_second, 4),
        "half_open_ratio": round(half_open_ratio, 4),
        "packets_per_target": round(packets_per_target, 4),
        "duration": round(duration, 4),
    }


class ScanningFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def __init__(self):
        super().__init__(name="scanning_feature_extractor")

    def get_feature_names(self):
        return list(self.FEATURE_NAMES)

    def extract(self, raw_input: dict) -> dict:
        return extract_scan_features(raw_input)

    def to_vector(self, raw_input: dict) -> list:
        feats = self.extract(raw_input)
        return [feats.get(name, 0.0) for name in self.FEATURE_NAMES]


class ScanningBot(SpecialistBot):
    bot_name = "scanning_bot"
    threat_category = "Scanning / Reconnaissance"

