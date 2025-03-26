from fastapi import APIRouter, Depends, HTTPException, status
from models.student import StudentInDB
from auth.jwt import get_current_student
from crud.course_crud import course_crud
from typing import Any, List, Dict

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.get("/{lesson_id}", response_model=Dict[str, Any])
async def get_lesson_by_id(
    lesson_id: str,
    current_student: StudentInDB = Depends(get_current_student)
) -> Any:
    """Получает информацию о конкретном уроке по его ID"""
    # Получаем урок
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
            detail="У вас нет доступа к этому уроку"
        )
    
    return lesson

@router.get("/{lesson_id}/assignments", response_model=List[Dict[str, Any]])
async def get_lesson_assignments(
    lesson_id: str,
    current_student: StudentInDB = Depends(get_current_student)
) -> Any:
    """Получает список заданий для конкретного урока"""
    # Получаем урок
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
            detail="У вас нет доступа к этому уроку"
        )
    
    # Получаем задания урока
    assignments = await course_crud.get_lesson_assignments(lesson_id)
    return assignments 