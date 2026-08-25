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
