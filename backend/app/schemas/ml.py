from pydantic import BaseModel

class RiskPredictionRequest(BaseModel):
    age: int
    bmi: float
    sys_bp: int
    dia_bp: int
    heart_rate: int
    blood_sugar: int
    weekly_activity_minutes: int

class RiskProbabilities(BaseModel):
    low: float
    moderate: float
    high: float

class RiskPredictionResponse(BaseModel):
    risk_level: str
    risk_score: int
    probabilities: RiskProbabilities

class SymptomCheckRequest(BaseModel):
    symptoms: list[str] = []

class PredictionItem(BaseModel):
    probable_disease: str
    confidence: float
    prevention_steps: list[str]
    recommended_doctors: list[str]
    diet_advice: list[str]
    medication_advice: list[str]

class SymptomCheckResponse(BaseModel):
    urgency_level: str
    predictions: list[PredictionItem]
