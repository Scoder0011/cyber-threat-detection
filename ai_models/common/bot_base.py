"""
common/bot_base.py

SpecialistBot: the shared training / inference / persistence contract
used by every bot in ai_models/bots/. Each bot subclasses this with a
bot_name, threat_category, and a BaseFeatureExtractor implementation.

Design goals:
- train.py and predict.py both go through the same featurize() path,
  so there is no train/serve skew.
- predict() returns a standardized BotResult, matching what the
  backend's schemas/bot_result.py expects to fuse across bots.
- save()/load() persist the fitted sklearn model + feature contract
  together, so a saved_models/*.pkl is never loaded against a
  mismatched feature pipeline.
"""
import os
import time
from abc import ABC
from dataclasses import dataclass, field, asdict
from typing import Dict, Optional

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

from ai_models.common.feature_base import BaseFeatureExtractor


def _severity_from_confidence(confidence: float, malicious: bool) -> str:
    if not malicious:
        return "none"
    if confidence >= 0.95:
        return "critical"
    if confidence >= 0.85:
        return "high"
    if confidence >= 0.70:
        return "medium"
    return "low"


@dataclass
class BotResult:
    """Standardized prediction output, ready to be serialized and
    handed to the backend's score-fusion controller."""

    bot_name: str
    category: str
    malicious: bool
    label: str
    confidence: float
    severity: str
    features: Dict[str, float]
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> dict:
        return asdict(self)


class SpecialistBot(ABC):
    bot_name: str = "base_bot"
    threat_category: str = "unknown"

    def __init__(
        self,
        feature_extractor: BaseFeatureExtractor,
        model: Optional[RandomForestClassifier] = None,
        decision_threshold: float = 0.5,
    ):
        self.feature_extractor = feature_extractor
        self.model = model or RandomForestClassifier(
            n_estimators=300,
            max_depth=14,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )
        self.decision_threshold = decision_threshold
        self._is_fitted = model is not None

    @property
    def feature_names(self):
        return self.feature_extractor.FEATURE_NAMES

    # ---- training -------------------------------------------------
    def fit(self, X_raw, y):
        X = np.array([self.feature_extractor.to_vector(r) for r in X_raw])
        y = np.array(y)
        self.model.fit(X, y)
        self._is_fitted = True
        return self

    def evaluate(self, X_raw, y_true, verbose: bool = True) -> dict:
        X = np.array([self.feature_extractor.to_vector(r) for r in X_raw])
        y_true = np.array(y_true)
        y_prob = self.model.predict_proba(X)[:, 1]
        y_pred = (y_prob >= self.decision_threshold).astype(int)

        report = classification_report(
            y_true, y_pred, target_names=["benign", "malicious"],
            output_dict=True, zero_division=0,
        )
        cm = confusion_matrix(y_true, y_pred).tolist()
        try:
            auc = roc_auc_score(y_true, y_prob)
        except ValueError:
            auc = float("nan")

        metrics = {"report": report, "confusion_matrix": cm, "roc_auc": auc}
        if verbose:
            print(f"\n== {self.bot_name} evaluation (held-out test split) ==")
            print(classification_report(
                y_true, y_pred, target_names=["benign", "malicious"], zero_division=0,
            ))
            print("Confusion matrix [[TN FP] [FN TP]]:", cm)
            print(f"ROC-AUC: {auc:.4f}")
        return metrics

    # ---- inference --------------------------------------------------
    def predict(self, raw_input: dict) -> BotResult:
        if not self._is_fitted:
            raise RuntimeError(
                f"{self.bot_name} model is not fitted/loaded yet. Run train.py first."
            )
        feats = self.feature_extractor.extract(raw_input)
        vector = np.array([[feats.get(n, 0.0) for n in self.feature_names]])
        prob_malicious = float(self.model.predict_proba(vector)[0, 1])
        malicious = prob_malicious >= self.decision_threshold
        confidence = prob_malicious if malicious else 1 - prob_malicious
        return BotResult(
            bot_name=self.bot_name,
            category=self.threat_category,
            malicious=bool(malicious),
            label="malicious" if malicious else "benign",
            confidence=round(confidence, 4),
            severity=_severity_from_confidence(confidence, malicious),
            features={k: round(float(v), 4) for k, v in feats.items()},
        )

    # ---- persistence ------------------------------------------------
    def save(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(
            {
                "model": self.model,
                "feature_names": self.feature_names,
                "decision_threshold": self.decision_threshold,
                "bot_name": self.bot_name,
            },
            path,
        )

    @classmethod
    def load(cls, path: str, feature_extractor: BaseFeatureExtractor):
        bundle = joblib.load(path)
        if list(bundle["feature_names"]) != list(feature_extractor.FEATURE_NAMES):
            raise ValueError(
                f"Saved model at {path} was trained with a different feature "
                f"contract than the current {feature_extractor.__class__.__name__}."
            )
        instance = cls(
            feature_extractor=feature_extractor,
            model=bundle["model"],
            decision_threshold=bundle.get("decision_threshold", 0.5),
        )
        instance._is_fitted = True
        return instance
