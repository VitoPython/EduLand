from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.student import StudentLogin, Token, StudentResponse, StudentInDB
from crud.student_crud import student_crud
from auth.jwt import create_access_token, get_current_student
from datetime import timedelta
from typing import Any

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """Аутентификация студента и выдача JWT токена"""
    # Аутентифицируем студента по username и password
    student = await student_crud.authenticate_student(form_data.username, form_data.password)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем данные для токена
    token_data = {
        "sub": str(student.id),
        "username": student.username
    }
    
    # Создаем JWT токен
    access_token = create_access_token(token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=StudentResponse)
async def read_current_student(current_student: StudentInDB = Depends(get_current_student)) -> Any:
    """Получает информацию о текущем аутентифицированном студенте"""
    return current_student 