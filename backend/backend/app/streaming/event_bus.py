from app.streaming.redis_client import get_redis_client

r = get_redis_client()

def publish_flow_event(event: dict):
    r.xadd("flow:events", event)

def read_flow_events(last_id="0"):
    return r.xrange("flow:events", min=last_id)