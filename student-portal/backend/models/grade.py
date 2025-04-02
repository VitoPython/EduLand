from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class GradeBase(BaseModel):
    assignment_id: str
    student_id: str
    grade: int = Field(..., ge=0, le=100)  # Оценка от 0 до 100

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    grade: Optional[int] = Field(None, ge=0, le=100)

class GradeInDB(GradeBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @classmethod
    def from_mongo(cls, data: dict):
        if not data:
            return None
        
        id = data.pop("_id", None)
        # Преобразуем ObjectId в строку
        if id and isinstance(id, ObjectId):
            id = str(id)
            
        return cls(**dict(data, id=id)) 