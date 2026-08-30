"""
bots/dga_dns_bot/predict.py

Inference entrypoint for the DGA DNS specialist bot. Loads
saved_models/dga_dns_bot.pkl (run train.py first) and exposes
predict(query: dict) -> dict.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ai_models.bots.dga_dns_bot.model import DGADNSBot, DGADNSFeatureExtractor

MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "saved_models", "dga_dns_bot.pkl"
))

_bot = None


def _get_bot() -> DGADNSBot:
    global _bot
    if _bot is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. Run train.py first."
            )
        _bot = DGADNSBot.load(MODEL_PATH, feature_extractor=DGADNSFeatureExtractor())
    return _bot


def predict(query: dict) -> dict:
    """query: dict with 'domain', e.g. {'domain': 'xf9q2klzp.top'}."""
    return _get_bot().predict(query).to_dict()


if __name__ == "__main__":
    print("DGA-like sample ->", predict({"domain": "xf9q2klzpaqm.top"}))
    print("Legit sample    ->", predict({"domain": "mytechblog.com"}))
