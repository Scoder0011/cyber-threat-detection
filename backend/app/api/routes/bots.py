from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import BotMetric
from app.schemas.bot_result import BotMetricResponse

router = APIRouter()


@router.get("/bots/health", response_model=list[BotMetricResponse])
def get_bot_health(db: Session = Depends(get_db)):
    return db.query(BotMetric).all()