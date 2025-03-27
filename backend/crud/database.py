from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import urllib.parse
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection settings
username = urllib.parse.quote_plus("vitaliipodgornii")
password = urllib.parse.quote_plus("Vitalik199712")
MONGO_URI = f"mongodb+srv://{username}:{password}@cluster0.jcrsrzo.mongodb.net/"

client = AsyncIOMotorClient(MONGO_URI)
db = client.crm_database

def get_database():
    """
    Возвращает экземпляр базы данных.
    """
    return db 