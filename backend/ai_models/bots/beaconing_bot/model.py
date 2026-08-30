"""
bots/beaconing_bot/model.py

Detects C2 beaconing: periodic, low-jitter callback traffic that
malware implants use to check in with a command-and-control server.
Human/application traffic is bursty and irregular (high coefficient
of variation between packet arrivals); a scheduled beacon is
strikingly regular (low CV), which is the core signal here.
"""
from ai_models.common.bot_base import SpecialistBot
from ai_models.common.feature_base import BaseFeatureExtractor
from ai_models.features.flow_features import extract_timing_features

FEATURE_NAMES = [
    "mean_interval",
    "std_interval",
    "cv_interval",
    "jitter_ratio",
    "packet_count",
    "session_span",
]


class BeaconingFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def extract(self, raw_input: dict) -> dict:
        return extract_timing_features(raw_input)


class BeaconingBot(SpecialistBot):
    bot_name = "beaconing_bot"
    threat_category = "Beaconing / C2"
