from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class AssignmentBase(BaseModel):
    title: str
    description: str
    lesson_id: str
    code_editor: Optional[str] = None
    attachments: Optional[List[str]] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    lesson_id: Optional[str] = None
    code_editor: Optional[str] = None
    attachments: Optional[List[str]] = None

class AssignmentInDB(AssignmentBase):
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
                "title": "Задание 1",
                "description": "Описание задания 1",
                "lesson_id": "5f7d1d7c0b3e4b2e9c1d5e7a",
                "code_editor": "// Ваш код здесь",
                "attachments": ["assignment/files/doc1.pdf", "assignment/files/doc2.txt"],
                "created_at": "2021-08-01T12:00:00",
                "updated_at": "2021-08-01T12:00:00"
            }
        }
    ) 