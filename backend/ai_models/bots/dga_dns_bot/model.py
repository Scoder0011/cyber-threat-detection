"""
bots/dga_dns_bot/model.py

Detects Domain Generation Algorithm (DGA) hostnames -- the
pseudo-random domains malware families generate on the fly to find
their C2 server without hardcoding it (making takedown harder).
Classified purely from the queried hostname string: length,
character entropy, digit/vowel ratios, and consonant-run length
separate machine-generated strings from human-registered words.
"""
from ai_models.common.bot_base import SpecialistBot
from ai_models.common.feature_base import BaseFeatureExtractor
from ai_models.features.dns_features import extract_dns_features

FEATURE_NAMES = [
    "length",
    "entropy",
    "digit_ratio",
    "vowel_ratio",
    "unique_char_ratio",
    "max_consonant_run",
    "subdomain_count",
    "ngram_hit_ratio",
]


class DGADNSFeatureExtractor(BaseFeatureExtractor):
    FEATURE_NAMES = FEATURE_NAMES

    def extract(self, raw_input: dict) -> dict:
        return extract_dns_features(raw_input)


class DGADNSBot(SpecialistBot):
    bot_name = "dga_dns_bot"
    threat_category = "DGA DNS"
