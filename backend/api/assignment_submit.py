from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from models.assignment_submit import AssignmentSubmit, AssignmentSubmitCreate
from crud.assignment_submit_crud import assignment_submit_crud
from auth.dependencies import get_current_user
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/assignment-submit",
    tags=["assignment-submit"]
)

@router.post("/students/{student_id}/lessons/{lesson_id}/assignments/{assignment_id}/submit", response_model=Dict[str, Any])
async def create_assignment_submit(
    student_id: str,
    lesson_id: str,
    assignment_id: str,
    submit_data: AssignmentSubmitCreate,
    current_user: dict = Depends(get_current_user)
):
    """Создает новую отправку задания"""
    try:
        logger.info(f"Creating submit for student {student_id}, lesson {lesson_id}, assignment {assignment_id}")
        logger.info(f"Submit data: is_submitted={submit_data.is_submitted}, has_code={bool(submit_data.code)}, code_length={len(submit_data.code or '')}")
        
        submit = await assignment_submit_crud.create_submit(
            student_id=student_id,
            lesson_id=lesson_id,
            assignment_id=assignment_id,
            submit_data=submit_data
        )
        if not submit:
            logger.error("Failed to create submit")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create submit"
            )
        logger.info(f"Submit created successfully with id {submit.get('id')}")
        return submit
    except Exception as e:
        logger.error(f"Error creating submit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/students/{student_id}/assignments/{assignment_id}/submit", response_model=Dict[str, Any])
async def get_student_assignment_submit(
    student_id: str,
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает отправку задания для конкретного студента и задания"""
    try:
        logger.info(f"Getting submit for student {student_id}, assignment {assignment_id}")
        submit = await assignment_submit_crud.get_student_assignment_submit(
            student_id=student_id,
            assignment_id=assignment_id
        )
        if not submit:
            logger.info("No submit found, returning default response")
            return {
                "student_id": student_id,
                "assignment_id": assignment_id,
                "is_submitted": False
            }
        logger.info("Submit found successfully")
        return submit
    except Exception as e:
        logger.error(f"Error getting submit: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/students/{student_id}/submits", response_model=List[Dict[str, Any]])
async def get_student_submits(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает все отправки заданий для конкретного студента"""
    try:
        return await assignment_submit_crud.get_student_submits(student_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/lessons/{lesson_id}/submits", response_model=List[Dict[str, Any]])
async def get_lesson_submits(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает все отправки заданий для конкретного урока"""
    try:
        return await assignment_submit_crud.get_lesson_submits(lesson_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/assignments/{assignment_id}/submits", response_model=List[Dict[str, Any]])
async def get_assignment_submits(
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает все отправки для конкретного задания"""
    try:
        return await assignment_submit_crud.get_assignment_submits(assignment_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/submits/{submit_id}", response_model=Dict[str, Any])
async def update_submit(
    submit_id: str,
    submit_data: AssignmentSubmitCreate,
    current_user: dict = Depends(get_current_user)
):
    """Обновляет существующую отправку задания"""
    try:
        updated = await assignment_submit_crud.update_submit(submit_id, submit_data)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Submit not found"
            )
        return updated
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/submits/{submit_id}")
async def delete_submit(
    submit_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Удаляет отправку задания"""
    logger.info(f"Attempting to delete submit with ID: {submit_id}")
    success, error_message = await assignment_submit_crud.delete_submit(submit_id)
    
    if not success:
        logger.error(f"Failed to delete submit: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message or "Failed to delete submit"
        )
    
    logger.info("Submit deleted successfully")
    return {"message": "Submit deleted successfully"} 