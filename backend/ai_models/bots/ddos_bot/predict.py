"""
bots/ddos_bot/predict.py

Inference entrypoint for the DDoS specialist bot. Loads the trained
model from saved_models/ddos_bot.pkl (run train.py first) and
exposes predict(flow: dict) -> dict for the backend controller
(controller/main_controller.py) to call during score fusion.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ai_models.bots.ddos_bot.model import DDoSBot, DDoSFeatureExtractor

MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "saved_models", "ddos_bot.pkl"
))

_bot = None


def _get_bot() -> DDoSBot:
    global _bot
    if _bot is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. Run train.py first."
            )
        _bot = DDoSBot.load(MODEL_PATH, feature_extractor=DDoSFeatureExtractor())
    return _bot


def predict(flow: dict) -> dict:
    """flow: dict with duration, total_packets, total_bytes,
    syn_count, ack_count, fin_count, rst_count, unique_src_ports."""
    return _get_bot().predict(flow).to_dict()


if __name__ == "__main__":
    sample_attack = {
        "duration": 3, "total_packets": 80000, "total_bytes": 80000 * 60,
        "syn_count": 76000, "ack_count": 200, "fin_count": 0, "rst_count": 500,
        "unique_src_ports": 40000,
    }
    sample_benign = {
        "duration": 20, "total_packets": 120, "total_bytes": 120 * 700,
        "syn_count": 4, "ack_count": 4, "fin_count": 1, "rst_count": 0,
        "unique_src_ports": 2,
    }
    print("Attack sample ->", predict(sample_attack))
    print("Benign sample ->", predict(sample_benign))
