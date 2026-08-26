import os
import redis
from dotenv import load_dotenv

load_dotenv()

def get_redis_client():
    return redis.from_url(
        os.getenv("REDIS_URL"),
        decode_responses=True,
        socket_timeout=10,
        socket_connect_timeout=10,
        socket_keepalive=True,
        retry_on_timeout=True,
    )