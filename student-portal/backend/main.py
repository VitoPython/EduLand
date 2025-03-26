from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Импортируем роутеры
from api.auth import router as auth_router
from api.courses import router as courses_router
from api.lessons import router as lessons_router
from api.assignments import router as assignments_router

# Загружаем переменные окружения
load_dotenv()

# Создаем экземпляр FastAPI
app = FastAPI(title="Student Portal API")

# Настраиваем CORS для frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники в режиме разработки
    allow_credentials=False,  # Отключаем credentials, так как используем allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Подключаем роутеры
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(lessons_router)
app.include_router(assignments_router)

# Маршрут для проверки работоспособности API
@app.get("/health")
async def health_check():
    return {"status": "Student Portal API is running!"}

# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 