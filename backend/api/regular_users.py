from fastapi import APIRouter, HTTPException, Depends
from models.regular_user import RegularUser, RegularUserInDB, RegularUserUpdate
from crud.regular_user_crud import regular_user_crud
from typing import List
from auth.dependencies import get_current_user

router = APIRouter(prefix="/regular-users", tags=["regular-users"])

@router.post("/", response_model=RegularUserInDB)
async def create_regular_user(
    user: RegularUser,
    current_user: dict = Depends(get_current_user)
):
    existing_user = await regular_user_crud.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await regular_user_crud.get_user_by_username(user.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return await regular_user_crud.create_user(user)

@router.get("/", response_model=List[RegularUserInDB])
async def get_regular_users(
    skip: int = 0, 
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    return await regular_user_crud.get_users(skip, limit)

@router.get("/{user_id}", response_model=RegularUserInDB)
async def get_regular_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    user = await regular_user_crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=RegularUserInDB)
async def update_regular_user(
    user_id: str, 
    user_data: RegularUserUpdate,
    current_user: dict = Depends(get_current_user)
):
    if user_data.email:
        existing_user = await regular_user_crud.get_user_by_email(user_data.email)
        if existing_user and str(existing_user.id) != user_id:
            raise HTTPException(status_code=400, detail="Email already registered")

    updated_user = await regular_user_crud.update_user(user_id, user_data.model_dump(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}")
async def delete_regular_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await regular_user_crud.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"} 