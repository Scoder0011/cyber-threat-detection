"""Periodic, best-effort synchronization of specialist-bot health."""
from datetime import datetime, timezone
from threading import Thread
from time import perf_counter
from typing import Any

import os
import requests

from app.db.models import BotMetric
from app.db.session import SessionLocal

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "https://three-1-1oz2.onrender.com")

SPECIALIST_BOTS = {
    "ddos_bot": "DDoS Detection",
    "beaconing_bot": "Beaconing Detection",
    "dga_dns_bot": "DGA / DNS Detection",
    "encrypted_malware_bot": "Encrypted Malware",
    "scanning_bot": "Scanning Detection",
    "exfiltration_bot": "Data Exfiltration",
}
REQUEST_TIMEOUT_SECONDS = 45


def _warm_service() -> None:
    """Start a Render instance without making the actual status check wait on it."""
    try:
        requests.get(f"{AI_SERVICE_URL}/health", timeout=REQUEST_TIMEOUT_SECONDS)
    except requests.RequestException:
        # The real /bots request below is authoritative for health status.
        pass


def _fetch_remote_bots() -> tuple[bool, dict[str, Any], float]:
    started = perf_counter()
    # On free-tier Render this request wakes an idle service in parallel.
    Thread(target=_warm_service, daemon=True).start()
    try:
        response = requests.get(f"{AI_SERVICE_URL}/bots", timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        payload = response.json()
        entries = payload if isinstance(payload, list) else payload.get("bots", payload)
        indexed = {
            str(item.get("bot_name") or item.get("name")): item
            for item in entries
            if isinstance(item, dict) and (item.get("bot_name") or item.get("name"))
        } if isinstance(entries, list) else {}
        return True, indexed, round((perf_counter() - started) * 1000, 2)
    except requests.RequestException:
        return False, {}, round((perf_counter() - started) * 1000, 2)


def refresh_bot_metrics() -> None:
    """Upsert bot rows. Network failures become OFFLINE records, not API failures."""
    available, remote_bots, latency_ms = _fetch_remote_bots()
    db = SessionLocal()
    try:
        for name, display_name in SPECIALIST_BOTS.items():
            remote = remote_bots.get(name, {})
            metric = db.query(BotMetric).filter(BotMetric.bot_name == name).first()
            if metric is None:
                metric = BotMetric(bot_name=name, display_name=display_name)
                db.add(metric)
            metric.display_name = str(remote.get("display_name", display_name))
            # A slow but successful /bots response is available.  Preserve an actual
            # reported bot status; absent bot data is INITIALIZING, never OFFLINE.
            metric.status = str(remote.get("status", "INITIALIZING" if available else "OFFLINE")).upper()
            metric.version = str(remote.get("version", "1.0.0"))
            metric.latency_ms = float(remote.get("latency_ms", latency_ms))
            metric.last_heartbeat = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
