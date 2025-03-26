from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class AssignmentBase(BaseModel):
    title: str
    description: str
    code_editor: Optional[str] = None
    lesson_id: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Assignment(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = ""
    code_editor: Optional[str] = ""
    lesson_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            ObjectId: str
        }

class LessonBase(BaseModel):
    title: str
    course_id: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class Lesson(LessonBase):
    id: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            ObjectId: str
        }

class CourseBase(BaseModel):
    title: str
    description: str
    duration: float
    price: float
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class Course(CourseBase):
    id: Optional[str] = None

    class Config:
        from_attributes = True

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[float] = None
    price: Optional[float] = None 