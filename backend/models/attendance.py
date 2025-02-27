from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class AttendanceStatus(str, Enum):
    UNASSIGNED = "unassigned"
    PRESENT = "present"
    NOTIFIED = "notified"
    ABSENT = "absent"

class AttendanceRecord(BaseModel):
    student_id: str
    group_id: str
    lesson_number: int
    status: AttendanceStatus
    date: datetime = datetime.utcnow()
    comment: Optional[str] = None

class StudentAttendance(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    attendance: List[AttendanceRecord] 