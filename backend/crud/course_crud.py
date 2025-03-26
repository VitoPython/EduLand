from motor.motor_asyncio import AsyncIOMotorClient
from models.course import Course, Lesson, Assignment
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import urllib.parse

# Инициализация MongoDB клиента
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database

courses_collection = db.courses

class CourseCRUD:
    def __init__(self, client: AsyncIOMotorClient, database_name: str):
        self.db = client[database_name]
        self.courses = self.db.courses
        self.lessons = self.db.lessons
        self.assignments = self.db.assignments
        
        # Добавим проверку подключения при инициализации
        self._check_connection()

    async def _check_connection(self):
        try:
            # Проверяем подключение к базе
            await self.db.command("ping")
            
            # Получаем список всех коллекций
            await self.db.list_collection_names()
            
            # Проверяем каждую коллекцию
            await self.assignments.count_documents({})
            await self.lessons.count_documents({})
            await self.courses.count_documents({})
            
        except Exception as e:
            raise Exception(f"Failed to connect to MongoDB: {e}")

    # Course operations
    async def create_course(self, course: Course) -> Course:
        course_dict = course.model_dump()
        course_dict['created_at'] = datetime.utcnow()
        course_dict['updated_at'] = datetime.utcnow()
        
        result = await self.courses.insert_one(course_dict)
        created_course = await self.courses.find_one({"_id": result.inserted_id})
        
        if created_course:
            created_course["id"] = str(created_course["_id"])
            return Course(**created_course)
        return None

    async def get_courses(self) -> List[Course]:
        courses = []
        cursor = self.courses.find()
        async for course in cursor:
            course["id"] = str(course["_id"])
            courses.append(Course(**course))
        return courses

    async def get_course(self, course_id: str) -> Optional[Course]:
        try:
            course = await self.courses.find_one({"_id": ObjectId(course_id)})
            if course:
                # Получаем все уроки для этого курса
                lessons = await self.lessons.find({"course_id": ObjectId(course_id)}).to_list(None)
                
                # Добавляем уроки к курсу
                course["lessons"] = lessons
                course["id"] = str(course["_id"])
                
                # Преобразуем _id уроков в строки
                for lesson in course["lessons"]:
                    lesson["id"] = str(lesson["_id"])
                
                return Course(**course)
            return None
        except Exception as e:
            return None

    async def update_course(self, course_id: str, course_data: dict) -> Optional[Course]:
        course_data["updated_at"] = datetime.utcnow()
        
        result = await self.courses.find_one_and_update(
            {"_id": ObjectId(course_id)},
            {"$set": course_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result["_id"])
            return Course(**result)
        return None

    async def delete_course(self, course_id: str) -> bool:
        result = await self.courses.delete_one({"_id": ObjectId(course_id)})
        return result.deleted_count > 0

    # Lesson operations
    async def get_course_lessons(self, course_id: str) -> List[Lesson]:
        try:
            cursor = self.lessons.find({"course_id": ObjectId(course_id)})
            lessons = await cursor.to_list(length=None)
            
            # Преобразуем ObjectId в строки для каждого урока
            for lesson in lessons:
                lesson["_id"] = str(lesson["_id"])
                lesson["course_id"] = str(lesson["course_id"])
            
            return lessons
        except Exception as e:
            return []

    async def create_lesson(self, course_id: str, lesson_data: dict) -> Optional[Lesson]:
        try:
            # Создаем словарь с данными урока
            lesson_dict = {
                "title": lesson_data["title"],
                "course_id": ObjectId(course_id),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Добавляем урок в базу данных
            result = await self.lessons.insert_one(lesson_dict)
            
            # Получаем созданный урок
            created_lesson = await self.lessons.find_one({"_id": result.inserted_id})
            
            if created_lesson:
                # Преобразуем ObjectId в строки
                created_lesson["id"] = str(created_lesson["_id"])
                created_lesson["course_id"] = str(created_lesson["course_id"])
                
                # Возвращаем урок
                return Lesson(**created_lesson)
            return None
        except Exception as e:
            return None

    async def update_lesson(self, lesson_id: str, lesson_data: dict) -> Optional[Lesson]:
        try:
            # Получаем существующий урок
            existing_lesson = await self.lessons.find_one({"_id": ObjectId(lesson_id)})
            if not existing_lesson:
                return None

            # Обновляем только предоставленные поля
            update_data = {
                "title": lesson_data.get("title", existing_lesson["title"]),
                "updated_at": datetime.utcnow()
            }
            
            result = await self.lessons.find_one_and_update(
                {"_id": ObjectId(lesson_id)},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                # Преобразуем ObjectId в строки
                result["id"] = str(result["_id"])
                result["course_id"] = str(result["course_id"])
                return Lesson(**result)
            return None
        except Exception as e:
            return None

    async def delete_lesson(self, lesson_id: str) -> bool:
        try:
            # Проверяем, существует ли урок
            lesson = await self.lessons.find_one({"_id": ObjectId(lesson_id)})
            if not lesson:
                return False

            # Удаляем урок
            result = await self.lessons.delete_one({"_id": ObjectId(lesson_id)})
            return result.deleted_count > 0
        except Exception as e:
            return False

    # Assignment operations
    async def get_lesson_assignments(self, lesson_id: str) -> List[dict]:
        try:
            if not ObjectId.is_valid(lesson_id):
                return []
            
            assignments = await self.assignments.find(
                {"lesson_id": ObjectId(lesson_id)}
            ).to_list(None)
            
            return [{
                "id": str(assignment["_id"]),
                "title": assignment["title"],
                "description": assignment.get("description", ""),
                "code_editor": assignment.get("code_editor", ""),
                "lesson_id": str(assignment["lesson_id"]),
                "created_at": assignment.get("created_at"),
                "updated_at": assignment.get("updated_at")
            } for assignment in assignments]
        except Exception as e:
            return []

    async def create_assignment(self, lesson_id: str, assignment_data: dict) -> Optional[dict]:
        try:
            # Проверяем существование урока
            lesson = await self.lessons.find_one({"_id": ObjectId(lesson_id)})
            if not lesson:
                return None

            # Формируем документ для вставки
            assignment_dict = {
                "title": assignment_data["title"],
                "description": assignment_data.get("description", ""),
                "code_editor": assignment_data.get("code_editor", ""),
                "lesson_id": ObjectId(lesson_id),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Создаем новый документ
            result = await self.assignments.insert_one(assignment_dict)
            
            # Получаем созданный документ
            created_assignment = await self.assignments.find_one({"_id": result.inserted_id})
            
            if created_assignment:
                # Преобразуем для ответа
                return {
                    "id": str(created_assignment["_id"]),
                    "title": created_assignment["title"],
                    "description": created_assignment.get("description", ""),
                    "code_editor": created_assignment.get("code_editor", ""),
                    "lesson_id": str(created_assignment["lesson_id"]),
                    "created_at": created_assignment["created_at"],
                    "updated_at": created_assignment["updated_at"]
                }
            return None
        except Exception as e:
            raise

    async def update_assignment(self, assignment_id: str, assignment_data: dict) -> Optional[dict]:
        try:
            # Проверяем существование задания
            existing = await self.assignments.find_one({"_id": ObjectId(assignment_id)})
            if not existing:
                return None

            # Формируем данные для обновления
            update_data = {
                "title": assignment_data.get("title", existing["title"]),
                "description": assignment_data.get("description", existing.get("description", "")),
                "code_editor": assignment_data.get("code_editor", existing.get("code_editor", "")),
                "updated_at": datetime.utcnow()
            }

            # Обновляем документ
            result = await self.assignments.find_one_and_update(
                {"_id": ObjectId(assignment_id)},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                # Преобразуем для ответа
                return {
                    "id": str(result["_id"]),
                    "title": result["title"],
                    "description": result.get("description", ""),
                    "code_editor": result.get("code_editor", ""),
                    "lesson_id": str(result["lesson_id"]),
                    "created_at": result.get("created_at"),
                    "updated_at": result["updated_at"]
                }
            return None
        except Exception as e:
            raise

    async def delete_assignment(self, assignment_id: str) -> bool:
        try:
            result = await self.assignments.delete_one({"_id": ObjectId(assignment_id)})
            return result.deleted_count > 0
        except Exception as e:
            return False

    async def get_assignment(self, assignment_id: str) -> Optional[dict]:
        try:
            assignment = await self.assignments.find_one({"_id": ObjectId(assignment_id)})
            
            if assignment:
                return {
                    "id": str(assignment["_id"]),
                    "title": assignment.get("title", ""),
                    "description": assignment.get("description", ""),
                    "code_editor": assignment.get("code_editor", ""),
                    "lesson_id": str(assignment["lesson_id"]),
                    "created_at": assignment.get("created_at"),
                    "updated_at": assignment.get("updated_at")
                }
            return None
        except Exception as e:
            return None

    async def get_student(self, student_id: str) -> Optional[dict]:
        try:
            student = await self.students.find_one({"_id": ObjectId(student_id)})
            if not student:
                return None

            # Получаем все enrollments для студента
            enrollments = await self.enrollments.find(
                {"student_id": ObjectId(student_id)}
            ).to_list(None)

            # Добавляем enrollments к данным студента
            student_data = {
                "id": str(student["_id"]),
                "first_name": student.get("first_name", ""),
                "last_name": student.get("last_name", ""),
                "email": student.get("email", ""),
                "created_at": student.get("created_at"),
                "enrollments": [{
                    "id": str(enrollment["_id"]),
                    "course_id": str(enrollment["course_id"]),
                    "status": enrollment.get("status", "active"),
                    "progress": enrollment.get("progress", 0),
                    "start_date": enrollment.get("created_at")
                } for enrollment in enrollments]
            }

            return student_data
        except Exception as e:
            return None

# Создаем экземпляр класса с инициализированным клиентом
course_crud = CourseCRUD(client, "crm_database") 