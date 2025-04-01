from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId

class StudentCodeSubmissionBase(BaseModel):
    student_id: str
    assignment_id: str
    code: str
    
class StudentCodeSubmissionCreate(StudentCodeSubmissionBase):
    pass

class StudentCodeSubmissionUpdate(BaseModel):
    code: Optional[str] = None
    
class StudentCodeSubmissionInDB(StudentCodeSubmissionBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    
    @classmethod
    def from_mongo(cls, data: dict):
        """Преобразует данные из MongoDB в модель Pydantic"""
        if data:
            # Преобразуем все ObjectId в строки
            for k, v in data.items():
                if isinstance(v, ObjectId):
                    data[k] = str(v)
            return cls(**data)
        return None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "_id": "5f7d1d7c0b3e4b2e9c1d5e7a",
                "student_id": "5f7d1d7c0b3e4b2e9c1d5e7a",
                "assignment_id": "5f7d1d7c0b3e4b2e9c1d5e7a",
                "code": "print('Hello, World!')",
                "created_at": "2021-08-01T12:00:00",
                "updated_at": "2021-08-01T12:00:00"
            }
        }
    ) 