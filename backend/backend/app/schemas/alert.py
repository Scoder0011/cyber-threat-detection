from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ThreatAlertBase(BaseModel):
    alert_id: str = Field(..., max_length=64)
    title: str = Field(..., max_length=255)
    description: str
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    attack_type: str = Field(..., max_length=64)
    source_ip: str = Field(..., max_length=45)
    target_ip: str = Field(..., max_length=45)
    target_port: Optional[int] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    contributing_bots: List[str] = []
    bot_scores: Dict[str, float] = {}
    evidence: Dict[str, Any] = {}
    status: str = Field("NEW", description="NEW, INVESTIGATING, RESOLVED, FALSE_POSITIVE")
    blockchain_tx_hash: Optional[str] = Field(None, max_length=66)
    blockchain_verified: bool = False
    blockchain_block_num: Optional[int] = None

class ThreatAlertCreate(ThreatAlertBase):
    pass

class ThreatAlertUpdate(BaseModel):
    status: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_verified: Optional[bool] = None
    blockchain_block_num: Optional[int] = None

class ThreatAlertResponse(ThreatAlertBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
