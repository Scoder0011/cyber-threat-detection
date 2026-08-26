"""
bots/exfiltration_bot/model.py

Detects data exfiltration: sessions where outbound byte volume
dwarfs inbound (the opposite of normal browsing/download-heavy
traffic), often combined with DNS-tunneling tells -- abnormally
large TXT record payloads and high-entropy encoded data stuffed into
DNS queries to sneak data out through a channel that's rarely
inspected or blocked.
"""
from ai_models.common.bot_base import SpecialistBot
from ai_models.common.feature_base import BaseFeatureExtractor
from ai_models.features.flow_features import extract_volume_features

FEATURE_NAMES = [
    "outbound_bytes",
    "inbound_bytes",
    "out_in_ratio",
    "bytes_per_request",
    "outbound_rate",
    "dns_txt_avg_size",
    "payload_entropy",
]


class ExfiltrationFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def extract(self, raw_input: dict) -> dict:
        feats = extract_volume_features(raw_input)
        feats["dns_txt_avg_size"] = float(raw_input.get("dns_txt_avg_size", 0.0))
        feats["payload_entropy"] = float(raw_input.get("payload_entropy", 0.0))
        return feats


class ExfiltrationBot(SpecialistBot):
    bot_name = "exfiltration_bot"
    threat_category = "Data Exfiltration"
