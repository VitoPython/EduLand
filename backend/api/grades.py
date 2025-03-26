from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.grade import Grade
from crud.grade import grade_crud
from crud.course_crud import course_crud
from crud.student_crud import student_crud
from auth.dependencies import verify_token

router = APIRouter(prefix="/api", tags=["grades"])

@router.post("/assignments/grades/", response_model=Grade)
async def create_grade(grade: Grade, token: dict = Depends(verify_token)):
    # Проверяем существование задания
    assignment = await course_crud.get_assignment(grade.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Проверяем существование студента
    student = await student_crud.get_user_by_id(grade.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Проверяем, что оценка в допустимом диапазоне
    if not 0 <= grade.grade <= 10:
        raise HTTPException(status_code=400, detail="Grade must be between 0 and 10")

    return await grade_crud.create(grade)

@router.get("/assignments/{assignment_id}/grades/", response_model=List[Grade])
async def get_grades_by_assignment(assignment_id: str, token: dict = Depends(verify_token)):
    # Проверяем существование задания
    assignment = await course_crud.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return await grade_crud.get_by_assignment(assignment_id)

@router.put("/assignments/grades/{grade_id}/", response_model=Grade)
async def update_grade(grade_id: str, grade: Grade, token: dict = Depends(verify_token)):
    # Проверяем существование оценки
    existing_grade = await grade_crud.get(grade_id)
    if not existing_grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    # Проверяем существование задания
    assignment = await course_crud.get_assignment(grade.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Проверяем существование студента
    student = await student_crud.get_user_by_id(grade.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Проверяем, что оценка в допустимом диапазоне
    if not 0 <= grade.grade <= 10:
        raise HTTPException(status_code=400, detail="Grade must be between 0 and 10")

    updated_grade = await grade_crud.update(grade_id, grade)
    if not updated_grade:
        raise HTTPException(status_code=404, detail="Failed to update grade")
    return updated_grade

@router.delete("/assignments/grades/{grade_id}/")
async def delete_grade(grade_id: str, token: dict = Depends(verify_token)):
    # Проверяем существование оценки
    existing_grade = await grade_crud.get(grade_id)
    if not existing_grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    success = await grade_crud.delete(grade_id)
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete grade")
    return {"message": "Grade deleted successfully"}

@router.get("/assignments/students/{student_id}/grades/", response_model=List[Grade])
async def get_student_grades(student_id: str, token: dict = Depends(verify_token)):
    # Проверяем существование студента
    student = await student_crud.get_user_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return await grade_crud.get_by_student(student_id) 