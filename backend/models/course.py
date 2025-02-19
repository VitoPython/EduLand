from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AssignmentBase(BaseModel):
    title: str
    description: str
    code_editor: Optional[str] = None

class Assignment(AssignmentBase):
    id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    assignments: List[Assignment] = []

class Lesson(LessonBase):
    id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    lessons: List[Lesson] = []

class Course(CourseBase):
    id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True

class CourseUpdate(BaseModel):
    title: Optional[str] = None 