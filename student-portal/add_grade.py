import urllib.parse
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Конфигурация базы данных
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

# ID студента и задания из веб-интерфейса
STUDENT_ID = "67d4063e1f3d08c137402d52"  
ASSIGNMENT_ID = "67e41e292ae5c11f88a645b7"  # Правильный ID задания из базы данных

async def add_grade():
    # Создаем клиент MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.crm_database
    
    # Данные для оценки
    now = datetime.utcnow()
    grade_data = {
        "student_id": STUDENT_ID,
        "assignment_id": ASSIGNMENT_ID,
        "grade": 3,  # Оценка 3, как в существующей записи
        "created_at": now,
        "updated_at": now
    }
    
    # Проверяем, существует ли уже оценка для этого студента и задания
    existing_grade = await db.grades.find_one({
        "student_id": STUDENT_ID,
        "assignment_id": ASSIGNMENT_ID
    })
    
    if existing_grade:
        print(f"Оценка уже существует: {existing_grade}")
        # Обновляем существующую оценку
        result = await db.grades.update_one(
            {"_id": existing_grade["_id"]},
            {"$set": {"grade": grade_data["grade"], "updated_at": now}}
        )
        print(f"Оценка обновлена: {result.modified_count} документ(ов) изменено")
    else:
        # Создаем новую оценку
        result = await db.grades.insert_one(grade_data)
        print(f"Новая оценка создана с ID: {result.inserted_id}")
    
    client.close()

# Запускаем асинхронную функцию
if __name__ == "__main__":
    asyncio.run(add_grade()) 