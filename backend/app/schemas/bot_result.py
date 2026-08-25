from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BotMetricBase(BaseModel):
    bot_name: str = Field(..., max_length=64)
    display_name: str = Field(..., max_length=128)
    status: str = Field("HEALTHY", description="HEALTHY, DEGRADED, OFFLINE, INITIALIZING")
    version: str = Field("1.0.0", max_length=32)
    latency_ms: float = 0.0
    cpu_percent: float = 0.0
    memory_mb: float = 0.0
    predictions_count: int = 0
    threats_detected: int = 0
    accuracy_score: Optional[float] = 0.9850
    f1_score: Optional[float] = 0.9820

class BotMetricCreate(BotMetricBase):
    pass

class BotMetricResponse(BotMetricBase):
    id: str
    last_heartbeat: datetime

    class Config:
        from_attributes = True

class BotInferenceResult(BaseModel):
    flow_id: str
    bot_name: str
    is_attack: bool
    confidence: float
    features_extracted: Optional[dict] = {}
