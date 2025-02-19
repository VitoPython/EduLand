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

class CourseCRUD:
    def __init__(self, client: AsyncIOMotorClient, database_name: str):
        self.db = client[database_name]
        self.courses = self.db.courses
        self.lessons = self.db.lessons
        self.assignments = self.db.assignments

    # Course operations
    async def create_course(self, course: Course) -> Course:
        course_dict = course.model_dump()
        course_dict['created_at'] = datetime.utcnow()
        course_dict['updated_at'] = datetime.utcnow()
        result = await self.courses.insert_one(course_dict)
        created_course = await self.courses.find_one({"_id": result.inserted_id})
        
        # Создаем копию словаря и добавляем id
        course_data = dict(created_course)
        course_data['id'] = str(course_data.pop('_id'))  # Заменяем _id на id
        
        return Course(**course_data)

    async def get_courses(self) -> List[Course]:
        courses = []
        cursor = self.courses.find()
        async for course in cursor:
            # Создаем копию словаря и добавляем id
            course_data = dict(course)
            course_data['id'] = str(course_data.pop('_id'))
            courses.append(Course(**course_data))
        return courses

    async def get_course(self, course_id: str) -> Optional[Course]:
        try:
            if not ObjectId.is_valid(course_id):
                return None
            
            course = await self.courses.find_one({"_id": ObjectId(course_id)})
            if course:
                course_data = dict(course)
                course_data['id'] = str(course_data.pop('_id'))
                
                # Обработка уроков
                if 'lessons' in course_data:
                    course_data['lessons'] = [
                        {
                            **lesson,
                            'id': str(lesson.get('_id', '')),
                            'assignments': [
                                {**assignment, 'id': str(assignment.get('_id', ''))}
                                for assignment in lesson.get('assignments', [])
                            ] if 'assignments' in lesson else []
                        }
                        for lesson in course_data.get('lessons', [])
                    ]
                
                return Course(**course_data)
            return None
        except (InvalidId, TypeError):
            return None

    async def update_course(self, course_id: str, course_data: dict) -> Optional[Course]:
        course_data['updated_at'] = datetime.utcnow()
        result = await self.courses.find_one_and_update(
            {"_id": ObjectId(course_id)},
            {"$set": course_data},
            return_document=True
        )
        if result:
            # Создаем копию словаря и добавляем id
            updated_data = dict(result)
            updated_data['id'] = str(updated_data.pop('_id'))
            return Course(**updated_data)
        return None

    async def delete_course(self, course_id: str) -> bool:
        # Удаляем все уроки и задания курса
        course = await self.get_course(course_id)
        if course:
            for lesson in course.lessons:
                await self.delete_lesson(str(lesson.id))
        
        result = await self.courses.delete_one({"_id": ObjectId(course_id)})
        return result.deleted_count > 0

    # Lesson operations
    async def create_lesson(self, course_id: str, lesson: Lesson) -> Optional[Lesson]:
        lesson_dict = lesson.model_dump()
        lesson_dict['course_id'] = ObjectId(course_id)
        lesson_dict['created_at'] = datetime.utcnow()
        lesson_dict['updated_at'] = datetime.utcnow()
        
        result = await self.lessons.insert_one(lesson_dict)
        created_lesson = await self.lessons.find_one({"_id": result.inserted_id})
        
        if created_lesson:
            # Обновляем список уроков в курсе
            await self.courses.update_one(
                {"_id": ObjectId(course_id)},
                {"$push": {"lessons": created_lesson}}
            )
            created_lesson['id'] = str(created_lesson['_id'])
            return Lesson(**created_lesson)
        return None

    async def get_lesson(self, lesson_id: str) -> Optional[Lesson]:
        try:
            if not lesson_id or not ObjectId.is_valid(lesson_id):
                return None
            
            lesson = await self.lessons.find_one({"_id": ObjectId(lesson_id)})
            if lesson:
                # Убедимся, что у урока есть id
                lesson_data = dict(lesson)
                lesson_data['id'] = str(lesson_data.pop('_id'))
                # Убедимся, что у всех заданий есть id
                if 'assignments' in lesson_data:
                    lesson_data['assignments'] = [
                        {**assignment, 'id': str(assignment.get('_id', ''))}
                        for assignment in lesson_data['assignments']
                    ]
                return Lesson(**lesson_data)
            return None
        except (InvalidId, TypeError):
            return None

    async def update_lesson(self, lesson_id: str, lesson_data: dict) -> Optional[Lesson]:
        lesson_data['updated_at'] = datetime.utcnow()
        result = await self.lessons.find_one_and_update(
            {"_id": ObjectId(lesson_id)},
            {"$set": lesson_data},
            return_document=True
        )
        if result:
            result['id'] = str(result['_id'])
            return Lesson(**result)
        return None

    async def delete_lesson(self, lesson_id: str) -> bool:
        lesson = await self.get_lesson(lesson_id)
        if lesson:
            # Удаляем все задания урока
            for assignment in lesson.assignments:
                await self.delete_assignment(str(assignment.id))
            
            # Удаляем урок из курса
            await self.courses.update_one(
                {"lessons._id": ObjectId(lesson_id)},
                {"$pull": {"lessons": {"_id": ObjectId(lesson_id)}}}
            )
        
        result = await self.lessons.delete_one({"_id": ObjectId(lesson_id)})
        return result.deleted_count > 0

    # Assignment operations
    async def create_assignment(self, lesson_id: str, assignment: Assignment) -> Optional[Assignment]:
        try:
            if not lesson_id or not ObjectId.is_valid(lesson_id):
                return None
            
            assignment_dict = assignment.model_dump()
            assignment_dict['lesson_id'] = ObjectId(lesson_id)
            assignment_dict['created_at'] = datetime.utcnow()
            assignment_dict['updated_at'] = datetime.utcnow()
            
            result = await self.assignments.insert_one(assignment_dict)
            created_assignment = await self.assignments.find_one({"_id": result.inserted_id})
            
            if created_assignment:
                # Обновляем список заданий в уроке
                await self.lessons.update_one(
                    {"_id": ObjectId(lesson_id)},
                    {"$push": {"assignments": created_assignment}}
                )
                created_assignment['id'] = str(created_assignment['_id'])
                return Assignment(**created_assignment)
            return None
        except (InvalidId, TypeError):
            return None

    async def get_assignment(self, assignment_id: str) -> Optional[Assignment]:
        try:
            if not ObjectId.is_valid(assignment_id):
                return None
            
            assignment = await self.assignments.find_one({"_id": ObjectId(assignment_id)})
            if assignment:
                assignment_data = dict(assignment)
                assignment_data['id'] = str(assignment_data.pop('_id'))
                return Assignment(**assignment_data)
            return None
        except (InvalidId, TypeError):
            return None

    async def update_assignment(self, assignment_id: str, assignment_data: dict) -> Optional[Assignment]:
        assignment_data["updated_at"] = datetime.utcnow()
        
        # Обновляем документ в коллекции assignments
        result = await self.assignments.find_one_and_update(
            {"_id": ObjectId(assignment_id)},
            {"$set": assignment_data},
            return_document=True
        )
        
        if result:
            # Получаем lesson_id из assignment
            assignment = await self.assignments.find_one({"_id": ObjectId(assignment_id)})
            if assignment:
                # Обновляем assignment в lessons
                await self.lessons.update_one(
                    {"assignments._id": ObjectId(assignment_id)},
                    {"$set": {"assignments.$": result}}
                )
            
            result['id'] = str(result['_id'])
            return Assignment(**result)
        
        return None

    async def delete_assignment(self, assignment_id: str) -> bool:
        # Удаляем задание из урока
        await self.lessons.update_one(
            {"assignments._id": ObjectId(assignment_id)},
            {"$pull": {"assignments": {"_id": ObjectId(assignment_id)}}}
        )
        
        result = await self.assignments.delete_one({"_id": ObjectId(assignment_id)})
        return result.deleted_count > 0

# Создаем экземпляр класса с инициализированным клиентом
course_crud = CourseCRUD(client, "crm_database") 