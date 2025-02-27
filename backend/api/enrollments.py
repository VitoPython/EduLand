from fastapi import APIRouter, HTTPException, Depends
from models.enrollment import Enrollment, EnrollmentUpdate
from crud.enrollment_crud import enrollment_crud
from crud.student_crud import student_crud
from crud.course_crud import course_crud
from typing import List
from auth.dependencies import get_current_user

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("/", response_model=Enrollment)
async def create_enrollment(
    enrollment: Enrollment,
    current_user: dict = Depends(get_current_user)
):
    # Проверяем существование студента
    student = await student_crud.get_user_by_id(enrollment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Проверяем существование курса
    course = await course_crud.get_course(enrollment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Создаем запись о зачислении
    created_enrollment = await enrollment_crud.create_enrollment(enrollment)
    if not created_enrollment:
        raise HTTPException(
            status_code=400, 
            detail="Student is already enrolled in this course"
        )
    return created_enrollment

@router.get("/student/{student_id}", response_model=List[Enrollment])
async def get_student_enrollments(
    student_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await enrollment_crud.get_student_enrollments(student_id)

@router.get("/course/{course_id}", response_model=List[Enrollment])
async def get_course_enrollments(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await enrollment_crud.get_course_enrollments(course_id)

@router.put("/{enrollment_id}", response_model=Enrollment)
async def update_enrollment(
    enrollment_id: str,
    enrollment_data: EnrollmentUpdate,
    current_user: dict = Depends(get_current_user)
):
    updated = await enrollment_crud.update_enrollment(
        enrollment_id,
        enrollment_data.model_dump(exclude_unset=True)
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return updated

@router.delete("/{enrollment_id}")
async def delete_enrollment(
    enrollment_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await enrollment_crud.delete_enrollment(enrollment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment deleted successfully"} 