from motor.motor_asyncio import AsyncIOMotorClient
import urllib.parse
from bson import ObjectId
from fastapi import HTTPException
from typing import List, Optional, Dict, Any
import os
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Подключение к MongoDB
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

try:
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.crm_database  # Используем ту же базу данных, что и основное приложение
    courses_collection = db.courses
    lessons_collection = db.lessons
    assignments_collection = db.assignments
    enrollments_collection = db.enrollments
    
    # Проверка соединения
    client.admin.command('ping')
    logger.info("MongoDB соединение установлено успешно")
except Exception as e:
    logger.error(f"Ошибка подключения к MongoDB: {e}")
    # Создаем пустые заглушки для коллекций, чтобы избежать ошибок импорта
    db = None
    courses_collection = None
    lessons_collection = None
    assignments_collection = None
    enrollments_collection = None

class CourseCRUD:
    async def get_student_courses(self, student_id: str) -> List[Dict[str, Any]]:
        """Получает список курсов, на которые записан студент"""
        try:
            logger.info(f"Получение курсов для студента с ID: {student_id}")
            
            # Найти все записи о регистрации студента на курсы
            course_ids = []
            enrollments_cursor = enrollments_collection.find({"student_id": student_id})
            async for enrollment in enrollments_cursor:
                course_ids.append(ObjectId(enrollment["course_id"]))
            
            logger.info(f"Найдено {len(course_ids)} записей о регистрации")
            
            # Если нет регистраций, вернуть пустой список
            if not course_ids:
                return []
            
            # Получить сами курсы
            courses = []
            courses_cursor = courses_collection.find({"_id": {"$in": course_ids}})
            async for course in courses_cursor:
                # Подсчитываем количество уроков для курса
                lessons_count = await lessons_collection.count_documents({"course_id": course["_id"]})
                
                # Поиск завершенных уроков
                # Здесь можно будет добавить логику подсчета завершенных уроков, 
                # когда будет реализовано отслеживание прогресса
                completed_lessons_count = 0
                
                course_data = {
                    "id": str(course["_id"]),
                    "title": course.get("title", ""),
                    "description": course.get("description", ""),
                    "lessons_count": lessons_count,
                    "completed_lessons_count": completed_lessons_count
                }
                courses.append(course_data)
            
            logger.info(f"Получено {len(courses)} курсов")
            return courses
        except Exception as e:
            logger.error(f"Ошибка при получении курсов студента: {e}")
            return []
    
    async def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о курсе по его ID"""
        try:
            if not ObjectId.is_valid(course_id):
                raise HTTPException(status_code=400, detail="Неверный формат ID курса")
            
            # Получаем курс
            course = await courses_collection.find_one({"_id": ObjectId(course_id)})
            if not course:
                return None

            logger.info(f"Получаем уроки для курса {course_id}")
            
            # Получаем уроки для этого курса из коллекции lessons
            lessons = []
            async for lesson in lessons_collection.find({"course_id": ObjectId(course_id)}):
                logger.info(f"Найден урок: {lesson['title']}")
                lesson_data = {
                    "_id": str(lesson["_id"]),
                    "title": lesson.get("title", ""),
                    "description": lesson.get("description", ""),
                    "content": lesson.get("content", ""),
                    "order": lesson.get("order", 0),
                    "course_id": str(lesson["course_id"]),
                    "created_at": lesson.get("created_at", ""),
                    "updated_at": lesson.get("updated_at", ""),
                    "id": str(lesson["_id"]),
                    "assignments": []  # Пустой массив заданий, они будут загружаться отдельно
                }
                lessons.append(lesson_data)

            logger.info(f"Всего найдено {len(lessons)} уроков для курса {course_id}")

            # Возвращаем курс вместе с уроками
            return {
                "_id": str(course["_id"]),
                "title": course.get("title", ""),
                "description": course.get("description", ""),
                "duration": course.get("duration", 0),
                "price": course.get("price", 0),
                "created_at": course.get("created_at", ""),
                "updated_at": course.get("updated_at", ""),
                "id": str(course["_id"]),
                "lessons": lessons  # Используем только уроки из коллекции lessons
            }
        except Exception as e:
            logger.error(f"Ошибка при получении курса по ID {course_id}: {e}")
            return None
    
    async def get_course_lessons(self, course_id: str) -> List[Dict[str, Any]]:
        """Получает список уроков конкретного курса"""
        try:
            if not ObjectId.is_valid(course_id):
                raise HTTPException(status_code=400, detail="Неверный формат ID курса")
            
            logger.info(f"Получение уроков для курса с ID: {course_id}")
            lessons = []
            
            # Ищем уроки в коллекции lessons
            cursor = lessons_collection.find({"course_id": ObjectId(course_id)})
            async for lesson in cursor:
                lesson_data = {
                    "id": str(lesson["_id"]),
                    "title": lesson.get("title", ""),
                    "description": lesson.get("description", ""),
                    "course_id": str(lesson["course_id"])
                }
                lessons.append(lesson_data)
            
            logger.info(f"Найдено {len(lessons)} уроков для курса {course_id}")
            return lessons
            
        except Exception as e:
            logger.error(f"Ошибка при получении уроков курса {course_id}: {e}")
            return []
    
    async def get_lesson_by_id(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию об уроке по его ID"""
        try:
            if not ObjectId.is_valid(lesson_id):
                raise HTTPException(status_code=400, detail="Неверный формат ID урока")
            
            lesson = await lessons_collection.find_one({"_id": ObjectId(lesson_id)})
            if not lesson:
                return None
            
            lesson_data = {
                "id": str(lesson["_id"]),
                "title": lesson.get("title", ""),
                "description": lesson.get("description", ""),
                "content": lesson.get("content", ""),
                "order": lesson.get("order", 0),
                "course_id": str(lesson["course_id"]),
            }
            return lesson_data
        except Exception as e:
            logger.error(f"Ошибка при получении урока по ID {lesson_id}: {e}")
            return None
    
    async def get_lesson_assignments(self, lesson_id: str) -> List[Dict[str, Any]]:
        """Получает список заданий для конкретного урока"""
        try:
            if not ObjectId.is_valid(lesson_id):
                raise HTTPException(status_code=400, detail="Неверный формат ID урока")
            
            logger.info(f"Получение заданий для урока с ID: {lesson_id}")
            assignments = []
            
            # Всегда используем ObjectId для поиска
            cursor = assignments_collection.find({"lesson_id": ObjectId(lesson_id)})
            logger.info(f"Ищем задания с lesson_id как ObjectId")
            
            async for assignment in cursor:
                logger.info(f"Найдено задание: {assignment}")
                assignment_data = {
                    "id": str(assignment["_id"]),
                    "_id": str(assignment["_id"]),  # Добавляем _id для фронтенда
                    "title": assignment.get("title", ""),
                    "description": assignment.get("description", ""),
                    "code_editor": assignment.get("code_editor", ""),
                    "lesson_id": str(assignment.get("lesson_id", "")),
                    "created_at": assignment.get("created_at", ""),
                    "updated_at": assignment.get("updated_at", "")
                }
                assignments.append(assignment_data)
            
            logger.info(f"Всего найдено {len(assignments)} заданий для урока {lesson_id}")
            return assignments
        except Exception as e:
            logger.error(f"Ошибка при получении заданий урока {lesson_id}: {e}")
            return []
    
    async def get_assignment_by_id(self, assignment_id: str) -> Optional[Dict[str, Any]]:
        """Получает информацию о задании по его ID"""
        try:
            if not ObjectId.is_valid(assignment_id):
                raise HTTPException(status_code=400, detail="Неверный формат ID задания")
            
            assignment = await assignments_collection.find_one({"_id": ObjectId(assignment_id)})
            if not assignment:
                return None
            
            assignment_data = {
                "id": str(assignment["_id"]),
                "_id": str(assignment["_id"]),
                "title": assignment.get("title", ""),
                "description": assignment.get("description", ""),
                "code_editor": assignment.get("code_editor", ""),
                "lesson_id": str(assignment.get("lesson_id", "")),
                "created_at": assignment.get("created_at", ""),
                "updated_at": assignment.get("updated_at", "")
            }
            
            logger.info(f"Получено задание: {assignment_data}")
            return assignment_data
        except Exception as e:
            logger.error(f"Ошибка при получении задания по ID {assignment_id}: {e}")
            return None

# Создаем экземпляр класса для использования
course_crud = CourseCRUD() 