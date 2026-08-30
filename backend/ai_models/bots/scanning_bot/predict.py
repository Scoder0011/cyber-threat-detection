"""
bots/scanning_bot/predict.py

Inference entrypoint for the scanning specialist bot. Loads
saved_models/scanning_bot.pkl (run train.py first) and exposes
predict(session: dict) -> dict.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ai_models.bots.scanning_bot.model import ScanningBot, ScanningFeatureExtractor

MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "saved_models", "scanning_bot.pkl"
))

_bot = None


def _get_bot() -> ScanningBot:
    global _bot
    if _bot is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. Run train.py first."
            )
        _bot = ScanningBot.load(MODEL_PATH, feature_extractor=ScanningFeatureExtractor())
    return _bot


def predict(session: dict = None) -> dict:
    """session: dict with unique_dst_ips, unique_dst_ports, syn_count,
    synack_count, total_packets, duration -- per-source aggregate."""
    if session is None:
        session = {}
    return _get_bot().predict(session).to_dict()


if __name__ == "__main__":
    port_scan_sample = {
        "unique_dst_ips": 1, "unique_dst_ports": 40000,
        "syn_count": 40000, "synack_count": 300,
        "total_packets": 40300, "duration": 8,
    }
    normal_sample = {
        "unique_dst_ips": 2, "unique_dst_ports": 3,
        "syn_count": 3, "synack_count": 3,
        "total_packets": 40, "duration": 15,
    }
    print("Port scan sample ->", predict(port_scan_sample))
    print("Normal sample    ->", predict(normal_sample))
