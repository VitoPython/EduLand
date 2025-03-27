from bson import ObjectId
from datetime import datetime
from typing import List, Optional, Tuple
from models.assignment_submit import AssignmentSubmit, AssignmentSubmitCreate
from .database import get_database
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssignmentSubmitCRUD:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db.student_assignment_submit

    async def create_submit(
        self,
        student_id: str,
        lesson_id: str,
        assignment_id: str,
        submit_data: AssignmentSubmitCreate
    ) -> Optional[dict]:
        """Создает новую отправку задания"""
        try:
            # Проверяем, существует ли уже отправка
            existing = await self.get_student_assignment_submit(student_id, assignment_id)
            if existing:
                # Если существует, обновляем её
                return await self.update_submit(existing["id"], submit_data)

            submit_dict = {
                "student_id": student_id,
                "lesson_id": lesson_id,
                "assignment_id": assignment_id,
                "is_submitted": submit_data.is_submitted,
                "submit_date": submit_data.submit_date or datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            result = await self.collection.insert_one(submit_dict)
            # Получаем полный документ после вставки
            created_submit = await self.collection.find_one({"_id": result.inserted_id})
            if created_submit:
                created_submit["id"] = str(created_submit["_id"])
                del created_submit["_id"]
                return created_submit
            return None
        except Exception as e:
            print(f"Error in create_submit: {str(e)}")
            raise

    async def get_student_assignment_submit(
        self,
        student_id: str,
        assignment_id: str
    ) -> Optional[dict]:
        """Получает отправку задания для конкретного студента и задания"""
        try:
            submit = await self.collection.find_one({
                "student_id": student_id,
                "assignment_id": assignment_id
            })
            if submit:
                submit["id"] = str(submit["_id"])
                del submit["_id"]
                return submit
            return None
        except Exception as e:
            print(f"Error in get_student_assignment_submit: {str(e)}")
            raise

    async def get_student_submits(self, student_id: str) -> List[dict]:
        """Получает все отправки заданий для конкретного студента"""
        try:
            cursor = self.collection.find({"student_id": student_id})
            submits = []
            async for submit in cursor:
                submit["id"] = str(submit["_id"])
                del submit["_id"]
                submits.append(submit)
            return submits
        except Exception as e:
            print(f"Error in get_student_submits: {str(e)}")
            raise

    async def get_lesson_submits(self, lesson_id: str) -> List[dict]:
        """Получает все отправки заданий для конкретного урока"""
        try:
            cursor = self.collection.find({"lesson_id": lesson_id})
            submits = []
            async for submit in cursor:
                submit["id"] = str(submit["_id"])
                del submit["_id"]
                submits.append(submit)
            return submits
        except Exception as e:
            print(f"Error in get_lesson_submits: {str(e)}")
            raise

    async def get_assignment_submits(self, assignment_id: str) -> List[dict]:
        """Получает все отправки для конкретного задания"""
        try:
            cursor = self.collection.find({"assignment_id": assignment_id})
            submits = []
            async for submit in cursor:
                submit["id"] = str(submit["_id"])
                del submit["_id"]
                submits.append(submit)
            return submits
        except Exception as e:
            print(f"Error in get_assignment_submits: {str(e)}")
            raise

    async def update_submit(
        self,
        submit_id: str,
        submit_data: AssignmentSubmitCreate
    ) -> Optional[dict]:
        """Обновляет существующую отправку задания"""
        try:
            update_data = {
                "$set": {
                    "is_submitted": submit_data.is_submitted,
                    "submit_date": submit_data.submit_date or datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
            
            result = await self.collection.find_one_and_update(
                {"_id": ObjectId(submit_id)},
                update_data,
                return_document=True
            )
            
            if result:
                result["id"] = str(result["_id"])
                del result["_id"]
                return result
            return None
        except Exception as e:
            print(f"Error in update_submit: {str(e)}")
            raise

    async def delete_submit(self, submit_id: str) -> Tuple[bool, Optional[str]]:
        """
        Удаляет отправку задания
        Возвращает кортеж (успех, сообщение об ошибке)
        """
        try:
            # Проверяем, что ID валидный
            if not ObjectId.is_valid(submit_id):
                return False, "Invalid submit ID format"

            # Проверяем, существует ли отправка
            submit = await self.collection.find_one({"_id": ObjectId(submit_id)})
            if not submit:
                return False, "Submit not found"

            # Удаляем отправку
            result = await self.collection.delete_one({"_id": ObjectId(submit_id)})
            if result.deleted_count > 0:
                return True, None
            return False, "Failed to delete submit"
            
        except Exception as e:
            logger.error(f"Error in delete_submit: {str(e)}")
            return False, str(e)

assignment_submit_crud = AssignmentSubmitCRUD() 