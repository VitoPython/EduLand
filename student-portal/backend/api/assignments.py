from fastapi import APIRouter, Depends, HTTPException, status
from models.student import StudentInDB
from auth.jwt import get_current_student
from crud.course_crud import course_crud
from typing import Any, Dict

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