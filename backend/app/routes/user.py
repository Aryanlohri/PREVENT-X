from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

from sqlalchemy.orm import Session
from app.database.session import get_db

@router.put("/me", response_model=UserResponse)
def update_users_me(
    user_data: UserUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        user_dict = user_data.dict(exclude_unset=True)
        if "full_name" in user_dict and user_dict["full_name"]:
            current_user.full_name = user_dict["full_name"]
        if "age" in user_dict:
            current_user.age = user_dict["age"]
        if "gender" in user_dict:
            current_user.gender = user_dict["gender"]
        if "height" in user_dict:
            current_user.height = user_dict["height"]
        if "weight" in user_dict:
            current_user.weight = user_dict["weight"]
        if "pre_existing_condition" in user_dict:
            current_user.pre_existing_condition = user_dict["pre_existing_condition"]

        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return current_user
    finally:
        db.close()
