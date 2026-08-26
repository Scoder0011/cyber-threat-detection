"""
Main Controller AI — calls each specialist bot's /predict endpoint,
and if a bot flags malicious traffic, writes a ThreatAlert.
"""
import requests
from app.db.session import SessionLocal
from app.db.models import ThreatAlert
import uuid

AI_SERVICE_URL = "https://three-1-1oz2.onrender.com"

CONFIDENCE_THRESHOLD = 0.7


def call_bot(bot_name: str, payload: dict) -> dict:
    resp = requests.post(
        f"{AI_SERVICE_URL}/predict/{bot_name}",
        json=payload,
        timeout=15
    )
    resp.raise_for_status()
    return resp.json()


def evaluate_flow(flow_data: dict, bot_name: str, bot_payload: dict):
    """
    Calls one bot with the given payload derived from flow_data.
    If malicious, writes an alert to the DB.
    """
    result = call_bot(bot_name, bot_payload)

    if result.get("malicious") and result.get("confidence", 0) >= CONFIDENCE_THRESHOLD:
        db = SessionLocal()
        try:
            alert = ThreatAlert(
                alert_id=str(uuid.uuid4()),
                title=f"{result.get('category', bot_name)} detected",
                description=f"{bot_name} flagged traffic as {result.get('label')}",
                severity=result.get("severity", "MEDIUM").upper(),
                attack_type=result.get("label", "unknown"),
                source_ip=flow_data.get("src_ip", "unknown"),
                target_ip=flow_data.get("dst_ip", "unknown"),
                confidence_score=result.get("confidence", 0.0),
                contributing_bots=[bot_name],
                bot_scores={bot_name: result.get("confidence", 0.0)},
                evidence=result.get("features", {}),
            )
            db.add(alert)
            db.commit()
            print(f"ALERT created: {alert.alert_id} ({bot_name}, {result.get('confidence')})")
            return alert
        finally:
            db.close()
    else:
        print(f"{bot_name}: benign/low-confidence, no alert")
        return None