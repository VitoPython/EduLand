from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, List
from auth.dependencies import get_current_user
from bson import ObjectId
from .database import get_database
import logging

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/code-viewer",
    tags=["student-code"]
)

@router.get("/students/{student_id}/assignments/{assignment_id}", response_model=Dict[str, Any])
async def get_student_code(
    student_id: str,
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает код студента для конкретного задания из коллекции student_assignment_code_submit"""
    try:
        db = get_database()
        code_submission = await db.student_assignment_code_submit.find_one({
            "student_id": student_id,
            "assignment_id": assignment_id
        })
        
        if not code_submission:
            return {
                "student_id": student_id,
                "assignment_id": assignment_id,
                "has_submission": False,
                "code": None
            }
        
        # Преобразуем ObjectId в строку
        code_submission["id"] = str(code_submission["_id"])
        del code_submission["_id"]
        
        # Добавляем флаг наличия отправки
        code_submission["has_submission"] = True
        
        return code_submission
    except Exception as e:
        logger.error(f"Error getting code submission: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/students/{student_id}/code-submissions", response_model=List[Dict[str, Any]])
async def get_student_code_submissions(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Получает все отправки кода для конкретного студента"""
    try:
        db = get_database()
        cursor = db.student_assignment_code_submit.find({"student_id": student_id})
        submissions = []
        
        async for submission in cursor:
            submission["id"] = str(submission["_id"])
            del submission["_id"]
            submissions.append(submission)
            
        return submissions
    except Exception as e:
        logger.error(f"Error getting student code submissions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 