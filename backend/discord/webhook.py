import httpx

async def notify_discord(user):
    webhook_url = "https://discord.com/api/webhooks/1333742158385254411/fjQxs06JMejYrLEnrtLR4vVAoJNbTPNSXKzulUEOiyFOFTnFDa-Ti9Y9ai_hHJLXsuS0"
    message = {
        "content": "Новый пользователь зарегистрирован!",
        "embeds": [
            {
                "title": "Данные пользователя",
                "fields": [
                    {"name": "Имя", "value": user.first_name, "inline": True},
                    {"name": "Фамилия", "value": user.last_name, "inline": True},
                    {"name": "Email", "value": user.email, "inline": True},
                    {"name": "Телефон", "value": user.phone, "inline": True},
                ],
                "color": 0x00FF00  # Зеленый цвет для красоты
            }
        ]
    }
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=message)