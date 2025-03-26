from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StudentLogin(BaseModel):
    username: str
    password: str

class StudentCreate(StudentBase):
    password: str

class StudentInDB(StudentBase):
    id: str
    password_hash: str
    course_ids: List[str] = []  # Список ID курсов, на которые записан студент

class StudentResponse(StudentBase):
    id: str
    course_ids: List[str] = []

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    comment: Optional[str] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    student_id: str
    username: str 