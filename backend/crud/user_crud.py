from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User, UserUpdate
import urllib.parse
from bson import ObjectId 
from fastapi import HTTPException
from datetime import datetime
from typing import Optional, List
import os

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI) 
db = client.crm_database
users_collection = db.users

class UserCRUD:
    async def create_user(self, user: User) -> User:
        user_dict = user.model_dump()
        user_dict['created_at'] = datetime.utcnow()
        user_dict['updated_at'] = datetime.utcnow()
        
        await users_collection.insert_one(user_dict)
        return user

    async def get_users(self, skip: int = 0, limit: int = 10) -> List[User]:
        users = []
        cursor = users_collection.find().skip(skip).limit(limit)
        async for user in cursor:
            users.append(User(**user))
        return users

    async def get_user_by_clerk_id(self, clerk_id: str) -> Optional[User]:
        user = await users_collection.find_one({"clerk_id": clerk_id})
        if user:
            return User(**user)
        return None

    async def update_user(self, clerk_id: str, user_data: UserUpdate) -> Optional[User]:
        try:
            # Проверяем существование пользователя
            existing_user = await self.get_user_by_clerk_id(clerk_id)
            if not existing_user:
                return None

            # Фильтруем None значения из user_data
            update_data = {k: v for k, v in user_data.model_dump(exclude_unset=True).items() if v is not None}
            
            if not update_data:
                return existing_user

            # Добавляем временную метку обновления
            update_data["updated_at"] = datetime.utcnow()

            # Обновляем пользователя
            result = await users_collection.find_one_and_update(
                {"clerk_id": clerk_id},
                {"$set": update_data},
                return_document=True
            )

            if result:
                return User(**result)
            return None
            
        except Exception as e:
            print(f"Error updating user: {e}")
            return None

    async def delete_user(self, clerk_id: str) -> bool:
        result = await users_collection.delete_one({"clerk_id": clerk_id})
        return result.deleted_count > 0

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            if not ObjectId.is_valid(user_id):
                raise HTTPException(status_code=400, detail="Invalid user_id")
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
            return User(**user) if user else None
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

user_crud = UserCRUD()

async def create_user(user: User):
    user_dict = user.dict() 
    result = await users_collection.insert_one(user_dict)
    return User(id=str(result.inserted_id), **user_dict)

async def get_users():
    users = []
    async for user in users_collection.find():
        users.append(User(id=str(user["_id"]), **user)) 
    return users

async def update_user(user_id: str, user: User):

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user_id")
    object_id = ObjectId(user_id)

    # Обновление пользователя
    result = await users_collection.update_one({"_id": object_id}, {"$set": user.dict(exclude_unset=True)})

    # Проверка успешности обновления
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes made")

    return await get_user(user_id)

async def delete_user(user_id: ObjectId):
    # Удаляем пользователя из коллекции
    result = await users_collection.delete_one({"_id": user_id})
    return result 

# Добавим функцию get_user, если она нужна
async def get_user(user_id: str):
    try:
        # Преобразуем user_id в ObjectId
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            return User(id=str(user["_id"]), **user)
        return None
    except Exception as e:
        print(f"Ошибка при поиске пользователя: {e}")
        return None