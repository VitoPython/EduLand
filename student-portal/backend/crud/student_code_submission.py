from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from models.student_code_submission import StudentCodeSubmissionCreate, StudentCodeSubmissionUpdate, StudentCodeSubmissionInDB

async def create_code_submission(
    collection: AsyncIOMotorCollection,
    code_data: StudentCodeSubmissionCreate
) -> StudentCodeSubmissionInDB:
    """Создание новой записи кода студента"""
    code_dict = code_data.model_dump()
    code_dict["created_at"] = datetime.utcnow()
    code_dict["updated_at"] = datetime.utcnow()
    
    result = await collection.insert_one(code_dict)
    created_code = await collection.find_one({"_id": result.inserted_id})
    
    if created_code and "_id" in created_code:
        created_code["_id"] = str(created_code["_id"])
    
    return StudentCodeSubmissionInDB.from_mongo(created_code)

async def get_code_submission(
    collection: AsyncIOMotorCollection,
    submission_id: str
) -> Optional[StudentCodeSubmissionInDB]:
    """Получение записи кода по ID"""
    try:
        submission = await collection.find_one({"_id": ObjectId(submission_id)})
        if submission:
            return StudentCodeSubmissionInDB.from_mongo(submission)
    except Exception as e:
        print(f"Error fetching code submission: {e}")
        return None
    return None

async def get_student_assignment_code(
    collection: AsyncIOMotorCollection,
    student_id: str,
    assignment_id: str
) -> Optional[StudentCodeSubmissionInDB]:
    """Получение кода студента для конкретного задания"""
    try:
        submission = await collection.find_one({
            "student_id": student_id,
            "assignment_id": assignment_id
        })
        if submission:
            return StudentCodeSubmissionInDB.from_mongo(submission)
    except Exception as e:
        print(f"Error fetching student assignment code: {e}")
        return None
    return None

async def update_code_submission(
    collection: AsyncIOMotorCollection,
    student_id: str,
    assignment_id: str,
    code_data: StudentCodeSubmissionUpdate
) -> Optional[StudentCodeSubmissionInDB]:
    """Обновление кода для задания студента"""
    try:
        update_data = code_data.model_dump(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Сначала проверяем, существует ли запись
            existing = await collection.find_one({
                "student_id": student_id,
                "assignment_id": assignment_id
            })
            
            if existing:
                # Обновляем существующую запись
                result = await collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": update_data}
                )
                if result.modified_count:
                    return await get_code_submission(collection, str(existing["_id"]))
            else:
                # Создаем новую запись
                new_submission = StudentCodeSubmissionCreate(
                    student_id=student_id,
                    assignment_id=assignment_id,
                    code=update_data["code"]
                )
                return await create_code_submission(collection, new_submission)
    except Exception as e:
        print(f"Error updating code submission: {e}")
        return None
    return None

async def delete_code_submission(
    collection: AsyncIOMotorCollection,
    submission_id: str
) -> bool:
    """Удаление записи кода"""
    try:
        result = await collection.delete_one({"_id": ObjectId(submission_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting code submission: {e}")
        return False 