from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from bson import ObjectId
from datetime import datetime
from fastapi.encoders import jsonable_encoder
import json

# Импортируем роутеры
from api.auth import router as auth_router
# from api.student_assignment_submit import router as student_assignment_submit_router
from api.assignment_submission import router as assignment_submission_router
from api.student_code_submission import router as student_code_router
# from api.students import router as students_router
from api.courses import router as courses_router
from api.lessons import router as lessons_router
from api.assignments import router as assignments_router
from api.files import router as files_router

# Загружаем переменные окружения
load_dotenv()

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

# Создаем экземпляр FastAPI
app = FastAPI(title="Student Portal API")

# Настраиваем CORS для frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # При разработке разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Переопределяем стандартный JSON encoder для FastAPI
def custom_encoder(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

app.json_encoder = CustomJSONEncoder

# Подключаем роутеры
app.include_router(auth_router)
# app.include_router(student_assignment_submit_router)
app.include_router(assignment_submission_router)
app.include_router(student_code_router)
# app.include_router(students_router)
app.include_router(courses_router)
app.include_router(lessons_router)
app.include_router(assignments_router)
app.include_router(files_router)

# Маршрут для проверки работоспособности API
@app.get("/health")
async def health_check():
    return {"status": "Student Portal API is running!"}

@app.get("/")
async def root():
    return {"message": "Welcome to Student Portal API"}

# Запуск приложения
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 