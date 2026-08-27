"""
bots/exfiltration_bot/train.py

Generates synthetic benign (inbound-heavy browsing, small DNS
records) and malicious (outbound-heavy, large/high-entropy DNS TXT
payloads consistent with tunneling) sessions, trains the classifier,
evaluates it, and saves it to
ai_models/saved_models/exfiltration_bot.pkl.

Run directly:
    python ai_models/bots/exfiltration_bot/train.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

import numpy as np
from sklearn.model_selection import train_test_split

from ai_models.bots.exfiltration_bot.model import ExfiltrationBot, ExfiltrationFeatureExtractor

RNG = np.random.default_rng(42)


def _benign_session() -> dict:
    inbound = RNG.uniform(50_000, 5_000_000)
    outbound = RNG.uniform(2_000, 50_000)
    return {
        "outbound_bytes": outbound,
        "inbound_bytes": inbound,
        "duration": float(RNG.uniform(5, 300)),
        "request_count": int(RNG.integers(5, 200)),
        "dns_txt_avg_size": float(RNG.uniform(10, 50)),
        "payload_entropy": float(RNG.uniform(2, 5)),
    }


def _malicious_session() -> dict:
    outbound = RNG.uniform(500_000, 50_000_000)
    inbound = RNG.uniform(1_000, 20_000)
    return {
        "outbound_bytes": outbound,
        "inbound_bytes": inbound,
        "duration": float(RNG.uniform(10, 600)),
        "request_count": int(RNG.integers(50, 5000)),
        "dns_txt_avg_size": float(RNG.uniform(150, 255)),
        "payload_entropy": float(RNG.uniform(6.5, 8.0)),
    }


def generate_dataset(n_per_class: int = 2000):
    X = [_benign_session() for _ in range(n_per_class)] + [_malicious_session() for _ in range(n_per_class)]
    y = [0] * n_per_class + [1] * n_per_class

    flows_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "flows", "exfiltration_ratios.csv"))
    if os.path.exists(flows_file):
        import csv
        with open(flows_file, "r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                is_att = str(r.get("is_attack", "")).lower() in ["true", "1", "t"]
                X.append(r)
                y.append(1 if is_att else 0)

    return X, y


def main():
    X, y = generate_dataset(2000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    bot = ExfiltrationBot(feature_extractor=ExfiltrationFeatureExtractor())
    bot.fit(X_train, y_train)
    bot.evaluate(X_test, y_test)

    save_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "saved_models", "exfiltration_bot.pkl"
    ))
    bot.save(save_path)
    print(f"Saved model to {save_path}")


if __name__ == "__main__":
    main()
