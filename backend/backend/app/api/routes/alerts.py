from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.db.models import ThreatAlert
from app.schemas.alert import ThreatAlertCreate, ThreatAlertUpdate, ThreatAlertResponse

router = APIRouter()


@router.get("/alerts", response_model=list[ThreatAlertResponse])
def get_alerts(limit: int = 50, db: Session = Depends(get_db)):
    alerts = (
        db.query(ThreatAlert)
        .order_by(desc(ThreatAlert.created_at))
        .limit(limit)
        .all()
    )
    return alerts


@router.get("/alerts/{alert_id}", response_model=ThreatAlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(ThreatAlert).filter(ThreatAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/alerts", response_model=ThreatAlertResponse)
def create_alert(alert: ThreatAlertCreate, db: Session = Depends(get_db)):
    db_alert = ThreatAlert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.patch("/alerts/{alert_id}", response_model=ThreatAlertResponse)
def update_alert(alert_id: str, update: ThreatAlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(ThreatAlert).filter(ThreatAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(alert, field, value)
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(ThreatAlert).filter(ThreatAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"detail": f"Alert {alert_id} deleted"}