from sqlalchemy import Column, String, Float, DateTime, JSON
from app.db.session import Base
import uuid
import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    flow_id = Column(String, nullable=False)
    threat_class = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    evidence = Column(JSON)
    blockchain_tx = Column(String, nullable=True)

