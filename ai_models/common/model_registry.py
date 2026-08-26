"""
common/model_registry.py

Dynamically instantiates the 6 specialist bots by name, so the
backend's controller/bot_registry.py can bring bots online without
hard-importing every module. Also usable directly for local testing.
"""
import importlib
import os
from typing import Dict, Optional

BOT_NAMES = [
    "ddos_bot",
    "beaconing_bot",
    "dga_dns_bot",
    "encrypted_malware_bot",
    "scanning_bot",
    "exfiltration_bot",
]

# name -> (module path, bot class name, feature extractor class name)
_REGISTRY = {
    "ddos_bot": ("ai_models.bots.ddos_bot.model", "DDoSBot", "DDoSFeatureExtractor"),
    "beaconing_bot": ("ai_models.bots.beaconing_bot.model", "BeaconingBot", "BeaconingFeatureExtractor"),
    "dga_dns_bot": ("ai_models.bots.dga_dns_bot.model", "DGADNSBot", "DGADNSFeatureExtractor"),
    "encrypted_malware_bot": ("ai_models.bots.encrypted_malware_bot.model", "EncryptedMalwareBot", "EncryptedMalwareFeatureExtractor"),
    "scanning_bot": ("ai_models.bots.scanning_bot.model", "ScanningBot", "ScanningFeatureExtractor"),
    "exfiltration_bot": ("ai_models.bots.exfiltration_bot.model", "ExfiltrationBot", "ExfiltrationFeatureExtractor"),
}


def load_bot(name: str, model_path: Optional[str] = None):
    """Instantiate one bot. If model_path points at a saved .pkl, the
    trained model is loaded; otherwise an untrained bot (ready for
    train.py) is returned."""
    if name not in _REGISTRY:
        raise KeyError(f"Unknown bot '{name}'. Available: {list(_REGISTRY)}")
    module_path, bot_cls_name, fe_cls_name = _REGISTRY[name]
    module = importlib.import_module(module_path)
    bot_cls = getattr(module, bot_cls_name)
    fe_cls = getattr(module, fe_cls_name)
    feature_extractor = fe_cls()

    if model_path and os.path.exists(model_path):
        return bot_cls.load(model_path, feature_extractor=feature_extractor)
    return bot_cls(feature_extractor=feature_extractor)


def load_all_bots(saved_models_dir: str) -> Dict[str, object]:
    """Load every bot that has a trained .pkl in saved_models_dir.
    Bots without a saved model are skipped (mirrors bot_registry.py's
    'online/healthy' tracking on the backend side)."""
    bots = {}
    for name in BOT_NAMES:
        path = os.path.join(saved_models_dir, f"{name}.pkl")
        if os.path.exists(path):
            bots[name] = load_bot(name, path)
    return bots
