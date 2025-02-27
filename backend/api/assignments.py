from fastapi import APIRouter, HTTPException, Depends
from bson.objectid import ObjectId
from crud.course_crud import course_crud
from .dependencies import get_current_user

router = APIRouter(
    prefix="/assignments",
    tags=["assignments"],
    dependencies=[Depends(get_current_user())]
)

@router.get("/lessons/{lesson_id}")
async def get_lesson_assignments(lesson_id: str):
    try:
        assignments = await course_crud.get_lesson_assignments(lesson_id)
        return assignments
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/lessons/{lesson_id}")
async def create_assignment(lesson_id: str, assignment_data: dict):
    try:
        if not ObjectId.is_valid(lesson_id):
            raise HTTPException(status_code=400, detail="Invalid lesson ID format")
            
        created_assignment = await course_crud.create_assignment(lesson_id, assignment_data)
        if not created_assignment:
            raise HTTPException(status_code=400, detail="Failed to create assignment")
            
        return created_assignment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{assignment_id}")
async def update_assignment(assignment_id: str, assignment_data: dict):
    try:
        if not ObjectId.is_valid(assignment_id):
            raise HTTPException(status_code=400, detail="Invalid assignment ID")
            
        updated_assignment = await course_crud.update_assignment(assignment_id, assignment_data)
        if not updated_assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
            
        return updated_assignment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{assignment_id}")
async def delete_assignment(assignment_id: str):
    try:
        success = await course_crud.delete_assignment(assignment_id)
        if success:
            return {"message": "Assignment deleted successfully"}
        raise HTTPException(status_code=404, detail="Assignment not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{assignment_id}")
async def get_assignment(assignment_id: str):
    try:
        if not assignment_id or assignment_id == 'undefined':
            raise HTTPException(status_code=400, detail="Invalid assignment ID")
            
        if not ObjectId.is_valid(assignment_id):
            raise HTTPException(status_code=400, detail="Invalid assignment ID format")
            
        assignment = await course_crud.get_assignment(assignment_id)
        if assignment:
            return dict(assignment)
        raise HTTPException(status_code=404, detail="Assignment not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 