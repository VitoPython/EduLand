from fastapi import APIRouter, HTTPException, Depends
from models.student import Student, StudentInDB, StudentUpdate
from crud.student_crud import student_crud
from typing import List
from auth.dependencies import get_current_user

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/", response_model=StudentInDB)
async def create_student(
    student: Student,
    current_user: dict = Depends(get_current_user)
):
    existing_student = await student_crud.get_user_by_email(student.email)
    if existing_student:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await student_crud.get_user_by_username(student.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return await student_crud.create_user(student)

@router.get("/", response_model=List[StudentInDB])
async def get_students(
    skip: int = 0, 
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    return await student_crud.get_users(skip, limit)

@router.get("/{student_id}", response_model=StudentInDB)
async def get_student(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    student = await student_crud.get_user_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=StudentInDB)
async def update_student(
    student_id: str, 
    student_data: StudentUpdate,
    current_user: dict = Depends(get_current_user)
):
    if student_data.email:
        existing_student = await student_crud.get_user_by_email(student_data.email)
        if existing_student and str(existing_student.id) != student_id:
            raise HTTPException(status_code=400, detail="Email already registered")

    updated_student = await student_crud.update_user(student_id, student_data.model_dump(exclude_unset=True))
    if not updated_student:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated_student

@router.delete("/{student_id}")
async def delete_student(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await student_crud.delete_user(student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"} 