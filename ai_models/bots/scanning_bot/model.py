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
from ai_models.features.flow_features import extract_scan_features

FEATURE_NAMES = [
    "unique_dst_ips",
    "unique_dst_ports",
    "targets_per_second",
    "half_open_ratio",
    "packets_per_target",
    "duration",
]


class ScanningFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def extract(self, raw_input: dict) -> dict:
        return extract_scan_features(raw_input)


class ScanningBot(SpecialistBot):
    bot_name = "scanning_bot"
    threat_category = "Scanning / Reconnaissance"
