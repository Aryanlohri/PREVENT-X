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
        # Fetch latest vitals
        latest_vital = db.query(Vital).filter(Vital.user_id == current_user.id).order_by(Vital.timestamp.desc()).first()
        
        # We need mock or actual symptoms according to the new ML schema:
        # Age, Gender, Polyuria, Polydipsia, sudden weight loss, weakness, Polyphagia,
        # Genital thrush, visual blurring, Itching, Irritability, delayed healing,
        # partial paresis, muscle stiffness, Alopecia, Obesity
        
        # Map the user's real age and gender if available, otherwise fallback to defaults
        age = current_user.age if current_user.age else 45
        gender = 1 if current_user.gender == 'Male' else 0
        
        # Hardcoding default absence of severe symptoms unless vital signs hint otherwise
        polyuria = 0
        polydipsia = 0
        weight_loss = 0
        weakness = 0 
        polyphagia = 0
        genital_thrush = 0
        blurring = 0
        itching = 0
        irritability = 0
        healing = 0
        paresis = 0
        stiffness = 0
        alopecia = 0
        
        # We can extract obesity from BMI
        bmi = latest_vital.bmi if latest_vital else 22.0
        obesity = 1 if bmi >= 30 else 0
        
        prediction = predict_health_risk(
            age=age,
            gender=gender,
            polyuria=polyuria,
            polydipsia=polydipsia,
            weight_loss=weight_loss,
            weakness=weakness,
            polyphagia=polyphagia,
            genital_thrush=genital_thrush,
            blurring=blurring,
            itching=itching,
            irritability=irritability,
            healing=healing,
            paresis=paresis,
            stiffness=stiffness,
            alopecia=alopecia,
            obesity=obesity
        )
        return RiskPredictionResponse(**prediction)
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
