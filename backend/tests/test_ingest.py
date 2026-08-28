import asyncio
import httpx

from app.main import app


async def request(method, path, **kwargs):
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        return await client.request(method, path, **kwargs)


from unittest.mock import patch

@patch("app.api.routes.flows.evaluate_flow")
def test_create_and_list_flow(mock_evaluate_flow):
    payload = {
        "flow_id": "test-flow-1",
        "src_ip": "192.0.2.10",
        "dst_ip": "198.51.100.10",
        "src_port": 50000,
        "dst_port": 443,
    }
    created = asyncio.run(request("POST", "/api/flows", json=payload))
    assert created.status_code == 200
    flows = asyncio.run(request("GET", "/api/flows"))
    assert flows.status_code == 200
    assert flows.json()[0]["flow_id"] == payload["flow_id"]
