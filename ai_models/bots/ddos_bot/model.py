"""
bots/ddos_bot/model.py

Detects DDoS / DoS floods (SYN floods, UDP amplification, slowloris-
style connection exhaustion) from per-flow packet/byte/flag
statistics. A single flow is a source->destination aggregate over a
short window, produced upstream by streaming/window_manager.py.
"""
from ai_models.common.bot_base import SpecialistBot
from ai_models.common.feature_base import BaseFeatureExtractor
from ai_models.features.flow_features import extract_flow_features

FEATURE_NAMES = [
    "duration",
    "total_packets",
    "total_bytes",
    "packets_per_second",
    "bytes_per_second",
    "bytes_per_packet",
    "syn_ack_ratio",
    "rst_ratio",
    "unique_src_ports",
]


class DDoSFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def extract(self, raw_input: dict) -> dict:
        return extract_flow_features(raw_input)


class DDoSBot(SpecialistBot):
    bot_name = "ddos_bot"
    threat_category = "DDoS"
