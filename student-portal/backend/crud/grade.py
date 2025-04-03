from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from models.grade import GradeCreate, GradeUpdate, GradeInDB
from dependencies.database import get_database
from fastapi import HTTPException

async def create_grade(grade: GradeCreate) -> GradeInDB:
    db = await get_database()
    grade_dict = grade.dict()
    grade_dict["created_at"] = datetime.utcnow()
    grade_dict["updated_at"] = datetime.utcnow()
    
    result = await db.grades.insert_one(grade_dict)
    grade_dict["_id"] = result.inserted_id
    
    return GradeInDB.from_mongo(grade_dict)

async def get_grade(grade_id: str) -> Optional[GradeInDB]:
    db = await get_database()
    try:
        if ObjectId.is_valid(grade_id):
            grade_id_obj = ObjectId(grade_id)
        else:
            grade_id_obj = grade_id
        grade = await db.grades.find_one({"_id": grade_id_obj})
        return GradeInDB.from_mongo(grade) if grade else None
    except Exception as e:
        print(f"Ошибка при получении оценки: {e}")
        return None

async def get_student_assignment_grade(student_id: str, assignment_id: str) -> Optional[GradeInDB]:
    db = await get_database()
    try:
        grade = await db.grades.find_one({
            "student_id": student_id,
            "assignment_id": assignment_id
        })
        return GradeInDB.from_mongo(grade) if grade else None
    except Exception as e:
        print(f"Ошибка при получении оценки студента: {e}")
        return None

async def update_grade(grade_id: str, grade_update: GradeUpdate) -> Optional[GradeInDB]:
    db = await get_database()
    update_data = grade_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    try:
        if ObjectId.is_valid(grade_id):
            grade_id_obj = ObjectId(grade_id)
        else:
            grade_id_obj = grade_id
            
        result = await db.grades.find_one_and_update(
            {"_id": grade_id_obj},
            {"$set": update_data},
            return_document=True
        )
        return GradeInDB.from_mongo(result) if result else None
    except Exception as e:
        print(f"Ошибка при обновлении оценки: {e}")
        return None

async def delete_grade(grade_id: str) -> bool:
    db = await get_database()
    try:
        if ObjectId.is_valid(grade_id):
            grade_id_obj = ObjectId(grade_id)
        else:
            grade_id_obj = grade_id
            
        result = await db.grades.delete_one({"_id": grade_id_obj})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Ошибка при удалении оценки: {e}")
        return False

async def get_student_grades(student_id: str) -> List[GradeInDB]:
    """Получает все оценки студента из базы данных"""
    db = await get_database()
    try:
        cursor = db.grades.find({"student_id": student_id})
        grades = []
        async for grade in cursor:
            grades.append(GradeInDB.from_mongo(grade))
        return grades
    except Exception as e:
        print(f"Ошибка при получении оценок студента: {e}")
        return [] 