from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    age: int | None = None
    gender: str | None = None
    height: int | None = None
    weight: int | None = None
    pre_existing_condition: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: str | None = None
    height: int | None = None
    weight: int | None = None
    pre_existing_condition: str | None = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    age: int | None = None
    gender: str | None = None
    height: int | None = None
    weight: int | None = None
    pre_existing_condition: str | None = None

    class Config:
        from_attributes = True