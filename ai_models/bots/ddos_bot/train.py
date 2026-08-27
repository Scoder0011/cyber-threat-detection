"""
bots/ddos_bot/train.py

Generates realistic synthetic benign vs. DDoS/DoS flow data (SYN
flood, UDP amplification, slowloris profiles), trains the
RandomForestClassifier, evaluates it on a held-out split, and saves
the model to ai_models/saved_models/ddos_bot.pkl.

Run directly:
    python ai_models/bots/ddos_bot/train.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

import numpy as np
from sklearn.model_selection import train_test_split

from ai_models.bots.ddos_bot.model import DDoSBot, DDoSFeatureExtractor

RNG = np.random.default_rng(42)


def _benign_flow() -> dict:
    duration = RNG.uniform(2, 60)
    total_packets = int(RNG.integers(10, 500))
    total_bytes = total_packets * RNG.uniform(300, 1200)
    syn = int(RNG.integers(1, max(2, total_packets // 20)))
    ack = syn + int(RNG.integers(0, 3))
    fin = int(RNG.integers(0, 2))
    rst = int(RNG.integers(0, 1))
    unique_src_ports = int(RNG.integers(1, 5))
    return dict(duration=duration, total_packets=total_packets, total_bytes=total_bytes,
                syn_count=syn, ack_count=ack, fin_count=fin, rst_count=rst,
                unique_src_ports=unique_src_ports)


def _attack_flow() -> dict:
    attack_type = RNG.choice(["syn_flood", "udp_amp", "slowloris"])
    if attack_type == "syn_flood":
        duration = RNG.uniform(1, 10)
        total_packets = int(RNG.integers(5000, 200000))
        syn = int(total_packets * RNG.uniform(0.85, 0.99))
        ack = int(RNG.integers(0, max(1, syn // 50)))
        total_bytes = total_packets * RNG.uniform(40, 80)
        unique_src_ports = int(RNG.integers(1000, 60000))
    elif attack_type == "udp_amp":
        duration = RNG.uniform(1, 15)
        total_packets = int(RNG.integers(2000, 100000))
        syn = 0
        ack = 0
        total_bytes = total_packets * RNG.uniform(400, 4000)
        unique_src_ports = int(RNG.integers(1, 10))
    else:  # slowloris: many slow half-open connections
        duration = RNG.uniform(60, 600)
        total_packets = int(RNG.integers(500, 5000))
        syn = int(RNG.integers(200, 2000))
        ack = int(RNG.integers(0, syn // 10 + 1))
        total_bytes = total_packets * RNG.uniform(50, 150)
        unique_src_ports = int(RNG.integers(100, 5000))

    fin = int(RNG.integers(0, 2))
    rst = int(RNG.integers(0, max(1, total_packets // 100)))
    return dict(duration=duration, total_packets=total_packets, total_bytes=total_bytes,
                syn_count=syn, ack_count=ack, fin_count=fin, rst_count=rst,
                unique_src_ports=unique_src_ports)


def generate_dataset(n_per_class: int = 2000):
    X = [_benign_flow() for _ in range(n_per_class)] + [_attack_flow() for _ in range(n_per_class)]
    y = [0] * n_per_class + [1] * n_per_class

    flows_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "flows", "ddos_flows.csv"))
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

    bot = DDoSBot(feature_extractor=DDoSFeatureExtractor())
    bot.fit(X_train, y_train)
    bot.evaluate(X_test, y_test)

    save_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "saved_models", "ddos_bot.pkl"
    ))
    bot.save(save_path)
    print(f"Saved model to {save_path}")


if __name__ == "__main__":
    main()
