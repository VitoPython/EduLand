from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient

from models.grade import Grade

class GradeCRUD:
    def __init__(self):
        # Конфигурация базы данных
        username = urllib.parse.quote_plus("vitaliipodgornii")
        password = urllib.parse.quote_plus("Vitalik199712")
        MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

        # Создание подключения к базе данных
        self.client = AsyncIOMotorClient(MONGO_URI)
        self.db = self.client.crm_database
        self.grades_collection = self.db.grades

    async def create(self, grade: Grade) -> Grade:
        grade_dict = grade.dict(by_alias=True, exclude_none=True)
        grade_dict["created_at"] = datetime.utcnow()
        grade_dict["updated_at"] = datetime.utcnow()
        
        result = await self.grades_collection.insert_one(grade_dict)
        grade_dict["_id"] = str(result.inserted_id)
        return Grade(**grade_dict)

    async def get(self, grade_id: str) -> Optional[Grade]:
        grade_dict = await self.grades_collection.find_one({"_id": ObjectId(grade_id)})
        if grade_dict:
            grade_dict["_id"] = str(grade_dict["_id"])
            return Grade(**grade_dict)
        return None

    async def get_by_assignment(self, assignment_id: str) -> List[Grade]:
        grades = []
        cursor = self.grades_collection.find({"assignment_id": assignment_id})
        async for grade_dict in cursor:
            grade_dict["_id"] = str(grade_dict["_id"])
            grades.append(Grade(**grade_dict))
        return grades

    async def update(self, grade_id: str, grade: Grade) -> Optional[Grade]:
        grade_dict = grade.dict(by_alias=True, exclude_none=True)
        grade_dict["updated_at"] = datetime.utcnow()
        
        result = await self.grades_collection.update_one(
            {"_id": ObjectId(grade_id)},
            {"$set": grade_dict}
        )
        if result.modified_count:
            return await self.get(grade_id)
        return None

    async def delete(self, grade_id: str) -> bool:
        result = await self.grades_collection.delete_one({"_id": ObjectId(grade_id)})
        return result.deleted_count > 0

    async def get_by_student(self, student_id: str) -> List[Grade]:
        grades = []
        cursor = self.grades_collection.find({"student_id": student_id})
        async for grade_dict in cursor:
            grade_dict["_id"] = str(grade_dict["_id"])
            grades.append(Grade(**grade_dict))
        return grades

grade_crud = GradeCRUD() 