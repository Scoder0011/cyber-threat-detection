"""
bots/dga_dns_bot/train.py

Generates synthetic benign domains (syllable-composed, word-like)
and malicious DGA-style domains (uniformly random alphanumeric
strings, mirroring real DGA families like Conficker/Kraken), trains
the classifier, evaluates it, and saves it to
ai_models/saved_models/dga_dns_bot.pkl.

Run directly:
    python ai_models/bots/dga_dns_bot/train.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

import numpy as np
from sklearn.model_selection import train_test_split

from ai_models.bots.dga_dns_bot.model import DGADNSBot, DGADNSFeatureExtractor

RNG = np.random.default_rng(42)

_SYLLABLES = [
    "ta", "ba", "ka", "na", "la", "ra", "mo", "ni", "ko", "fa", "re", "lo",
    "mi", "sa", "to", "de", "go", "ha", "zu", "ve",
]
# Real compound-word / brand-style vocabulary. Mixing whole words
# (which contain real consonant clusters like "chbl" in "techblog")
# is what teaches the model that a cluster alone isn't suspicious --
# only a cluster combined with low n-gram/English-likeness is.
_WORDS = [
    "my", "get", "the", "best", "top", "pro", "real", "easy", "quick",
    "tech", "blog", "shop", "cloud", "media", "home", "care", "web",
    "info", "app", "games", "news", "daily", "smart", "bright", "green",
    "market", "store", "group", "team", "studio", "works", "labs", "hub",
    "zone", "point", "link", "world", "global", "local", "city", "house",
    "garden", "kitchen", "fitness", "health", "travel", "music", "sports",
    "finance", "bank", "credit", "legal", "medical", "school", "academy",
    "hotel", "cafe", "bakery", "design", "photo", "video", "film", "book",
    "read", "write", "code", "dev", "soft", "data", "secure", "safe",
    "trust", "first", "prime", "elite", "gold", "royal", "super", "mega",
    "ultra", "max", "plus", "dropbox", "github", "amazon",
]
_BENIGN_TLDS = ["com", "net", "org", "io", "co", "app"]
_DGA_TLDS = ["com", "net", "info", "biz", "xyz", "top", "online"]
_CHARSET = list("abcdefghijklmnopqrstuvwxyz0123456789")


def _benign_domain() -> dict:
    if RNG.random() < 0.7:
        n_words = int(RNG.integers(1, 3))
        word = "".join(str(RNG.choice(_WORDS)) for _ in range(n_words))
    else:
        n_syll = int(RNG.integers(2, 5))
        word = "".join(RNG.choice(_SYLLABLES) for _ in range(n_syll))
    if RNG.random() < 0.15:
        word += str(int(RNG.integers(1, 999)))
    tld = RNG.choice(_BENIGN_TLDS)
    return {"domain": f"{word}.{tld}"}


def _malicious_domain() -> dict:
    length = int(RNG.integers(10, 24))
    word = "".join(RNG.choice(_CHARSET) for _ in range(length))
    tld = RNG.choice(_DGA_TLDS)
    return {"domain": f"{word}.{tld}"}


def generate_dataset(n_per_class: int = 4000):
    X = [_benign_domain() for _ in range(n_per_class)] + [_malicious_domain() for _ in range(n_per_class)]
    y = [0] * n_per_class + [1] * n_per_class

    # Incorporate authentic threat intel / flows if present
    flows_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "flows", "dga_domains.csv"))
    if os.path.exists(flows_file):
        import csv
        with open(flows_file, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                is_dga = str(r.get("is_dga", "")).lower() in ["true", "1", "t"]
                X.append({"domain": r.get("domain", "")})
                y.append(1 if is_dga else 0)

    return X, y


def main():
    X, y = generate_dataset(4000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    bot = DGADNSBot(feature_extractor=DGADNSFeatureExtractor())
    bot.fit(X_train, y_train)
    bot.evaluate(X_test, y_test)

    save_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "saved_models", "dga_dns_bot.pkl"
    ))
    bot.save(save_path)
    print(f"Saved model to {save_path}")


if __name__ == "__main__":
    main()
