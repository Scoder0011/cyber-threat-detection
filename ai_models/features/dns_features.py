"""
DNS Feature Extraction Pipeline
===============================
Extracts linguistic, entropy, and statistical metrics from DNS query hostnames
for DGA detection, DNS tunneling, and covert C2 channel discovery.
"""

import math
from typing import Dict, Any, List
from ai_models.common.feature_base import BaseFeatureExtractor

class DNSFeatureExtractor(BaseFeatureExtractor):
    """Extracts lexical, structural, and information-theoretic DNS features."""

    def __init__(self):
        super().__init__(name="dns_features")

    def get_feature_names(self) -> List[str]:
        return [
            "domain_length",
            "shannon_entropy",
            "vowel_ratio",
            "consonant_ratio",
            "digit_ratio",
            "special_char_ratio",
            "subdomain_count",
            "has_consecutive_consonants",
            "bigram_avg_frequency",
            "payload_size_bytes",
            "is_txt_query"
        ]

    def _calc_entropy(self, s: str) -> float:
        if not s:
            return 0.0
        freq = {}
        for c in s:
            freq[c] = freq.get(c, 0) + 1
        length = len(s)
        return -sum((cnt / length) * math.log2(cnt / length) for cnt in freq.values())

    def extract(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts numerical features from a DNS query record or domain name."""
        query_name = query.get("query_name", query.get("domain", ""))
        payload_size = int(query.get("payload_size_bytes", query.get("bytes_out", 50)))
        qtype = str(query.get("query_type", "A")).upper()

        # Remove trailing dot and TLD for sub-analysis if present
        parts = query_name.strip(".").split(".")
        main_part = parts[0] if parts else query_name
        total_len = len(query_name)

        if total_len == 0:
            return {name: 0.0 for name in self.get_feature_names()}

        # Character ratios
        letters = [c.lower() for c in query_name if c.isalpha()]
        digits = [c for c in query_name if c.isdigit()]
        specials = [c for c in query_name if not c.isalnum() and c != '.']

        vowels = sum(1 for c in letters if c in 'aeiou')
        consonants = len(letters) - vowels

        vowel_ratio = round(vowels / max(1, len(letters)), 4)
        consonant_ratio = round(consonants / max(1, len(letters)), 4)
        digit_ratio = round(len(digits) / total_len, 4)
        special_char_ratio = round(len(specials) / total_len, 4)
        entropy = round(self._calc_entropy(query_name), 4)

        # Check consecutive consonants (e.g. 4+ in a row indicates DGA/entropy)
        max_cons = 0
        cur_cons = 0
        for c in query_name.lower():
            if c.isalpha() and c not in 'aeiou':
                cur_cons += 1
                max_cons = max(max_cons, cur_cons)
            else:
                cur_cons = 0

        return {
            "domain_length": total_len,
            "shannon_entropy": entropy,
            "vowel_ratio": vowel_ratio,
            "consonant_ratio": consonant_ratio,
            "digit_ratio": digit_ratio,
            "special_char_ratio": special_char_ratio,
            "subdomain_count": len(parts),
            "has_consecutive_consonants": 1 if max_cons >= 4 else 0,
            "bigram_avg_frequency": round(1.0 / (entropy + 0.1), 4),
            "payload_size_bytes": payload_size,
            "is_txt_query": 1 if "TXT" in qtype or "NULL" in qtype else 0
        }


def extract_dns_features(raw_input: dict) -> dict:
    """Extract DGA DNS features expected by dga_dns_bot."""
    if not isinstance(raw_input, dict):
        raw_input = {}

    domain = str(raw_input.get("domain", raw_input.get("query_name", ""))).lower().strip()
    if "://" in domain:
        domain = domain.split("://")[-1]
    domain = domain.strip(".")

    parts = domain.split(".")
    main_part = parts[0] if parts else domain
    length = float(len(main_part)) if main_part else 1.0

    if main_part:
        freq = {}
        for c in main_part:
            freq[c] = freq.get(c, 0) + 1
        entropy = -sum((cnt / len(main_part)) * math.log2(cnt / len(main_part)) for cnt in freq.values())
    else:
        entropy = 0.0

    letters = [c for c in main_part if c.isalpha()]
    digits = [c for c in main_part if c.isdigit()]
    vowels = [c for c in letters if c in "aeiou"]

    digit_ratio = len(digits) / max(1.0, length)
    vowel_ratio = len(vowels) / max(1.0, float(len(letters))) if letters else 0.0
    unique_char_ratio = len(set(main_part)) / max(1.0, length)

    max_cons = 0
    cur_cons = 0
    for c in main_part:
        if c.isalpha() and c not in "aeiou":
            cur_cons += 1
            max_cons = max(max_cons, cur_cons)
        else:
            cur_cons = 0

    subdomain_count = float(len(parts))

    common_ngrams = {
        "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd", "ti", "es", "or",
        "te", "of", "ed", "is", "it", "al", "ar", "st", "to", "nt", "ng", "se", "ha",
        "as", "ou", "io", "le", "ve", "co", "me", "de", "hi", "ri", "ro", "ic", "ne",
        "ea", "ra", "ce", "li", "ch", "ll", "be", "ma", "si", "om", "ur"
    }
    if len(main_part) >= 2:
        bigrams = [main_part[i:i+2] for i in range(len(main_part)-1)]
        hits = sum(1 for bg in bigrams if bg in common_ngrams)
        ngram_hit_ratio = hits / len(bigrams)
    else:
        ngram_hit_ratio = 0.5

    if "entropy" in raw_input and isinstance(raw_input["entropy"], (int, float)):
        entropy = float(raw_input["entropy"])
    if "vowel_ratio" in raw_input and isinstance(raw_input["vowel_ratio"], (int, float)):
        vowel_ratio = float(raw_input["vowel_ratio"])
    if "length" in raw_input and isinstance(raw_input["length"], (int, float)):
        length = float(raw_input["length"])

    return {
        "length": round(length, 4),
        "entropy": round(entropy, 4),
        "digit_ratio": round(digit_ratio, 4),
        "vowel_ratio": round(vowel_ratio, 4),
        "unique_char_ratio": round(unique_char_ratio, 4),
        "max_consonant_run": float(max_cons),
        "subdomain_count": round(subdomain_count, 4),
        "ngram_hit_ratio": round(ngram_hit_ratio, 4),
    }
