from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from models.assignment_submission import AssignmentSubmissionCreate, AssignmentSubmissionUpdate, AssignmentSubmissionInDB

async def create_submission(
    collection: AsyncIOMotorCollection,
    submission_data: AssignmentSubmissionCreate
) -> AssignmentSubmissionInDB:
    submission_dict = submission_data.model_dump()
    submission_dict["created_at"] = datetime.utcnow()
    submission_dict["updated_at"] = datetime.utcnow()
    
    # Устанавливаем дату отправки, если is_submitted = True
    if submission_dict.get("is_submitted"):
        submission_dict["submit_date"] = datetime.utcnow()
    
    result = await collection.insert_one(submission_dict)
    created_submission = await collection.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string for Pydantic model
    if created_submission and "_id" in created_submission:
        created_submission["_id"] = str(created_submission["_id"])
    
    return AssignmentSubmissionInDB.model_validate(created_submission)

async def get_submission(
    collection: AsyncIOMotorCollection,
    submission_id: str
) -> Optional[AssignmentSubmissionInDB]:
    try:
        submission = await collection.find_one({"_id": ObjectId(submission_id)})
        if submission:
            # Convert ObjectId to string for Pydantic model
            submission["_id"] = str(submission["_id"])
            return AssignmentSubmissionInDB.model_validate(submission)
    except Exception as e:
        print(f"Error fetching submission: {e}")
        return None
    return None

async def get_submissions_by_student(
    collection: AsyncIOMotorCollection,
    student_id: str
) -> List[AssignmentSubmissionInDB]:
    try:
        cursor = collection.find({"student_id": student_id})
        submissions = await cursor.to_list(length=None)
        
        # Convert ObjectId to string for Pydantic models
        for submission in submissions:
            if "_id" in submission:
                submission["_id"] = str(submission["_id"])
                
        return [AssignmentSubmissionInDB.model_validate(submission) for submission in submissions]
    except Exception as e:
        print(f"Error fetching submissions by student: {e}")
        return []

async def get_submissions_by_lesson(
    collection: AsyncIOMotorCollection,
    lesson_id: str
) -> List[AssignmentSubmissionInDB]:
    try:
        cursor = collection.find({"lesson_id": lesson_id})
        submissions = await cursor.to_list(length=None)
        
        # Convert ObjectId to string for Pydantic models
        for submission in submissions:
            if "_id" in submission:
                submission["_id"] = str(submission["_id"])
                
        return [AssignmentSubmissionInDB.model_validate(submission) for submission in submissions]
    except Exception as e:
        print(f"Error fetching submissions by lesson: {e}")
        return []

async def get_submission_by_assignment(
    collection: AsyncIOMotorCollection,
    student_id: str,
    assignment_id: str
) -> Optional[Dict[str, Any]]:
    """
    Получение сдачи задания по ID студента и ID задания.
    """
    submission = await collection.find_one({
        "student_id": student_id,
        "assignment_id": assignment_id
    })
    
    if submission and "_id" in submission:
        # Преобразуем ObjectId в строку для Pydantic модели
        submission["_id"] = str(submission["_id"])
        
        # Проверяем все поля на наличие ObjectId и преобразуем их
        for key, value in submission.items():
            if isinstance(value, ObjectId):
                submission[key] = str(value)
    
    return submission

async def update_submission(
    collection: AsyncIOMotorCollection,
    submission_id: str,
    submission_data: AssignmentSubmissionUpdate
) -> Optional[AssignmentSubmissionInDB]:
    try:
        update_data = submission_data.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            if "is_submitted" in update_data and update_data["is_submitted"]:
                update_data["submit_date"] = datetime.utcnow()
            
            result = await collection.update_one(
                {"_id": ObjectId(submission_id)},
                {"$set": update_data}
            )
            if result.modified_count:
                return await get_submission(collection, submission_id)
    except Exception as e:
        print(f"Error updating submission: {e}")
        return None
    return None

async def delete_submission(
    collection: AsyncIOMotorCollection,
    submission_id: str
) -> bool:
    try:
        result = await collection.delete_one({"_id": ObjectId(submission_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting submission: {e}")
        return False 