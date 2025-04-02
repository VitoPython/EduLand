from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, validator
from bson import ObjectId


class AssignmentSubmissionBase(BaseModel):
    student_id: str = Field(...)
    lesson_id: str = Field(...)
    assignment_id: str = Field(...)
    is_submitted: bool = Field(default=False)
    submit_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('submit_date', pre=True, always=True)
    def set_submit_date(cls, v, values):
        # Если is_submitted=True, но submit_date не указана, установить текущую дату
        if values.get('is_submitted') and not v:
            return datetime.utcnow()
        return v
    
    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={
            "example": {
                "student_id": "67b4dac6ab292174637208d1",
                "lesson_id": "67b84e5b32e01542ce053641",
                "assignment_id": "67e3f447481c9342bf5cbcc1",
                "is_submitted": False
            }
        }
    )


class AssignmentSubmissionCreate(AssignmentSubmissionBase):
    pass


class AssignmentSubmissionUpdate(BaseModel):
    is_submitted: Optional[bool] = None
    submit_date: Optional[datetime] = None
    
    @validator('submit_date', pre=True, always=True)
    def set_submit_date(cls, v, values):
        # Если is_submitted=True, но submit_date не указана, установить текущую дату
        if values.get('is_submitted') and not v:
            return datetime.utcnow()
        return v
    
    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={
            "example": {
                "is_submitted": True
            }
        }
    )


class AssignmentSubmissionInDB(AssignmentSubmissionBase):
    id: str = Field(alias="_id")
    
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
        extra="ignore",
        json_schema_extra={
            "example": {
                "_id": "67ebbedbc23f4155afe33948",
                "student_id": "67b4dac6ab292174637208d1",
                "lesson_id": "67b84e5b32e01542ce053641",
                "assignment_id": "67e3f447481c9342bf5cbcc1",
                "is_submitted": False,
                "submit_date": None,
                "created_at": "2024-03-01T12:00:00",
                "updated_at": "2024-03-01T12:00:00"
            }
        }
    ) 