from fastapi import APIRouter, HTTPException, Depends
from models.group import Group, GroupStudent, GroupUpdate
from crud.group_crud import group_crud
from typing import List
from .dependencies import get_current_user

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

@router.post("/", response_model=Group)
async def create_group(group: Group, current_user = Depends(get_current_user)):
    try:
        return await group_crud.create_group(group)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Group])
async def get_groups(skip: int = 0, limit: int = 10, current_user = Depends(get_current_user)):
    try:
        return await group_crud.get_groups(skip, limit)
    except Exception as e:
        print(f"Error in get_groups: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{group_id}", response_model=Group)
async def get_group(group_id: str, current_user = Depends(get_current_user)):
    try:
        group = await group_crud.get_group(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        return group
    except Exception as e:
        print(f"Error in get_group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{group_id}", response_model=Group)
async def update_group(group_id: str, group_data: GroupUpdate, current_user = Depends(get_current_user)):
    updated_group = await group_crud.update_group(group_id, group_data)
    if not updated_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return updated_group

@router.delete("/{group_id}")
async def delete_group(group_id: str, current_user = Depends(get_current_user)):
    success = await group_crud.delete_group(group_id)
    if not success:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

@router.post("/{group_id}/students", response_model=Group)
async def add_student_to_group(group_id: str, student: GroupStudent, current_user = Depends(get_current_user)):
    try:
        updated_group = await group_crud.add_student_to_group(group_id, student)
        if not updated_group:
            raise HTTPException(status_code=404, detail="Group not found")
        return updated_group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{group_id}/students/{student_id}")
async def remove_student_from_group(group_id: str, student_id: str, current_user = Depends(get_current_user)):
    success = await group_crud.remove_student_from_group(group_id, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found in group")
    return {"message": "Student removed from group successfully"}

@router.get("/{group_id}/students")
async def get_group_students(group_id: str, current_user = Depends(get_current_user)):
    try:
        return await group_crud.get_group_students(group_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 