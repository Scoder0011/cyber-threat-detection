"""
bots/scanning_bot/train.py

Generates synthetic benign (a handful of normal destinations,
established connections) and malicious (host sweep / port sweep,
mostly half-open connections) per-source sessions, trains the
classifier, evaluates it, and saves it to
ai_models/saved_models/scanning_bot.pkl.

Run directly:
    python ai_models/bots/scanning_bot/train.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

import numpy as np
from sklearn.model_selection import train_test_split

from ai_models.bots.scanning_bot.model import ScanningBot, ScanningFeatureExtractor

RNG = np.random.default_rng(42)


def _benign_session() -> dict:
    syn = int(RNG.integers(1, 6))
    synack = syn - int(RNG.integers(0, 1))
    return {
        "unique_dst_ips": int(RNG.integers(1, 3)),
        "unique_dst_ports": int(RNG.integers(1, 4)),
        "syn_count": syn,
        "synack_count": max(synack, 0),
        "total_packets": int(RNG.integers(5, 200)),
        "duration": float(RNG.uniform(2, 60)),
    }


def _malicious_session() -> dict:
    scan_type = RNG.choice(["host_sweep", "port_sweep"])
    if scan_type == "host_sweep":
        unique_ips = int(RNG.integers(100, 5000))
        unique_ports = int(RNG.integers(1, 3))
    else:
        unique_ips = int(RNG.integers(1, 3))
        unique_ports = int(RNG.integers(200, 65000))

    targets = unique_ips * unique_ports
    syn = min(targets, int(RNG.integers(5000, 200000)))
    synack = int(syn * RNG.uniform(0.0, 0.05))  # mostly half-open
    duration = float(RNG.uniform(1, 30))
    total_packets = syn + synack

    return {
        "unique_dst_ips": unique_ips,
        "unique_dst_ports": unique_ports,
        "syn_count": syn,
        "synack_count": synack,
        "total_packets": total_packets,
        "duration": duration,
    }


def generate_dataset(n_per_class: int = 2000):
    X = [_benign_session() for _ in range(n_per_class)] + [_malicious_session() for _ in range(n_per_class)]
    y = [0] * n_per_class + [1] * n_per_class
    return X, y


def main():
    X, y = generate_dataset(2000)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    bot = ScanningBot(feature_extractor=ScanningFeatureExtractor())
    bot.fit(X_train, y_train)
    bot.evaluate(X_test, y_test)

    save_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "saved_models", "scanning_bot.pkl"
    ))
    bot.save(save_path)
    print(f"Saved model to {save_path}")


if __name__ == "__main__":
    main()
