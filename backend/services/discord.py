import requests
import os
from models.user import User

async def notify_discord(user: User):
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        return
        
    message = {
        "embeds": [{
            "title": "Новый пользователь зарегистрирован!",
            "fields": [
                {"name": "Имя", "value": user.first_name, "inline": True},
                {"name": "Фамилия", "value": user.last_name, "inline": True},
                {"name": "Email", "value": str(user.email), "inline": True},
                {"name": "Телефон", "value": user.phone, "inline": True},
                {"name": "ID", "value": user.clerk_id, "inline": True},
                {"name": "Комментарий", "value": user.comment or "Нет", "inline": True}
            ],
            "color": 5814783
        }]
    }
    
    try:
        requests.post(webhook_url, json=message)
    except Exception:
        pass  # Игнорируем ошибки уведомлений 