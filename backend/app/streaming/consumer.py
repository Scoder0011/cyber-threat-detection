"""
Consumes flow events from Redis stream 'flow:events' and writes
them into the network_flows table.

Also runs a minimal dummy HTTP server so this can be deployed on
Render's free tier as a Web Service (which requires a bound port),
even though its real job is the background consume loop.
"""
import os
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

from app.streaming.redis_client import get_redis_client
from app.db.session import SessionLocal
from app.db.models import NetworkFlow

STREAM_NAME = "flow:events"
GROUP_NAME = "backend_consumers"
CONSUMER_NAME = "consumer_1"

r = get_redis_client()


# ---------- Dummy HTTP server (Render port-check satisfier) ----------

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"consumer alive")

    def log_message(self, format, *args):
        pass  # silence default request logging


def start_dummy_server():
    port = int(os.environ.get("PORT", 8080))
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    server.serve_forever()


# ---------- Redis stream consumer ----------

def ensure_group():
    try:
        r.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception as e:
        if "BUSYGROUP" not in str(e):
            raise


def process_event(event_id: str, data: dict, db):
    flow = NetworkFlow(
        flow_id=data.get("flow_id"),
        src_ip=data.get("src_ip"),
        dst_ip=data.get("dst_ip"),
        src_port=int(data.get("src_port", 0)),
        dst_port=int(data.get("dst_port", 0)),
        protocol=data.get("protocol", "TCP"),
        pkts_in=int(data.get("packet_count", 0)),
        bytes_in=int(data.get("byte_count", 0)),
        duration=float(data.get("duration_ms", 0)) / 1000.0,
    )
    db.add(flow)
    db.commit()
    r.xack(STREAM_NAME, GROUP_NAME, event_id)


def run_consumer():
    ensure_group()
    print(f"Listening on stream '{STREAM_NAME}'...")
    db = SessionLocal()
    try:
        while True:
            try:
                entries = r.xreadgroup(
                    GROUP_NAME, CONSUMER_NAME,
                    {STREAM_NAME: ">"},
                    count=10, block=5000
                )
            except Exception as e:
                print(f"Redis read error, retrying: {e}")
                time.sleep(2)
                continue

            if not entries:
                continue

            for _, events in entries:
                for event_id, data in events:
                    try:
                        process_event(event_id, data, db)
                        print(f"Processed {event_id}: {data.get('flow_id')}")
                    except Exception as e:
                        print(f"Error processing {event_id}: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    threading.Thread(target=start_dummy_server, daemon=True).start()
    run_consumer()