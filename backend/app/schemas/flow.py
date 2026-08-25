from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class NetworkFlowBase(BaseModel):
    flow_id: str = Field(..., max_length=64)
    src_ip: str = Field(..., max_length=45)
    dst_ip: str = Field(..., max_length=45)
    src_port: int = Field(..., ge=0, le=65535)
    dst_port: int = Field(..., ge=0, le=65535)
    protocol: str = Field("TCP", max_length=10)
    duration: float = 0.0
    bytes_in: int = 0
    bytes_out: int = 0
    pkts_in: int = 0
    pkts_out: int = 0
    tcp_flags: Optional[str] = Field("SYN-ACK", max_length=32)
    flow_rate_bps: Optional[float] = 0.0
    packet_rate_pps: Optional[float] = 0.0
    entropy: Optional[float] = 0.0
    ja3_hash: Optional[str] = Field(None, max_length=64)
    is_attack: bool = False
    attack_type: Optional[str] = Field("BENIGN", max_length=64)
    metadata: Optional[Dict[str, Any]] = {}

class NetworkFlowCreate(NetworkFlowBase):
    pass

class NetworkFlowResponse(NetworkFlowBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
