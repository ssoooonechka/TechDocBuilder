from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    mail: EmailStr
    is_online: bool = False


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=64)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    mail: Optional[EmailStr] = None
    password: Optional[str] = None
    is_online: Optional[bool] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserRead(UserCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
