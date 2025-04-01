from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection
from models.assignment import AssignmentCreate, AssignmentUpdate, AssignmentInDB

async def get_assignment(
    collection: AsyncIOMotorCollection,
    assignment_id: str
) -> Optional[Dict[str, Any]]:
    """
    Получение задания по ID.
    """
    assignment = await collection.find_one({"_id": ObjectId(assignment_id)})
    if assignment:
        assignment["_id"] = str(assignment["_id"])
    return assignment

async def get_assignments_by_lesson(
    collection: AsyncIOMotorCollection,
    lesson_id: str
) -> List[Dict[str, Any]]:
    """
    Получение всех заданий урока.
    """
    assignments = await collection.find({"lesson_id": lesson_id}).to_list(length=100)
    for assignment in assignments:
        assignment["_id"] = str(assignment["_id"])
    return assignments

async def create_assignment(
    collection: AsyncIOMotorCollection,
    assignment_data: AssignmentCreate
) -> Dict[str, Any]:
    """
    Создание нового задания.
    """
    assignment_dict = assignment_data.model_dump()
    assignment_dict["created_at"] = datetime.utcnow()
    assignment_dict["updated_at"] = datetime.utcnow()
    
    result = await collection.insert_one(assignment_dict)
    assignment = await collection.find_one({"_id": result.inserted_id})
    
    if assignment:
        assignment["_id"] = str(assignment["_id"])
    
    return assignment

async def update_assignment(
    collection: AsyncIOMotorCollection,
    assignment_id: str,
    assignment_data: AssignmentUpdate
) -> Optional[Dict[str, Any]]:
    """
    Обновление задания по ID.
    """
    update_data = {k: v for k, v in assignment_data.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        await collection.update_one(
            {"_id": ObjectId(assignment_id)},
            {"$set": update_data}
        )
    
    assignment = await get_assignment(collection, assignment_id)
    
    # Важно: преобразовать все ObjectId в строки здесь
    if assignment:
        for key, value in assignment.items():
            if isinstance(value, ObjectId):
                assignment[key] = str(value)
    
    return assignment

async def delete_assignment(
    collection: AsyncIOMotorCollection,
    assignment_id: str
) -> bool:
    """
    Удаление задания по ID.
    """
    result = await collection.delete_one({"_id": ObjectId(assignment_id)})
    return result.deleted_count > 0 