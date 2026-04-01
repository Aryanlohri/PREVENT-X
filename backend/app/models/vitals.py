from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from datetime import datetime, timezone
from app.database.base import Base

class Vital(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    blood_pressure_sys = Column(Integer, nullable=True)
    blood_pressure_dia = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    blood_sugar = Column(Integer, nullable=True)
    bmi = Column(Float, nullable=True)
