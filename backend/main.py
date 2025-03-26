from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import users, courses, lessons, assignments, students, enrollments, groups, attendance
from dotenv import load_dotenv
import os

# Загружаем переменные окружения
load_dotenv()

# Получаем переменные окружения для Clerk
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем все роутеры
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(assignments.router)
app.include_router(students.router)
app.include_router(enrollments.router)
app.include_router(groups.router)
app.include_router(attendance.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
