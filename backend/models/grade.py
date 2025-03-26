from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class Grade(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    assignment_id: str
    student_id: str
    grade: int = Field(..., ge=0, le=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 