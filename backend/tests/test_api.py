import asyncio
import httpx

from app.main import app


async def request(method, path, **kwargs):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        return await client.request(method, path, **kwargs)

def test_health_check():
    response = asyncio.run(request("GET", "/health"))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_alert():
    payload = {
        "alert_id": "test-alert-1",
        "title": "DDoS detected",
        "description": "Test alert",
        "severity": "HIGH",
        "attack_type": "DDoS",
        "source_ip": "192.0.2.1",
        "target_ip": "198.51.100.1",
        "confidence_score": 0.95,
    }
    created = asyncio.run(request("POST", "/api/alerts", json=payload))
    assert created.status_code == 200
    alerts = asyncio.run(request("GET", "/api/alerts"))
    assert alerts.status_code == 200
    assert alerts.json()[0]["alert_id"] == payload["alert_id"]
