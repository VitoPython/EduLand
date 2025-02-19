from motor.motor_asyncio import AsyncIOMotorClient
from models.regular_user import RegularUser, RegularUserInDB
import urllib.parse
from datetime import datetime
from passlib.context import CryptContext
from bson import ObjectId
from typing import Optional, List

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database
regular_users_collection = db.regular_users

class RegularUserCRUD:
    async def create_user(self, user: RegularUser) -> RegularUserInDB:
        # Хешируем пароль
        hashed_password = pwd_context.hash(user.password)
        
        # Создаем словарь с данными пользователя
        user_dict = user.model_dump(exclude={'password'})
        user_dict['hashed_password'] = hashed_password
        
        # Добавляем временные метки
        user_dict['created_at'] = datetime.utcnow()
        user_dict['updated_at'] = datetime.utcnow()
        
        # Сохраняем в базу
        result = await regular_users_collection.insert_one(user_dict)
        
        # Получаем созданного пользователя
        created_user = await regular_users_collection.find_one({"_id": result.inserted_id})
        return RegularUserInDB(id=str(created_user["_id"]), **created_user)

    async def get_users(self, skip: int = 0, limit: int = 10) -> List[RegularUserInDB]:
        users = []
        cursor = regular_users_collection.find().skip(skip).limit(limit)
        async for user in cursor:
            users.append(RegularUserInDB(id=str(user["_id"]), **user))
        return users

    async def get_user_by_email(self, email: str) -> Optional[RegularUserInDB]:
        user = await regular_users_collection.find_one({"email": email})
        if user:
            return RegularUserInDB(id=str(user["_id"]), **user)
        return None

    async def get_user_by_username(self, username: str) -> Optional[RegularUserInDB]:
        user = await regular_users_collection.find_one({"username": username})
        if user:
            return RegularUserInDB(id=str(user["_id"]), **user)
        return None

    async def update_user(self, user_id: str, user_data: dict) -> Optional[RegularUserInDB]:
        try:
            # Проверяем существование пользователя
            existing_user = await self.get_user_by_id(user_id)
            if not existing_user:
                return None

            # Фильтруем None значения из user_data
            update_data = {k: v for k, v in user_data.items() if v is not None}
            
            if not update_data:
                return existing_user

            # Добавляем временную метку обновления
            update_data["updated_at"] = datetime.utcnow()

            # Обновляем пользователя
            result = await regular_users_collection.find_one_and_update(
                {"_id": ObjectId(user_id)},
                {"$set": update_data},
                return_document=True
            )

            if result:
                return RegularUserInDB(id=str(result["_id"]), **result)
            return None
            
        except Exception as e:
            print(f"Error updating user: {e}")
            return None

    async def delete_user(self, user_id: str) -> bool:
        result = await regular_users_collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    async def get_user_by_id(self, user_id: str) -> Optional[RegularUserInDB]:
        try:
            user = await regular_users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                return RegularUserInDB(id=str(user["_id"]), **user)
            return None
        except Exception as e:
            print(f"Error getting user by id: {e}")
            return None

regular_user_crud = RegularUserCRUD()   