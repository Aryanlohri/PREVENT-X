from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.vitals import Vital
from app.models.daily_log import DailyLog
from app.core.deps import get_current_user
from app.schemas.ml import RiskPredictionResponse, SymptomCheckRequest, SymptomCheckResponse
from app.ml.risk_model import predict_health_risk
from app.ml.symptom_model import predict_disease_from_symptoms
from datetime import date

router = APIRouter()

@router.get("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict health risk based on user vitals data.
    """
    try:
        # Fetch latest available vitals for each metric independently (persistence logic)
        vitals_query = db.query(Vital).filter(Vital.user_id == current_user.id).order_by(Vital.timestamp.desc())
        
        latest_bp_sys = vitals_query.filter(Vital.blood_pressure_sys != None).first()
        latest_bp_dia = vitals_query.filter(Vital.blood_pressure_dia != None).first()
        latest_sugar = vitals_query.filter(Vital.blood_sugar != None).first()
        latest_hr = vitals_query.filter(Vital.heart_rate != None).first()
        latest_bmi = vitals_query.filter(Vital.bmi != None).first()
        
        # Mapping Clinical Heuristics for responsive scoring
        vitals_risk_bonus = 0
        
        # 1. Blood Pressure Risk
        if latest_bp_sys and latest_bp_dia:
            sys = latest_bp_sys.blood_pressure_sys
            dia = latest_bp_dia.blood_pressure_dia
            if sys > 180 or dia > 110:
                vitals_risk_bonus += 60 # CRISIS range
            elif sys > 160 or dia > 100:
                vitals_risk_bonus += 35 # Crisis/Stage 2
            elif sys > 140 or dia > 90:
                vitals_risk_bonus += 15 # Stage 1 Hypertension
                
        # 2. Blood Sugar Risk
        if latest_sugar:
            sugar = latest_sugar.blood_sugar
            if sugar > 300:
                vitals_risk_bonus += 65 # CRISIS range
            elif sugar > 200:
                vitals_risk_bonus += 45 # Very High / Diabetic range
            elif sugar > 140:
                vitals_risk_bonus += 20 # Elevated
                
        # 3. Heart Rate Risk
        if latest_hr:
            hr = latest_hr.heart_rate
            if hr > 100 or hr < 50:
                vitals_risk_bonus += 10 # Tachycardia/Bradycardia
                
        # 4. Obesity Risk (BMI)
        bmi = latest_bmi.bmi if latest_bmi else 22.0
        obesity = 1 if bmi >= 30 else 0
        if obesity:
            vitals_risk_bonus += 10

        # Map the user's real age and gender if available
        age = current_user.age if current_user.age else 45
        gender = 1 if current_user.gender == 'Male' else 0
        
        # ML Prediction (Symptom-based baseline)
        prediction = predict_health_risk(
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
        
        # Merge ML Score with Vitals Heuristics
        ml_score = prediction["risk_score"]
        final_score = min(100, ml_score + vitals_risk_bonus)
        
        # Update Level and Response
        level = "Low Risk"
        if final_score > 40: level = "Moderate Risk"
        if final_score > 70: level = "High Risk"
        
        return RiskPredictionResponse(
            risk_level=level,
            risk_score=final_score,
            probabilities={
                "low": float(max(0, 100 - final_score) / 100),
                "moderate": 0.0,
                "high": float(final_score / 100)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running prediction model: {str(e)}")

@router.post("/predict-disease", response_model=SymptomCheckResponse)
def get_disease_prediction(
    request: SymptomCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes an array of user-selected symptoms and returns a probable disease prediction
    using the trained Random Forest model.
    """
    try:
        prediction = predict_disease_from_symptoms(request.symptoms)
        return dict(prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.ml.lifestyle_model import predict_lifestyle_plan
from app.ml.recommender_logic import generate_diet_and_exercise_plan
from pydantic import BaseModel
from typing import Dict, Any, List

class LifestylePlanResponse(BaseModel):
    calories: str
    macros: str
    workout_type: str
    intensity: str
    daily_goals: List[Dict[str, Any]]
    daily_meals: List[Dict[str, Any]]
    daily_workouts: List[Dict[str, Any]]
    weekly_meals: List[Dict[str, Any]]
    weekly_workouts: List[Dict[str, Any]]

@router.get("/my-lifestyle-plan", response_model=LifestylePlanResponse)
def get_lifestyle_plan(current_user: User = Depends(get_current_user)):
    """
    Returns a personalized Diet & Workout AI plan based on user profile.
    Enforces prerequisites: age, gender, weight, height, and pre_existing_condition.
    """
    if not all([current_user.age, current_user.gender, current_user.weight, current_user.height, current_user.pre_existing_condition]):
        # The frontend looks for a specific status code or message to show the "Complete Profile" prompt
        raise HTTPException(status_code=400, detail="MISSING_PREREQUISITES")

    try:
        plan = predict_lifestyle_plan(
            age=current_user.age,
            gender=current_user.gender,
            height_cm=current_user.height,
            weight_kg=current_user.weight,
            condition=current_user.pre_existing_condition
        )
        
        # Dynamically map the ML category predictions into a robust structured daily plan
        detailed_schedule = generate_diet_and_exercise_plan(
            plan["calories"], 
            plan["macros"], 
            plan["workout_type"], 
            plan["intensity"]
        )
        
        return LifestylePlanResponse(
            calories=plan["calories"],
            macros=plan["macros"],
            workout_type=plan["workout_type"],
            intensity=plan["intensity"],
            daily_goals=detailed_schedule["daily_goals"],
            daily_meals=detailed_schedule["daily_meals"],
            daily_workouts=detailed_schedule["daily_workouts"],
            weekly_meals=detailed_schedule["weekly_meals"],
            weekly_workouts=detailed_schedule["weekly_workouts"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
