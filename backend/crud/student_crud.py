from motor.motor_asyncio import AsyncIOMotorClient
from models.student import Student, StudentInDB
import urllib.parse
from datetime import datetime
from passlib.context import CryptContext
from bson import ObjectId
from typing import Optional, List

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database
students_collection = db.students  # Изменили коллекцию на students

class StudentCRUD:
    async def create_user(self, student: Student) -> StudentInDB:
        hashed_password = pwd_context.hash(student.password)
        
        student_dict = student.model_dump(exclude={'password'})
        student_dict['hashed_password'] = hashed_password
        student_dict['created_at'] = datetime.utcnow()
        student_dict['updated_at'] = datetime.utcnow()
        
        result = await students_collection.insert_one(student_dict)
        created_student = await students_collection.find_one({"_id": result.inserted_id})
        return StudentInDB(id=str(created_student["_id"]), **created_student)

    async def get_users(self, skip: int = 0, limit: int = 10) -> List[StudentInDB]:
        students = []
        cursor = students_collection.find().skip(skip).limit(limit)
        async for student in cursor:
            students.append(StudentInDB(id=str(student["_id"]), **student))
        return students

    async def get_user_by_email(self, email: str) -> Optional[StudentInDB]:
        student = await students_collection.find_one({"email": email})
        if student:
            return StudentInDB(id=str(student["_id"]), **student)
        return None

    async def get_user_by_username(self, username: str) -> Optional[StudentInDB]:
        student = await students_collection.find_one({"username": username})
        if student:
            return StudentInDB(id=str(student["_id"]), **student)
        return None

    async def update_user(self, student_id: str, student_data: dict) -> Optional[StudentInDB]:
        try:
            existing_student = await self.get_user_by_id(student_id)
            if not existing_student:
                return None

            update_data = {k: v for k, v in student_data.items() if v is not None}
            
            if not update_data:
                return existing_student

            update_data["updated_at"] = datetime.utcnow()

            result = await students_collection.find_one_and_update(
                {"_id": ObjectId(student_id)},
                {"$set": update_data},
                return_document=True
            )

            if result:
                return StudentInDB(id=str(result["_id"]), **result)
            return None
            
        except Exception as e:
            print(f"Error updating student: {e}")
            return None

    async def delete_user(self, student_id: str) -> bool:
        result = await students_collection.delete_one({"_id": ObjectId(student_id)})
        return result.deleted_count > 0

    async def get_user_by_id(self, student_id: str) -> Optional[StudentInDB]:
        try:
            student = await students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                return StudentInDB(id=str(student["_id"]), **student)
            return None
        except Exception as e:
            print(f"Error getting student by id: {e}")
            return None

student_crud = StudentCRUD() 