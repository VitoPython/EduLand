from motor.motor_asyncio import AsyncIOMotorClient
from models.enrollment import Enrollment
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import urllib.parse

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database
enrollments_collection = db.enrollments

class EnrollmentCRUD:
    async def create_enrollment(self, enrollment: Enrollment) -> Enrollment:
        # Проверяем, не записан ли уже студент на этот курс
        existing = await enrollments_collection.find_one({
            "student_id": enrollment.student_id,
            "course_id": enrollment.course_id
        })
        if existing:
            return None

        enrollment_dict = enrollment.model_dump()
        enrollment_dict['created_at'] = datetime.utcnow()
        enrollment_dict['updated_at'] = datetime.utcnow()
        
        result = await enrollments_collection.insert_one(enrollment_dict)
        created = await enrollments_collection.find_one({"_id": result.inserted_id})
        
        if created:
            created["id"] = str(created["_id"])
            return Enrollment(**created)
        return None

    async def get_student_enrollments(self, student_id: str) -> List[Enrollment]:
        enrollments = []
        cursor = enrollments_collection.find({"student_id": student_id})
        async for enrollment in cursor:
            enrollment["id"] = str(enrollment["_id"])
            enrollments.append(Enrollment(**enrollment))
        return enrollments

    async def get_course_enrollments(self, course_id: str) -> List[Enrollment]:
        enrollments = []
        cursor = enrollments_collection.find({"course_id": course_id})
        async for enrollment in cursor:
            enrollment["id"] = str(enrollment["_id"])
            enrollments.append(Enrollment(**enrollment))
        return enrollments

    async def update_enrollment(self, enrollment_id: str, update_data: dict) -> Optional[Enrollment]:
        update_data["updated_at"] = datetime.utcnow()
        
        result = await enrollments_collection.find_one_and_update(
            {"_id": ObjectId(enrollment_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result["_id"])
            return Enrollment(**result)
        return None

    async def delete_enrollment(self, enrollment_id: str) -> bool:
        result = await enrollments_collection.delete_one({"_id": ObjectId(enrollment_id)})
        return result.deleted_count > 0

    async def get_enrollment(self, enrollment_id: str) -> Optional[Enrollment]:
        enrollment = await enrollments_collection.find_one({"_id": ObjectId(enrollment_id)})
        if enrollment:
            enrollment["id"] = str(enrollment["_id"])
            return Enrollment(**enrollment)
        return None

enrollment_crud = EnrollmentCRUD() 