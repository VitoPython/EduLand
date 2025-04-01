import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

# Конфигурация базы данных
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

# Создаем клиент MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database

async def get_student_assignment_submit_collection() -> AsyncIOMotorCollection:
    """
    Возвращает коллекцию для сдачи заданий студентами
    """
    return db.student_assignment_submit 

async def get_assignments_collection():
    """
    Получение коллекции assignments из MongoDB.
    """
    return db.assignments 

async def get_student_code_submit_collection():
    """
    Получение коллекции student_assignment_code_submit из MongoDB.
    """
    return db.student_assignment_code_submit 