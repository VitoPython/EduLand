from fastapi import APIRouter, Depends, HTTPException, status
from models.student import StudentInDB
from auth.jwt import get_current_student
from crud.course_crud import course_crud
from typing import Any, List, Dict

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[Dict[str, Any]])
async def get_student_courses(current_student: StudentInDB = Depends(get_current_student)) -> Any:
    """Получает список курсов, на которые записан студент"""
    courses = await course_crud.get_student_courses(current_student.id)
    return courses

@router.get("/{course_id}", response_model=Dict[str, Any])
async def get_course_by_id(
    course_id: str,
    current_student: StudentInDB = Depends(get_current_student)
) -> Any:
    """Получает информацию о конкретном курсе по его ID"""
    # Проверяем, записан ли студент на этот курс
    student_courses = await course_crud.get_student_courses(current_student.id)
    if not any(course["id"] == course_id for course in student_courses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому курсу"
        )
    
    course = await course_crud.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден"
        )
    
    return course

@router.get("/{course_id}/lessons", response_model=List[Dict[str, Any]])
async def get_course_lessons(
    course_id: str,
    current_student: StudentInDB = Depends(get_current_student)
) -> Any:
    """Получает список уроков для конкретного курса"""
    # Проверяем, записан ли студент на этот курс
    student_courses = await course_crud.get_student_courses(current_student.id)
    if not any(course["id"] == course_id for course in student_courses):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому курсу"
        )
    
    lessons = await course_crud.get_course_lessons(course_id)
    return lessons 