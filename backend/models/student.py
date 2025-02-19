from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class StudentBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    comment: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    is_active: bool = True

class Student(StudentBase):
    password: str

class StudentInDB(StudentBase):
    id: Optional[str] = None
    hashed_password: str

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    comment: Optional[str] = None 