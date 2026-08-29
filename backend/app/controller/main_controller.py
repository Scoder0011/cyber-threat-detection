"""
Main Controller AI — Score Fusion.
Consumes predictions from Redis Event Bus, fuses their scores,
and if a threshold is crossed, generates a ThreatAlert.
"""
import uuid
from datetime import datetime
from app.db.session import SessionLocal
from app.db.models import ThreatAlert

CONFIDENCE_THRESHOLD = 0.65

# All 6 specialist bots active for multi-bot threat detection
ACTIVE_BOTS = [
    "ddos_bot",
    "beaconing_bot",
    "dga_dns_bot",
    "encrypted_malware_bot",
    "scanning_bot",
    "exfiltration_bot",
]

def log_to_blockchain(alert_id: str, attack_label: str, confidence: float) -> str:
    """
    Log alert to blockchain and return transaction hash.
    """
    # Placeholder implementation - replace with actual blockchain integration
    return f"0x{uuid.uuid4().hex[:64]}"

def evaluate_flow_fusion(flow_data: dict, bot_predictions: dict, db):
    """
    Score Fusion logic based on the bot predictions retrieved from Redis Event Bus.
    """
    total_confidence = 0.0
    malicious_votes = 0

    for bot, res in bot_predictions.items():
        if res.get("malicious"):
            malicious_votes += 1
            total_confidence += res.get("confidence", 0.0)

    # 5. Main Controller (Score Fusion)
    if malicious_votes > 0:
        fused_confidence = total_confidence / malicious_votes
        
        # Boost confidence if multiple bots detected it
        if malicious_votes > 1:
            fused_confidence = min(0.99, fused_confidence + (malicious_votes * 0.05))

        if fused_confidence >= CONFIDENCE_THRESHOLD:
            # Determine primary attack type
            primary_bot = max(bot_predictions.items(), key=lambda x: x[1].get("confidence", 0))[0]
            primary_res = bot_predictions[primary_bot]

            alert_id = str(uuid.uuid4())
            
            # 6. Log to Blockchain
            tx_hash = log_to_blockchain(alert_id, primary_res.get("label", "unknown"), fused_confidence)

            # 7. Save Alert in PostgreSQL
            alert = ThreatAlert(
                alert_id=alert_id,
                title=f"Multi-Vector {primary_res.get('category', primary_bot).replace('_', ' ').title()} Detected",
                description=f"Score Fusion engine detected malicious activity flagged by {malicious_votes} specialist bots.",
                severity="CRITICAL" if fused_confidence > 0.85 else "HIGH",
                attack_type=primary_res.get("label", "unknown"),
                source_ip=flow_data.get("src_ip", "unknown"),
                target_ip=flow_data.get("dst_ip", "unknown"),
                confidence_score=fused_confidence,
                contributing_bots=[b for b, res in bot_predictions.items() if res.get("malicious")],
                bot_scores={b: res.get("confidence", 0) for b, res in bot_predictions.items()},
                evidence={"tx_hash": tx_hash, "fused_confidence": fused_confidence}
            )
            db.add(alert)
            print(f"[FUSION] ALERT created: {alert.alert_id} (Confidence: {fused_confidence:.2f})")
            return alert
    
    return None
