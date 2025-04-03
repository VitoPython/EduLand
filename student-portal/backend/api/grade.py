from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from models.grade import GradeCreate, GradeUpdate, GradeInDB
from models.student import StudentInDB
from crud.grade import (
    create_grade,
    get_grade,
    get_student_assignment_grade,
    update_grade,
    delete_grade,
    get_student_grades
)
from auth.jwt import get_current_student
from dependencies.database import get_database

router = APIRouter(
    tags=["grades"]
)

@router.post("/", response_model=GradeInDB)
async def create_grade_endpoint(
    grade_data: GradeCreate,
    current_student: StudentInDB = Depends(get_current_student)
):
    # Проверка прав (в реальной системе здесь должна быть проверка, 
    # что текущий пользователь - преподаватель)
    
    # Создаем оценку
    new_grade = await create_grade(grade_data)
    return new_grade

@router.get("/student/{student_id}/assignment/{assignment_id}", response_model=Optional[GradeInDB])
async def read_student_assignment_grade(
    student_id: str,
    assignment_id: str,
    current_student: StudentInDB = Depends(get_current_student)
):
    # Проверяем, что студент запрашивает свою оценку
    if current_student.id != student_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    grade = await get_student_assignment_grade(student_id, assignment_id)
    # Если оценка не найдена, просто возвращаем None
    return grade

@router.get("/{grade_id}", response_model=GradeInDB)
async def read_grade(
    grade_id: str,
    current_student: StudentInDB = Depends(get_current_student)
):
    grade = await get_grade(grade_id)
    if grade is None:
        raise HTTPException(status_code=404, detail="Оценка не найдена")
    
    # Проверяем, что студент запрашивает свою оценку
    if grade.student_id != current_student.id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    return grade

@router.get("/student/{student_id}", response_model=List[GradeInDB])
async def read_student_grades(
    student_id: str,
    current_student: StudentInDB = Depends(get_current_student)
):
    """Получение всех оценок студента"""
    # Проверяем, что студент запрашивает свои оценки
    if current_student.id != student_id:
        raise HTTPException(status_code=403, detail="Недостаточно прав")
    
    grades = await get_student_grades(student_id)
    return grades 