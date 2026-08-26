"""
bots/exfiltration_bot/predict.py

Inference entrypoint for the exfiltration specialist bot. Loads
saved_models/exfiltration_bot.pkl (run train.py first) and exposes
predict(session: dict) -> dict.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ai_models.bots.exfiltration_bot.model import ExfiltrationBot, ExfiltrationFeatureExtractor

MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "saved_models", "exfiltration_bot.pkl"
))

_bot = None


def _get_bot() -> ExfiltrationBot:
    global _bot
    if _bot is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. Run train.py first."
            )
        _bot = ExfiltrationBot.load(MODEL_PATH, feature_extractor=ExfiltrationFeatureExtractor())
    return _bot


def predict(session: dict) -> dict:
    """session: dict with outbound_bytes, inbound_bytes, duration,
    request_count, dns_txt_avg_size, payload_entropy."""
    return _get_bot().predict(session).to_dict()


if __name__ == "__main__":
    exfil_sample = {
        "outbound_bytes": 12_000_000, "inbound_bytes": 4_000, "duration": 300,
        "request_count": 2000, "dns_txt_avg_size": 220, "payload_entropy": 7.6,
    }
    normal_sample = {
        "outbound_bytes": 15_000, "inbound_bytes": 900_000, "duration": 60,
        "request_count": 40, "dns_txt_avg_size": 20, "payload_entropy": 3.1,
    }
    print("Exfil sample  ->", predict(exfil_sample))
    print("Normal sample ->", predict(normal_sample))
