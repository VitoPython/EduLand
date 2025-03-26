from motor.motor_asyncio import AsyncIOMotorClient
from models.group import Group, GroupStudent, GroupUpdate
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import urllib.parse

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database
groups_collection = db.groups

class GroupCRUD:
    async def create_group(self, group: Group) -> Group:
        group_dict = group.model_dump()
        group_dict['created_at'] = datetime.utcnow()
        group_dict['updated_at'] = datetime.utcnow()
        
        result = await groups_collection.insert_one(group_dict)
        created_group = await groups_collection.find_one({"_id": result.inserted_id})
        created_group["id"] = str(created_group["_id"])
        del created_group["_id"]
        return Group(**created_group)

    async def get_groups(self, skip: int = 0, limit: int = 10) -> List[Group]:
        groups = []
        cursor = groups_collection.find().skip(skip).limit(limit)
        async for group in cursor:
            group["_id"] = str(group["_id"])  # Преобразуем ObjectId в строку
            groups.append(Group(**group))
        return groups

    async def get_group(self, group_id: str) -> Optional[Group]:
        try:
            print(f"Fetching group with ID: {group_id}")
            group = await groups_collection.find_one({"_id": ObjectId(group_id)})
            if group:
                group["_id"] = str(group["_id"])  # Преобразуем ObjectId в строку
                return Group(**group)
            print("Group not found")
            return None
        except Exception as e:
            print(f"Error getting group: {e}")
            return None

    async def update_group(self, group_id: str, group_data: GroupUpdate) -> Optional[Group]:
        update_data = group_data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()

        if not update_data:
            return await self.get_group(group_id)

        result = await groups_collection.find_one_and_update(
            {"_id": ObjectId(group_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            result["id"] = str(result["_id"])
            return Group(**result)
        return None

    async def delete_group(self, group_id: str) -> bool:
        result = await groups_collection.delete_one({"_id": ObjectId(group_id)})
        return result.deleted_count > 0

    # Методы для работы со студентами в группе
    async def add_student_to_group(self, group_id: str, student: GroupStudent) -> Optional[Group]:
        try:
            # Проверяем существование группы
            group = await self.get_group(group_id)
            if not group:
                return None

            # Проверяем, не превышен ли лимит студентов
            if len(group.students) >= group.max_students:
                raise ValueError("Maximum number of students reached")

            # Проверяем, нет ли уже такого студента
            if any(s.student_id == student.student_id for s in group.students):
                raise ValueError("Student already in group")

            # Добавляем студента и обновляем счетчики
            result = await groups_collection.find_one_and_update(
                {"_id": ObjectId(group_id)},
                {
                    "$push": {"students": student.model_dump()},
                    "$inc": {"students_count": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                },
                return_document=True
            )

            if result:
                result["id"] = str(result["_id"])
                return Group(**result)
            return None
        except Exception as e:
            print(f"Error adding student to group: {e}")
            raise

    async def remove_student_from_group(self, group_id: str, student_id: str) -> bool:
        try:
            result = await groups_collection.update_one(
                {"_id": ObjectId(group_id)},
                {
                    "$pull": {"students": {"student_id": student_id}},
                    "$inc": {"students_count": -1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error removing student from group: {e}")
            return False

    async def update_student_progress(
        self, 
        group_id: str, 
        student_id: str, 
        progress: dict
    ) -> Optional[Group]:
        try:
            result = await groups_collection.find_one_and_update(
                {
                    "_id": ObjectId(group_id),
                    "students.student_id": student_id
                },
                {
                    "$set": {
                        "students.$.progress": progress,
                        "updated_at": datetime.utcnow()
                    }
                },
                return_document=True
            )
            
            if result:
                result["id"] = str(result["_id"])
                return Group(**result)
            return None
        except Exception as e:
            print(f"Error updating student progress: {e}")
            return None

    async def get_group_students(self, group_id: str) -> List[GroupStudent]:
        try:
            group = await self.get_group(group_id)
            if group:
                return group.students
            return []
        except Exception as e:
            print(f"Error getting group students: {e}")
            return []

group_crud = GroupCRUD() 