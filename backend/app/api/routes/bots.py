from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, get_db
from app.db.models import BotMetric
from app.schemas.bot_result import BotMetricResponse
from app.services.bot_health import refresh_bot_metrics

router = APIRouter()


@router.get("/bots/health", response_model=list[BotMetricResponse])
def get_bot_health(db: Session = Depends(get_db)):
    metrics = db.query(BotMetric).all()
    if not metrics:
        # Make the first dashboard request useful even before the periodic monitor's first run.
        refresh_bot_metrics()
        refreshed_db = SessionLocal()
        try:
            metrics = refreshed_db.query(BotMetric).all()
        finally:
            refreshed_db.close()
    return metrics
