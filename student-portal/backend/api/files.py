from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import FileResponse
import os
import shutil
from typing import List
import uuid

# Маршрутизатор для работы с файлами
router = APIRouter(
    prefix="/files",
    tags=["files"]
)

# Базовая директория для загрузки файлов
UPLOAD_DIR = "uploads"

# Создаем директорию, если она не существует
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """
    Загрузка файла на сервер.
    Возвращает путь к загруженному файлу, который можно затем использовать
    для прикрепления к заданию в поле attachments.
    """
    try:
        # Создаем директорию, если ее нет
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Полный путь для сохранения файла
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Выводим отладочную информацию
        print(f"Сохраняем файл {file.filename} как {unique_filename} в {file_path}")
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Возвращаем относительный путь к файлу
        return {"filename": unique_filename, "path": file_path}
    
    except Exception as e:
        print(f"Ошибка при загрузке файла: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при загрузке файла: {str(e)}"
        )
    finally:
        await file.close()

@router.get("/{filename}")
async def get_file(filename: str):
    """
    Получение файла по имени файла.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )
        
    return FileResponse(
        file_path, 
        filename=os.path.basename(file_path)
    )

@router.delete("/{filename}")
async def delete_file(filename: str):
    """
    Удаление файла по имени файла.
    """
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )
    
    try:
        os.remove(file_path)
        return {"message": "Файл успешно удален"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при удалении файла: {str(e)}"
        ) 