import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # --- General & Runtime Mode ---
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    APP_MODE = os.getenv("APP_MODE", "replay")  # replay | live
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))

    # --- PostgreSQL Persistence ---
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_threatlens.db")

    # --- Redis Streaming & Event Bus ---
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

    # --- Web3 & Blockchain Audit Trail ---
    BLOCKCHAIN_ENABLED = os.getenv("BLOCKCHAIN_ENABLED", "false").lower() == "true"
    WEB3_RPC_URL = os.getenv("WEB3_RPC_URL", "")
    SMART_CONTRACT_ADDRESS = os.getenv("SMART_CONTRACT_ADDRESS", "")
    SIGNER_PRIVATE_KEY = os.getenv("SIGNER_PRIVATE_KEY", "")

    # --- AI Models & Detection Thresholds ---
    DDOS_PPS_THRESHOLD = int(os.getenv("DDOS_PPS_THRESHOLD", "10000"))
    BEACON_JITTER_TOLERANCE = float(os.getenv("BEACON_JITTER_TOLERANCE", "0.10"))
    DGA_ENTROPY_THRESHOLD = float(os.getenv("DGA_ENTROPY_THRESHOLD", "3.85"))
    EXFILTRATION_OUTBOUND_RATIO = float(os.getenv("EXFILTRATION_OUTBOUND_RATIO", "50.0"))

    # --- Ingestion Engine ---
    REPLAY_SPEED_MULTIPLIER = float(os.getenv("REPLAY_SPEED_MULTIPLIER", "1.0"))
    CAPTURE_INTERFACE = os.getenv("CAPTURE_INTERFACE", "eth0")

settings = Settings()
