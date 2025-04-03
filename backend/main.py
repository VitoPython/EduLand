from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
# Импортируем каждый модуль отдельно для гарантированной загрузки
from api import users, courses, lessons, assignments, students, enrollments, groups, attendance, grades, assignment_submit
# Явно импортируем student_code
from api import student_code
from dotenv import load_dotenv
import os
import logging

# Настройка логирования
logger = logging.getLogger(__name__)

# Загружаем переменные окружения
load_dotenv()

# Получаем переменные окружения для Clerk
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")

app = FastAPI(
    title="Student Back Portal API",
    description="API для управления студентами, курсами, оценками и посещаемостью",
    version="1.0.0",
    openapi_tags=[
        {"name": "users", "description": "Операции с пользователями"},
        {"name": "courses", "description": "Операции с курсами"},
        {"name": "lessons", "description": "Операции с уроками"},
        {"name": "assignments", "description": "Операции с заданиями"},
        {"name": "students", "description": "Операции со студентами"},
        {"name": "enrollments", "description": "Операции с зачислениями"},
        {"name": "groups", "description": "Операции с группами"},
        {"name": "attendance", "description": "Операции с посещаемостью"},
        {"name": "grades", "description": "Операции с оценками"},
        {"name": "assignment_submit", "description": "Операции с отправкой заданий"},
        {"name": "student_code", "description": "Операции с кодом заданий студентов"}
    ]
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "Authorization", "Content-Type"],
    expose_headers=["*"],
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
app.include_router(grades.router)
app.include_router(assignment_submit.router)
app.include_router(student_code.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
