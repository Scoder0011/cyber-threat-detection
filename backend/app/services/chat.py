"""Chat response provider. Replace ``build_response`` with an LLM call later."""
from collections import Counter

from sqlalchemy.orm import Session

from app.db.models import BotMetric, NetworkFlow, ThreatAlert


def build_response(message: str, db: Session) -> str:
    """Return a concise analyst response using the current database state."""
    query = message.lower()
    alerts = db.query(ThreatAlert).all()
    severity_counts = Counter((alert.severity or "UNKNOWN").upper() for alert in alerts)

    if "critical" in query:
        return f"There are {severity_counts['CRITICAL']} critical alerts in the current alert store."
    if any(word in query for word in ("how many", "count", "alerts", "severity")):
        breakdown = ", ".join(
            f"{severity.lower()}: {severity_counts.get(severity, 0)}"
            for severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW")
        )
        return f"There are {len(alerts)} alerts. Severity breakdown — {breakdown}."
    if any(word in query for word in ("bot", "health", "status")):
        bots = db.query(BotMetric).all()
        if not bots:
            return "No bot-health records are available yet; the health monitor will populate them shortly."
        summary = ", ".join(f"{bot.display_name}: {bot.status.lower()}" for bot in bots)
        return f"Current bot status: {summary}."
    if any(word in query for word in ("traffic", "flow", "network")):
        flow_count = db.query(NetworkFlow).count()
        attack_count = db.query(NetworkFlow).filter(NetworkFlow.is_attack.is_(True)).count()
        return f"The system has recorded {flow_count} flows, including {attack_count} marked as attack traffic."

    return (
        f"I can summarize the {len(alerts)} current alerts, severity counts, bot health, "
        "or recorded network traffic. Try asking about critical alerts or bot status."
    )
