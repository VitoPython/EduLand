from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from motor.motor_asyncio import AsyncIOMotorCollection
from models.assignment_submission import (
    AssignmentSubmissionCreate,
    AssignmentSubmissionUpdate,
    AssignmentSubmissionInDB
)
from crud import assignment_submission as crud
from dependencies.database import get_student_assignment_submit_collection
from datetime import datetime
from bson import ObjectId

router = APIRouter(
    prefix="/assignment-submission",
    tags=["assignment submission"]
)

@router.post("/", response_model=AssignmentSubmissionInDB, status_code=status.HTTP_201_CREATED)
async def create_assignment_submission(
    submission_data: AssignmentSubmissionCreate,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Создание новой записи о сдаче задания студентом.
    """
    # Проверяем, существует ли уже сабмит для этого задания
    existing_submission = await crud.get_submission_by_assignment(
        collection,
        submission_data.student_id,
        submission_data.assignment_id
    )
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission for this assignment already exists"
        )
    return await crud.create_submission(collection, submission_data)

@router.get("/{submission_id}", response_model=AssignmentSubmissionInDB)
async def get_assignment_submission(
    submission_id: str,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Получение информации о конкретной сдаче задания по ID.
    """
    submission = await crud.get_submission(collection, submission_id)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Submission not found"
        )
    return submission

@router.get("/student/{student_id}", response_model=List[AssignmentSubmissionInDB])
async def get_student_submissions(
    student_id: str,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Получение всех сдач заданий конкретного студента.
    """
    return await crud.get_submissions_by_student(collection, student_id)

@router.get("/lesson/{lesson_id}", response_model=List[AssignmentSubmissionInDB])
async def get_lesson_submissions(
    lesson_id: str,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Получение всех сдач заданий для конкретного урока.
    """
    return await crud.get_submissions_by_lesson(collection, lesson_id)

@router.get("/student/{student_id}/assignment/{assignment_id}", response_model=AssignmentSubmissionInDB)
async def get_student_assignment_submission(
    student_id: str,
    assignment_id: str,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Получение информации о сдаче конкретного задания конкретным студентом.
    Если запись не существует, создает заглушку с is_submitted=false.
    """
    submission = await crud.get_submission_by_assignment(collection, student_id, assignment_id)
    if not submission:
        # Получаем информацию о задании для lesson_id
        try:
            from crud import assignments as assignments_crud
            
            assignment = await assignments_crud.get_assignment(collection.database.assignments, assignment_id)
            
            # Явно преобразуем ObjectId в строку перед использованием
            if assignment and "lesson_id" in assignment:
                if isinstance(assignment["lesson_id"], ObjectId):
                    lesson_id = str(assignment["lesson_id"])
                else:
                    lesson_id = assignment["lesson_id"]
            else:
                lesson_id = "unknown"
                
            print(f"Lesson ID type: {type(lesson_id)}, value: {lesson_id}")
                
        except Exception as e:
            print(f"Ошибка при получении lesson_id: {e}")
            lesson_id = "unknown"
            
        # Создаем временную заглушку для фронтенда
        current_time = datetime.utcnow()
        dummy_submission = {
            "_id": f"dummy_{student_id}_{assignment_id}",
            "student_id": student_id,
            "assignment_id": assignment_id,
            "lesson_id": lesson_id,
            "is_submitted": False,
            "submit_date": None,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Отладочный вывод для проверки типов данных
        print(f"Создаем dummy submission: {dummy_submission}")
        print(f"lesson_id тип: {type(dummy_submission['lesson_id'])}")
        
        return AssignmentSubmissionInDB(**dummy_submission)
    
    # Проверяем и преобразуем все возможные ObjectId в строку
    if isinstance(submission, dict):
        for key, value in submission.items():
            if isinstance(value, ObjectId):
                submission[key] = str(value)
    
    return submission

@router.patch("/{submission_id}", response_model=AssignmentSubmissionInDB)
async def update_assignment_submission(
    submission_id: str,
    submission_data: AssignmentSubmissionUpdate,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Обновление информации о сдаче задания, включая статус is_submitted.
    """
    # Добавляем дату отправки, если is_submitted = True и submit_date не указана
    if submission_data.is_submitted and not submission_data.submit_date:
        submission_data.submit_date = datetime.utcnow()
        
    submission = await crud.update_submission(collection, submission_id, submission_data)
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Submission not found"
        )
    return submission

@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment_submission(
    submission_id: str,
    collection: AsyncIOMotorCollection = Depends(get_student_assignment_submit_collection)
):
    """
    Удаление записи о сдаче задания.
    """
    success = await crud.delete_submission(collection, submission_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Submission not found"
        )
    return None 