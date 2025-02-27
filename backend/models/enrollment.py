from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EnrollmentBase(BaseModel):
    student_id: str
    course_id: str
    status: str = "active"  # active, completed, dropped
    progress: float = 0.0  # прогресс от 0 до 100
    start_date: datetime = datetime.utcnow()
    completion_date: Optional[datetime] = None
    
class Enrollment(EnrollmentBase):
    id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True

class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[float] = None
    completion_date: Optional[datetime] = None 