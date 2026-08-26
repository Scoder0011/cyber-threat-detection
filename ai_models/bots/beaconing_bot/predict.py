"""
bots/beaconing_bot/predict.py

Inference entrypoint for the beaconing specialist bot. Loads
saved_models/beaconing_bot.pkl (run train.py first) and exposes
predict(session: dict) -> dict.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from ai_models.bots.beaconing_bot.model import BeaconingBot, BeaconingFeatureExtractor

MODEL_PATH = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "saved_models", "beaconing_bot.pkl"
))

_bot = None


def _get_bot() -> BeaconingBot:
    global _bot
    if _bot is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH}. Run train.py first."
            )
        _bot = BeaconingBot.load(MODEL_PATH, feature_extractor=BeaconingFeatureExtractor())
    return _bot


def predict(session: dict) -> dict:
    """session: dict with 'timestamps' -- a list of packet arrival
    times (seconds) for one src/dst pair over the observation window."""
    return _get_bot().predict(session).to_dict()


if __name__ == "__main__":
    import numpy as np

    # Regular 60s beacon with light jitter
    beacon_ts = np.cumsum(np.random.normal(60, 2, size=40)).tolist()
    # Irregular human browsing session
    human_ts = np.cumsum(np.random.exponential(20, size=40)).tolist()

    print("Beacon sample ->", predict({"timestamps": beacon_ts}))
    print("Human sample ->", predict({"timestamps": human_ts}))
