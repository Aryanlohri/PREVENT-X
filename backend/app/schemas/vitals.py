from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class VitalBase(BaseModel):
    blood_pressure_sys: Optional[int] = None
    blood_pressure_dia: Optional[int] = None
    heart_rate: Optional[int] = None
    blood_sugar: Optional[int] = None
    bmi: Optional[float] = None

class VitalCreate(VitalBase):
    pass

class Vital(VitalBase):
    id: int
    user_id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
