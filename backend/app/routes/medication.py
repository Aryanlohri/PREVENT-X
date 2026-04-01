from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.medication import Medication
from app.schemas.medication import MedicationCreate, MedicationUpdate, Medication as MedicationSchema
from app.core.deps import get_current_user
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=MedicationSchema)
async def create_medication(med: MedicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.sockets import manager

    db_med = Medication(**med.model_dump(), user_id=current_user.id)
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    
    # Broadcast an update event
    await manager.broadcast({"type": "MEDICATIONS_UPDATED"})
    
    return db_med

@router.get("/", response_model=List[MedicationSchema])
def get_medications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Medication).filter(Medication.user_id == current_user.id).order_by(Medication.date.desc()).all()

@router.patch("/{med_id}", response_model=MedicationSchema)
async def update_medication(med_id: int, med_update: MedicationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.sockets import manager

    db_med = db.query(Medication).filter(Medication.id == med_id, Medication.user_id == current_user.id).first()
    if not db_med:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    if med_update.taken is not None:
        db_med.taken = med_update.taken
    
    db.commit()
    db.refresh(db_med)
    
    # Broadcast an update event
    await manager.broadcast({"type": "MEDICATIONS_UPDATED"})
    
    return db_med
