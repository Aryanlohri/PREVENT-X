from sqlalchemy import Column, Integer, String
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Personalization fields for ML Risk Prediction
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True) # E.g., 'Male', 'Female'
    height = Column(Integer, nullable=True) # E.g., in cm
    weight = Column(Integer, nullable=True) # E.g., in kg
    pre_existing_condition = Column(String, nullable=True) # E.g., 'Diabetes', 'Hypertension'