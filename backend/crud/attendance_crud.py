from motor.motor_asyncio import AsyncIOMotorClient
from models.attendance import AttendanceRecord, AttendanceStatus
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import urllib.parse

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database
attendance_collection = db.attendance

class AttendanceCRUD:
    async def record_attendance(self, attendance: AttendanceRecord) -> AttendanceRecord:
        attendance_dict = attendance.model_dump()
        attendance_dict['created_at'] = datetime.utcnow()
        
        # Проверяем существующую запись
        existing = await attendance_collection.find_one({
            "student_id": attendance.student_id,
            "group_id": attendance.group_id,
            "lesson_number": attendance.lesson_number
        })
        
        if existing:
            # Обновляем существующую запись
            await attendance_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "status": attendance.status,
                    "date": attendance.date,
                    "comment": attendance.comment
                }}
            )
            return attendance
        
        # Создаем новую запись
        result = await attendance_collection.insert_one(attendance_dict)
        return attendance

    async def get_student_attendance(self, student_id: str, group_id: str) -> List[AttendanceRecord]:
        cursor = attendance_collection.find({
            "student_id": student_id,
            "group_id": group_id
        })
        records = []
        async for record in cursor:
            record["id"] = str(record["_id"])
            records.append(AttendanceRecord(**record))
        return records

    async def get_group_attendance(self, group_id: str) -> List[dict]:
        pipeline = [
            {"$match": {"group_id": group_id}},
            {"$group": {
                "_id": "$student_id",
                "attendance": {"$push": {
                    "lesson_number": "$lesson_number",
                    "status": "$status",
                    "date": "$date"
                }}
            }}
        ]
        
        results = []
        async for doc in attendance_collection.aggregate(pipeline):
            results.append(doc)
        return results

attendance_crud = AttendanceCRUD() 