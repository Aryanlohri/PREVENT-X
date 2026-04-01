from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.vitals import Vital
from app.schemas.vitals import VitalCreate, Vital as VitalSchema
from app.core.deps import get_current_user
from app.models.user import User
from typing import List
from fastapi.responses import StreamingResponse
from app.services.pdf_generator import generate_health_report
from app.ml.risk_model import predict_health_risk

router = APIRouter()

@router.post("/", response_model=VitalSchema)
async def create_vital(vital: VitalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.core.sockets import manager

    db_vital = Vital(**vital.model_dump(), user_id=current_user.id)
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    
    # Broadcast an update event
    await manager.broadcast({"type": "VITALS_UPDATED"})
    
    return db_vital

@router.get("/", response_model=List[VitalSchema])
def get_vitals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Vital).filter(Vital.user_id == current_user.id).order_by(Vital.timestamp.desc()).all()

@router.get("/export-pdf")
def export_vitals_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Fetch vitals
        vitals = db.query(Vital).filter(Vital.user_id == current_user.id).order_by(Vital.timestamp.desc()).all()
        
        # Calculate ML Risk score on the fly
        latest_vital = vitals[0] if vitals else None
        age = current_user.age if current_user.age else 45
        gender = 1 if current_user.gender == 'Male' else 0
        bmi = latest_vital.bmi if latest_vital and latest_vital.bmi else 22.0
        obesity = 1 if bmi >= 30 else 0
        
        risk_result = predict_health_risk(
            age=age,
            gender=gender,
            polyuria=0,
            polydipsia=0,
            weight_loss=0,
            weakness=0,
            polyphagia=0,
            genital_thrush=0,
            blurring=0,
            itching=0,
            irritability=0,
            healing=0,
            paresis=0,
            stiffness=0,
            alopecia=0,
            obesity=obesity
        )
        risk_score = risk_result["risk_score"]
        
        # Generate PDF stream
        pdf_stream = generate_health_report(current_user, vitals, risk_score)
        
        # Fast API Streaming Response
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=PreventX_Health_Report_{current_user.name.replace(' ', '_')}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")
