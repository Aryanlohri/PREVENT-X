from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class MedicationBase(BaseModel):
    name: str
    time: str
    taken: bool = False

class MedicationCreate(MedicationBase):
    pass

class MedicationUpdate(BaseModel):
    taken: Optional[bool] = None

class Medication(MedicationBase):
    id: int
    user_id: int
    date: datetime
    
    model_config = ConfigDict(from_attributes=True)
