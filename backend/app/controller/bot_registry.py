import requests
import os
from typing import Dict, Any, List
from app.utils.logger import setup_logger
from app.config import settings

logger = setup_logger(__name__)

class BotRegistry:
    def __init__(self):
        self.ai_service_url = os.getenv("AI_SERVICE_URL", "https://bots3-a8ta.onrender.com")
        self.active_bots = [
            "ddos_bot",
            "beaconing_bot", 
            "dga_dns_bot",
            "encrypted_malware_bot",
            "scanning_bot",
            "exfiltration_bot"
        ]

    def dispatch_to_bots(self, flow_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Send a flow or aggregated window to all registered bots for inference.
        Returns a list of predictions.
        """
        predictions = []
        try:
            # Assuming AI service has a batch predict endpoint
            response = requests.post(
                f"{self.ai_service_url}/predict", 
                json={"flow": flow_data},
                timeout=2.0
            )
            if response.status_code == 200:
                results = response.json().get("predictions", [])
                predictions.extend(results)
            else:
                logger.error(f"Failed to get prediction: {response.status_code}")
        except Exception as e:
            logger.error(f"Error dispatching to bots: {e}")
            
        return predictions

bot_registry = BotRegistry()
