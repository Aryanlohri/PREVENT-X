from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from datetime import datetime, timezone
from app.database.base import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    time = Column(String, nullable=False) # e.g., "8:00 AM"
    taken = Column(Boolean, default=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
