"""
AI-Powered Cyber Threat Detection System - Feature Extractor Base
==================================================================
Abstract base class declaring standard interfaces for all specialized
feature extraction pipelines (Flow, DNS, TLS, Packet).
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Union

class BaseFeatureExtractor(ABC):
    """Abstract Base Class for network feature extractors."""

    def __init__(self, name: str = "base_extractor"):
        self.name = name

    @abstractmethod
    def extract(self, raw_data: Union[Dict[str, Any], bytes]) -> Dict[str, Any]:
        """
        Extract numerical and categorical features from raw telemetry.

        Args:
            raw_data: Dictionary representing a network flow record, or raw frame bytes.

        Returns:
            Dictionary containing extracted feature keys and scalar values.
        """
        pass

    def get_feature_names(self) -> List[str]:
        """Returns the list of feature column names produced by this extractor."""
        if hasattr(self, "FEATURE_NAMES"):
            return list(self.FEATURE_NAMES)
        return []

    def to_vector(self, raw_data: Union[Dict[str, Any], bytes]) -> List[float]:
        """Converts raw input dictionary or bytes to an ordered numerical feature vector."""
        feats = self.extract(raw_data)
        names = self.get_feature_names()
        return [float(feats.get(n, 0.0)) for n in names]
