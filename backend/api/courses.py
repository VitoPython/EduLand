from fastapi import APIRouter, HTTPException, Depends
from models.course import Course
from crud.course_crud import course_crud
from typing import List
from .dependencies import get_current_user

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    dependencies=[Depends(get_current_user())]
)

@router.post("/")
async def create_course(course: Course):
    try:
        created_course = await course_crud.create_course(course)
        return created_course
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_courses():
    try:
        courses = await course_crud.get_courses()
        return courses
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{course_id}")
async def get_course(course_id: str):
    try:
        course = await course_crud.get_course(course_id)
        if course:
            return course
        raise HTTPException(status_code=404, detail="Course not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{course_id}")
async def update_course(course_id: str, course_data: dict):
    try:
        updated_course = await course_crud.update_course(course_id, course_data)
        if updated_course:
            return updated_course
        raise HTTPException(status_code=404, detail="Course not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{course_id}")
async def delete_course(course_id: str):
    try:
        success = await course_crud.delete_course(course_id)
        if success:
            return {"message": "Course deleted successfully"}
        raise HTTPException(status_code=404, detail="Course not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 