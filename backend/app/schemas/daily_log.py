from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DailyLogBase(BaseModel):
    sleep_quality: Optional[int] = None
    physical_activity: Optional[int] = None
    diet_quality: Optional[int] = None
    stress_level: Optional[int] = None

class DailyLogCreate(DailyLogBase):
    pass

class DailyLog(DailyLogBase):
    id: int
    user_id: int
    date: datetime
    
    model_config = ConfigDict(from_attributes=True)
