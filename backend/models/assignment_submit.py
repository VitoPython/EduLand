from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AssignmentSubmitBase(BaseModel):
    is_submitted: bool = False
    submit_date: Optional[datetime] = None

class AssignmentSubmitCreate(AssignmentSubmitBase):
    pass

class AssignmentSubmit(AssignmentSubmitBase):
    id: str
    student_id: str
    lesson_id: str
    assignment_id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    ) 