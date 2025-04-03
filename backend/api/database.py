from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import logging
import urllib.parse

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logger = logging.getLogger(__name__)

# Подключение к MongoDB
def get_database():
    try:
        # Данные для подключения к MongoDB
        username = urllib.parse.quote_plus(os.getenv("MONGO_USERNAME", "vitaliipodgornii"))
        password = urllib.parse.quote_plus(os.getenv("MONGO_PASSWORD", "Vitalik199712"))
        MONGODB_URL = os.getenv("MONGODB_URL", f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net")
        
        # Подключаемся к MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.crm_database
        
        logger.info("Connected to MongoDB")
        return db
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise 