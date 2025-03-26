from motor.motor_asyncio import AsyncIOMotorClient
from models.student import StudentInDB, StudentCreate, StudentUpdate
import urllib.parse
from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
import os
from passlib.context import CryptContext
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Подключение к MongoDB
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

try:
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.crm_database  # Используем ту же базу данных, что и основное приложение
    students_collection = db.students
    enrollments_collection = db.enrollments
    
    # Проверка соединения
    client.admin.command('ping')
    logger.info("MongoDB соединение установлено успешно")
except Exception as e:
    logger.error(f"Ошибка подключения к MongoDB: {e}")
    # Создаем пустые заглушки для коллекций, чтобы избежать ошибок импорта
    db = None
    students_collection = None
    enrollments_collection = None

class StudentCRUD:
    def verify_password(self, plain_password, hashed_password):
        """Проверяет, соответствует ли plaintext пароль хешированному паролю."""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Ошибка проверки пароля: {e}")
            return False

    def get_password_hash(self, password):
        """Создает хеш пароля для безопасного хранения."""
        return pwd_context.hash(password)

    async def authenticate_student(self, username: str, password: str) -> Optional[StudentInDB]:
        """Аутентифицирует студента по имени пользователя и паролю."""
        try:
            logger.info(f"Попытка аутентификации студента с username: {username}")
            student = await students_collection.find_one({"username": username})
            
            if not student:
                logger.warning(f"Студент с username {username} не найден")
                return None
                
            logger.info(f"Студент найден, проверяем пароль")
            if not self.verify_password(password, student.get("hashed_password")):
                logger.warning(f"Неверный пароль для студента {username}")
                return None
            
            # Приводим поля из базы данных к ожидаемому формату модели
            # Важно: в базе данных поле называется "hashed_password", 
            # но в модели StudentInDB оно называется "password_hash"
            student_data = {
                "id": str(student["_id"]),
                "username": student["username"],
                "first_name": student.get("first_name", ""),
                "last_name": student.get("last_name", ""),
                "email": student.get("email", ""),
                "phone": student.get("phone", ""),
                "comment": student.get("comment", None),
                "created_at": student.get("created_at", datetime.utcnow()),
                "updated_at": student.get("updated_at", datetime.utcnow()),
                "password_hash": student.get("hashed_password", ""),
                "course_ids": await self.get_student_courses(str(student["_id"]))
            }
            logger.info(f"Аутентификация студента {username} успешна")
            return StudentInDB(**student_data)
        except Exception as e:
            logger.error(f"Ошибка при аутентификации студента {username}: {e}")
            return None

    async def get_student_by_username(self, username: str) -> Optional[StudentInDB]:
        """Получает студента по имени пользователя."""
        try:
            student = await students_collection.find_one({"username": username})
            if student:
                # Приводим поля из базы данных к ожидаемому формату модели
                student_data = {
                    "id": str(student["_id"]),
                    "username": student["username"],
                    "first_name": student.get("first_name", ""),
                    "last_name": student.get("last_name", ""),
                    "email": student.get("email", ""),
                    "phone": student.get("phone", ""),
                    "comment": student.get("comment", None),
                    "created_at": student.get("created_at", datetime.utcnow()),
                    "updated_at": student.get("updated_at", datetime.utcnow()),
                    "password_hash": student.get("hashed_password", ""),
                    "course_ids": await self.get_student_courses(str(student["_id"]))
                }
                return StudentInDB(**student_data)
            return None
        except Exception as e:
            logger.error(f"Ошибка при получении студента по имени {username}: {e}")
            return None

    async def get_student_by_id(self, student_id: str) -> Optional[StudentInDB]:
        """Получает студента по ID."""
        try:
            logger.info(f"Получение студента по ID: {student_id}")
            if not ObjectId.is_valid(student_id):
                logger.error(f"Неверный формат ID студента: {student_id}")
                return None
                
            student = await students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                # Приводим поля из базы данных к ожидаемому формату модели
                student_data = {
                    "id": str(student["_id"]),
                    "username": student["username"],
                    "first_name": student.get("first_name", ""),
                    "last_name": student.get("last_name", ""),
                    "email": student.get("email", ""),
                    "phone": student.get("phone", ""),
                    "comment": student.get("comment", None),
                    "created_at": student.get("created_at", datetime.utcnow()),
                    "updated_at": student.get("updated_at", datetime.utcnow()),
                    "password_hash": student.get("hashed_password", ""),
                    "course_ids": await self.get_student_courses(student_id)
                }
                logger.info(f"Студент с ID {student_id} найден")
                return StudentInDB(**student_data)
            
            logger.warning(f"Студент с ID {student_id} не найден")
            return None
        except Exception as e:
            logger.error(f"Ошибка при получении студента по ID {student_id}: {e}")
            return None

    async def get_student_courses(self, student_id: str) -> List[str]:
        """Получает список ID курсов, на которые записан студент"""
        try:
            logger.info(f"Получение курсов для студента с ID: {student_id}")
            enrollments = []
            cursor = enrollments_collection.find({"student_id": student_id})
            async for enrollment in cursor:
                enrollments.append(enrollment["course_id"])
            
            logger.info(f"Найдено {len(enrollments)} курсов для студента {student_id}")
            return enrollments
        except Exception as e:
            logger.error(f"Ошибка при получении курсов студента {student_id}: {e}")
            return []

    async def update_student(self, student_id: str, update_data: StudentUpdate) -> Optional[StudentInDB]:
        """Обновляет данные студента, включая хеширование пароля при его изменении"""
        try:
            update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
            
            # Если пароль обновляется, хешируем его
            if "password" in update_dict:
                password = update_dict.pop("password")
                update_dict["hashed_password"] = self.get_password_hash(password)
            
            if update_dict:
                update_dict["updated_at"] = datetime.utcnow()
                await students_collection.update_one(
                    {"_id": ObjectId(student_id)},
                    {"$set": update_dict}
                )
            
            return await self.get_student_by_id(student_id)
        except Exception as e:
            logger.error(f"Ошибка при обновлении студента {student_id}: {e}")
            return None

# Создаем экземпляр класса для использования
student_crud = StudentCRUD() 