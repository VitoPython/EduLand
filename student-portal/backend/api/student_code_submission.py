from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorCollection
from models.student_code_submission import (
    StudentCodeSubmissionCreate,
    StudentCodeSubmissionUpdate,
    StudentCodeSubmissionInDB
)
import crud.student_code_submission as crud
from dependencies.database import get_student_code_submit_collection
from auth.jwt import get_current_student
from models.student import StudentInDB

router = APIRouter(
    prefix="/student-code",
    tags=["student code submission"]
)

@router.post("/", response_model=StudentCodeSubmissionInDB, status_code=status.HTTP_201_CREATED)
async def create_code_submission(
    code_data: StudentCodeSubmissionCreate,
    current_student: StudentInDB = Depends(get_current_student),
    collection: AsyncIOMotorCollection = Depends(get_student_code_submit_collection)
):
    """
    Создание новой записи кода студента.
    """
    # Проверяем, что студент создает запись только для себя
    if code_data.student_id != current_student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете создавать записи только для своих заданий"
        )
    
    return await crud.create_code_submission(collection, code_data)

@router.get("/{submission_id}", response_model=StudentCodeSubmissionInDB)
async def get_code_submission(
    submission_id: str,
    current_student: StudentInDB = Depends(get_current_student),
    collection: AsyncIOMotorCollection = Depends(get_student_code_submit_collection)
):
    """
    Получение информации о конкретной записи кода по ID.
    """
    submission = await crud.get_code_submission(collection, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Submission not found"
        )
    
    # Проверяем, что студент запрашивает только свои записи
    if submission.student_id != current_student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете просматривать только свои записи"
        )
    
    return submission

@router.get("/student/{student_id}/assignment/{assignment_id}", response_model=StudentCodeSubmissionInDB)
async def get_student_assignment_code(
    student_id: str,
    assignment_id: str,
    current_student: StudentInDB = Depends(get_current_student),
    collection: AsyncIOMotorCollection = Depends(get_student_code_submit_collection)
):
    """
    Получение кода студента для конкретного задания.
    Если код еще не существует, возвращает заглушку с пустым кодом.
    """
    # Проверяем, что студент запрашивает только свои записи
    if student_id != current_student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете просматривать только свои записи"
        )
    
    submission = await crud.get_student_assignment_code(collection, student_id, assignment_id)
    if not submission:
        # Вместо ошибки 404, возвращаем заглушку с пустым кодом
        # Создаем временный объект (не сохраняя в БД)
        from datetime import datetime
        dummy_id = f"dummy_{student_id}_{assignment_id}"
        return StudentCodeSubmissionInDB(
            _id=dummy_id,
            student_id=student_id,
            assignment_id=assignment_id,
            code="",  # Пустой код
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    return submission

@router.patch("/student/{student_id}/assignment/{assignment_id}", response_model=StudentCodeSubmissionInDB)
async def update_student_assignment_code(
    student_id: str,
    assignment_id: str,
    code_data: StudentCodeSubmissionUpdate,
    current_student: StudentInDB = Depends(get_current_student),
    collection: AsyncIOMotorCollection = Depends(get_student_code_submit_collection)
):
    """
    Обновление кода студента для конкретного задания.
    Если запись еще не существует, создает новую.
    """
    # Проверяем, что студент обновляет только свои записи
    if student_id != current_student.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете обновлять только свои записи"
        )
    
    submission = await crud.update_code_submission(collection, student_id, assignment_id, code_data)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Ошибка при обновлении кода"
        )
    
    return submission 