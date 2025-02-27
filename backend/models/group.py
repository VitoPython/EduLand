from pydantic import BaseModel, EmailStr, Field, GetJsonSchemaHandler
from typing import Optional, List, Any, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                return_schema=core_schema.str_schema(),
            ),
        )

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)

class GroupStudent(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: EmailStr
    balance: int = 0
    progress: Optional[dict] = {}  # Для хранения прогресса по модулям
    total_points: int = 0
    status: str = "Admitted"  # Admitted/Pending/Rejected
    
class Group(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str                      # Например "Poland PY Regular 19 (SAT-10)"
    type: str = "Regular group"    # Тип группы
    is_premium: bool = False       # Премиум группа или нет
    ai_review: bool = False        # Включен ли AI-review
    max_students: int = 14         # Максимальное количество студентов
    min_age: int                   # Минимальный возраст
    max_age: int                   # Максимальный возраст
    lesson_duration: int           # Длительность урока в минутах
    language: str                  # Язык обучения
    funnel: str                    # Например "EU | Poland"
    start_date: datetime           # Дата начала занятий
    timezone: str                  # Часовой пояс
    course_id: str                 # ID привязанного курса
    lessons_completed: int = 0     # Количество завершенных уроков
    total_lessons: int = 0         # Общее количество уроков
    students: List[GroupStudent] = []  # Список студентов в группе
    students_count: int = 0        # Текущее количество студентов
    paid_count: int = 0           # Количество оплативших студентов
    previous_lesson: Optional[str] = None  # Ссылка на предыдущий урок
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        if "_id" in data:
            data["_id"] = str(data["_id"])
        return data

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    is_premium: Optional[bool] = None
    ai_review: Optional[bool] = None
    max_students: Optional[int] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    lesson_duration: Optional[int] = None
    language: Optional[str] = None
    funnel: Optional[str] = None
    start_date: Optional[datetime] = None
    timezone: Optional[str] = None
    course_id: Optional[str] = None
    lessons_completed: Optional[int] = None
    total_lessons: Optional[int] = None 