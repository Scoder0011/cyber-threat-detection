from fastapi import APIRouter, HTTPException

router = APIRouter()

MOCK_ALERTS = [
    {
        "id": "1",
        "timestamp": "2026-08-25T14:30:00Z",
        "flow_id": "src:1.2.3.4-dst:5.6.7.8-proto:TCP",
        "threat_class": "syn_flood",
        "confidence": 0.93,
        "severity": "high",
        "evidence": {"syn_rate": 45000, "src_entropy": 0.11},
        "blockchain_tx": "0xabc..."
    },
    {
        "id": "2",
        "timestamp": "2026-08-25T14:32:00Z",
        "flow_id": "src:9.9.9.9-dst:8.8.8.8-proto:UDP",
        "threat_class": "port_scan",
        "confidence": 0.81,
        "severity": "medium",
        "evidence": {"unique_ports": 340},
        "blockchain_tx": "0xdef..."
    }
]

@router.get("/alerts")
def get_alerts():
    return MOCK_ALERTS

@router.get("/alerts/{alert_id}")
def get_alert(alert_id: str):
    alert = next((a for a in MOCK_ALERTS if a["id"] == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert