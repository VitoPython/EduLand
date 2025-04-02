import urllib.parse
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId

# Конфигурация базы данных
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

async def update_all_grades():
    # Создаем клиент MongoDB
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.crm_database
    
    # Получаем все оценки
    grades = await db.grades.find().to_list(100)
    print(f"Найдено {len(grades)} оценок")
    
    # Обновляем каждую оценку
    for grade in grades:
        grade_id = grade["_id"]
        print(f"Оценка ID: {grade_id}")
        print(f"  До обновления: {grade}")
        
        # Обновляем grade до целого числа, если оно не является целым числом
        current_grade = grade.get("grade")
        if not isinstance(current_grade, int):
            try:
                # Попытка преобразовать в целое число
                new_grade = int(current_grade)
                # Обновляем оценку
                result = await db.grades.update_one(
                    {"_id": grade_id},
                    {"$set": {"grade": new_grade, "updated_at": datetime.utcnow()}}
                )
                print(f"  Оценка обновлена: {new_grade}, результат: {result.modified_count}")
            except (ValueError, TypeError):
                print(f"  Невозможно преобразовать в целое число: {current_grade}")
                # Устанавливаем значение по умолчанию
                result = await db.grades.update_one(
                    {"_id": grade_id},
                    {"$set": {"grade": 5, "updated_at": datetime.utcnow()}}
                )
                print(f"  Оценка установлена по умолчанию: 5, результат: {result.modified_count}")
        else:
            print(f"  Оценка уже в правильном формате: {current_grade}")
        
        # Добавляем обновление, чтобы убедиться, что studentId и assignmentId в строковом формате
        updates = {}
        
        if "student_id" in grade and not isinstance(grade["student_id"], str):
            updates["student_id"] = str(grade["student_id"])
            
        if "assignment_id" in grade and not isinstance(grade["assignment_id"], str):
            updates["assignment_id"] = str(grade["assignment_id"])
            
        if updates:
            updates["updated_at"] = datetime.utcnow()
            result = await db.grades.update_one(
                {"_id": grade_id},
                {"$set": updates}
            )
            print(f"  Дополнительные поля обновлены: {updates}, результат: {result.modified_count}")
    
    client.close()
    print("Обновление оценок завершено")

# Запускаем асинхронную функцию
if __name__ == "__main__":
    asyncio.run(update_all_grades()) 