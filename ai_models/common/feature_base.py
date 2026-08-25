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

    @abstractmethod
    def get_feature_names(self) -> List[str]:
        """Returns the list of feature column names produced by this extractor."""
        pass
