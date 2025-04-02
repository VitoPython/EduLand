from fastapi import APIRouter, Depends, HTTPException, status
from models.student import StudentInDB
from models.assignment import AssignmentUpdate, AssignmentInDB
from auth.jwt import get_current_student
from crud.course_crud import course_crud
import crud.assignments as crud
from typing import Any, Dict, List
from motor.motor_asyncio import AsyncIOMotorCollection
from dependencies.database import get_assignments_collection
from bson import ObjectId

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.get("/{assignment_id}", response_model=Dict[str, Any])
async def get_assignment_by_id(
    assignment_id: str,
    current_student: StudentInDB = Depends(get_current_student)
) -> Any:
    """Получает информацию о конкретном задании по его ID"""
    # Получаем задание
    assignment = await course_crud.get_assignment_by_id(assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задание не найдено"
        )
    
    # Получаем урок, к которому принадлежит задание
    lesson_id = assignment.get("lesson_id")
    lesson = await course_crud.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Урок не найден"
        )
    
    # Проверяем, имеет ли студент доступ к курсу этого урока
    course_id = lesson.get("course_id")
    student_courses = await course_crud.get_student_courses(current_student.id)
    if not any(course["id"] == course_id for course in student_courses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому заданию"
        )
    
    return assignment 

@router.patch("/{assignment_id}", response_model=AssignmentInDB)
async def update_assignment(
    assignment_id: str,
    assignment_data: AssignmentUpdate,
    collection: AsyncIOMotorCollection = Depends(get_assignments_collection)
):
    """
    Обновление задания по ID.
    """
    raw_assignment = await crud.update_assignment(collection, assignment_id, assignment_data)
    if raw_assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Assignment not found"
        )
    
    # Преобразуем все ObjectId в строки
    for key, value in raw_assignment.items():
        if isinstance(value, ObjectId):
            raw_assignment[key] = str(value)
            
    return raw_assignment 