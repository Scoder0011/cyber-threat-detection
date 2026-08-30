"""
bots/beaconing_bot/train.py

Generates synthetic benign (irregular, human-driven) sessions and
malicious (fixed-period, low-jitter C2 beacon) sessions, trains the
classifier, evaluates it, and saves it to
ai_models/saved_models/beaconing_bot.pkl.

Run directly:
    python ai_models/bots/beaconing_bot/train.py
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

import numpy as np
from sklearn.model_selection import train_test_split

from ai_models.bots.beaconing_bot.model import BeaconingBot, BeaconingFeatureExtractor

RNG = np.random.default_rng(42)


def _benign_session() -> dict:
    """Irregular human/app traffic: exponential inter-arrival times
    (a Poisson-ish process), occasionally with a short burst."""
    n = int(RNG.integers(10, 60))
    scale = RNG.uniform(5, 120)
    intervals = RNG.exponential(scale=scale, size=n)
    ts = np.cumsum(intervals)
    return {"timestamps": ts.tolist()}


def _malicious_session() -> dict:
    """C2 beacon: fixed sleep period +/- small jitter, the classic
    'call home every N seconds' pattern."""
    n = int(RNG.integers(20, 100))
    period = RNG.uniform(10, 300)
    jitter = period * RNG.uniform(0.01, 0.12)
    intervals = RNG.normal(loc=period, scale=max(jitter, 1e-3), size=n)
    intervals = np.clip(intervals, period * 0.5, period * 1.5)
    ts = np.cumsum(intervals)
    return {"timestamps": ts.tolist()}


def generate_dataset(n_per_class: int = 2000):
    X = [_benign_session() for _ in range(n_per_class)] + [_malicious_session() for _ in range(n_per_class)]
    y = [0] * n_per_class + [1] * n_per_class

    flows_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "flows", "beacon_sessions.csv"))
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

    bot = BeaconingBot(feature_extractor=BeaconingFeatureExtractor())
    bot.fit(X_train, y_train)
    bot.evaluate(X_test, y_test)

    save_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), "..", "..", "saved_models", "beaconing_bot.pkl"
    ))
    bot.save(save_path)
    print(f"Saved model to {save_path}")


if __name__ == "__main__":
    main()
