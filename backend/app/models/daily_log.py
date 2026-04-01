from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime, timezone
from app.database.base import Base

class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    sleep_quality = Column(Integer, nullable=True) 
    physical_activity = Column(Integer, nullable=True)
    diet_quality = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
