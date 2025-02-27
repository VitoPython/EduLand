from fastapi import APIRouter, HTTPException, Depends
from models.attendance import AttendanceRecord, AttendanceStatus
from crud.attendance_crud import attendance_crud
from typing import List
from .dependencies import get_current_user

router = APIRouter(
    prefix="/attendance",
    tags=["attendance"]
)

@router.post("/{group_id}/record")
async def record_attendance(
    group_id: str,
    attendance: AttendanceRecord,
    current_user = Depends(get_current_user)
):
    try:
        return await attendance_crud.record_attendance(attendance)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/group/{group_id}")
async def get_group_attendance(
    group_id: str,
    current_user = Depends(get_current_user)
):
    try:
        return await attendance_crud.get_group_attendance(group_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/student/{student_id}/group/{group_id}")
async def get_student_attendance(
    student_id: str,
    group_id: str,
    current_user = Depends(get_current_user)
):
    try:
        return await attendance_crud.get_student_attendance(student_id, group_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 