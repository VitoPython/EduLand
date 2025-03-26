from fastapi import APIRouter, HTTPException, Depends
from bson.objectid import ObjectId
from crud.course_crud import course_crud
from .dependencies import get_current_user
from models.course import Lesson

router = APIRouter(
    prefix="/lessons",
    tags=["lessons"],
    dependencies=[Depends(get_current_user())]
)

@router.get("/course/{course_id}")
async def get_course_lessons(course_id: str):
    try:
        lessons = await course_crud.get_course_lessons(course_id)
        return lessons
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{course_id}")
async def create_lesson(course_id: str, lesson_data: dict):
    try:
        created_lesson = await course_crud.create_lesson(course_id, lesson_data)
        if created_lesson:
            return created_lesson
        raise HTTPException(status_code=400, detail="Failed to create lesson")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{lesson_id}")
async def update_lesson(lesson_id: str, lesson_data: dict):
    try:
        updated_lesson = await course_crud.update_lesson(lesson_id, lesson_data)
        if updated_lesson:
            return updated_lesson
        raise HTTPException(status_code=404, detail="Lesson not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{lesson_id}")
async def delete_lesson(lesson_id: str):
    try:
        success = await course_crud.delete_lesson(lesson_id)
        if success:
            return {"message": "Lesson deleted successfully"}
        raise HTTPException(status_code=404, detail="Lesson not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    try:
        lesson = await course_crud.get_lesson(lesson_id)
        if lesson:
            return lesson
        raise HTTPException(status_code=404, detail="Lesson not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 