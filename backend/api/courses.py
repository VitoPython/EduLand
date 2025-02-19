from fastapi import APIRouter, HTTPException, Depends
from models.course import Course, Lesson, Assignment, CourseUpdate
from crud.course_crud import course_crud
from typing import List
from auth.dependencies import get_current_user
from bson.objectid import ObjectId

router = APIRouter(prefix="/courses", tags=["courses"])

# Course endpoints
@router.post("/", response_model=Course)
async def create_course(
    course: Course,
    current_user: dict = Depends(get_current_user)
):
    return await course_crud.create_course(course)

@router.get("/", response_model=List[Course])
async def get_courses(
    current_user: dict = Depends(get_current_user)
):
    return await course_crud.get_courses()

@router.get("/{course_id}", response_model=Course)
async def get_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    course = await course_crud.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=Course)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    current_user: dict = Depends(get_current_user)
):
    updated_course = await course_crud.update_course(
        course_id,
        course_data.model_dump(exclude_unset=True)
    )
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await course_crud.delete_course(course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# Lesson endpoints
@router.post("/{course_id}/lessons", response_model=Lesson)
async def create_lesson(
    course_id: str,
    lesson: Lesson,
    current_user: dict = Depends(get_current_user)
):
    created_lesson = await course_crud.create_lesson(course_id, lesson)
    if not created_lesson:
        raise HTTPException(status_code=404, detail="Course not found")
    return created_lesson

@router.put("/lessons/{lesson_id}", response_model=Lesson)
async def update_lesson(
    lesson_id: str,
    lesson_data: dict,
    current_user: dict = Depends(get_current_user)
):
    updated_lesson = await course_crud.update_lesson(lesson_id, lesson_data)
    if not updated_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return updated_lesson

@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await course_crud.delete_lesson(lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted successfully"}

@router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(
    lesson_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not lesson_id or not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="Invalid lesson ID")
        
    lesson = await course_crud.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

# Assignment endpoints
@router.post("/lessons/{lesson_id}/assignments", response_model=Assignment)
async def create_assignment(
    lesson_id: str,
    assignment: Assignment,
    current_user: dict = Depends(get_current_user)
):
    if not lesson_id or not ObjectId.is_valid(lesson_id):
        raise HTTPException(status_code=400, detail="Invalid lesson ID")
        
    created_assignment = await course_crud.create_assignment(lesson_id, assignment)
    if not created_assignment:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return created_assignment

@router.put("/assignments/{assignment_id}", response_model=Assignment)
async def update_assignment(
    assignment_id: str,
    assignment_data: dict,
    current_user: dict = Depends(get_current_user)
):
    updated_assignment = await course_crud.update_assignment(assignment_id, assignment_data)
    if not updated_assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return updated_assignment

@router.delete("/assignments/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await course_crud.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment deleted successfully"}

@router.get("/assignments/{assignment_id}", response_model=Assignment)
async def get_assignment(
    assignment_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not assignment_id or not ObjectId.is_valid(assignment_id):
        raise HTTPException(status_code=400, detail="Invalid assignment ID")
        
    assignment = await course_crud.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment 