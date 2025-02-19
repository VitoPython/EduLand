from motor.motor_asyncio import AsyncIOMotorClient
import urllib.parse
from datetime import datetime

username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"
client = AsyncIOMotorClient(MONGO_URI) 
db = client.crm_database
users_collection = db.users

async def migrate_users():
    # Обновляем все записи без clerk_id
    await users_collection.update_many(
        {"clerk_id": {"$exists": False}},
        {
            "$set": {
                "clerk_id": None,
                "updated_at": datetime.utcnow()
            }
        }
    )

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_users()) 