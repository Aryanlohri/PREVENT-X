from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.daily_log import DailyLog
from app.schemas.daily_log import DailyLogCreate, DailyLog as DailyLogSchema
from app.core.deps import get_current_user
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=DailyLogSchema)
async def create_daily_log(log: DailyLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.sockets import manager

    db_log = DailyLog(**log.model_dump(), user_id=current_user.id)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Broadcast an update event
    await manager.broadcast({"type": "LOGS_UPDATED"})
    
    return db_log

@router.get("/", response_model=List[DailyLogSchema])
def get_daily_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DailyLog).filter(DailyLog.user_id == current_user.id).order_by(DailyLog.date.desc()).all()
