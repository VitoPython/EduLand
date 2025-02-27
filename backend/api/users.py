from fastapi import APIRouter, HTTPException, Depends
from models.user import User, UserUpdate
from crud.user_crud import user_crud
from typing import List
from auth.dependencies import get_current_user
from services import discord as webhook
from auth.clerk import verify_token

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=User)
async def create_user(
    user: User,
    current_user: dict = Depends(get_current_user)
):
    existing_user = await user_crud.get_user_by_clerk_id(user.clerk_id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    await webhook.notify_discord(user)
    return await user_crud.create_user(user)

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0, 
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    return await user_crud.get_users(skip, limit)

@router.get("/{clerk_id}", response_model=User)
async def get_user(
    clerk_id: str,
    current_user: dict = Depends(get_current_user)
):
    user = await user_crud.get_user_by_clerk_id(clerk_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{clerk_id}", response_model=User)
async def update_user(
    clerk_id: str, 
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Проверяем, существует ли пользователь
    existing_user = await user_crud.get_user_by_clerk_id(clerk_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверяем, не пытается ли пользователь обновить email на уже существующий
    if user_data.email:
        email_user = await user_crud.get_user_by_email(user_data.email)
        if email_user and email_user.clerk_id != clerk_id:
            raise HTTPException(status_code=400, detail="Email already registered")

    updated_user = await user_crud.update_user(clerk_id, user_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{clerk_id}")
async def delete_user(
    clerk_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await user_crud.delete_user(clerk_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/protected")
def protected_route(user: dict = Depends(verify_token)):
    return {"message": "Access granted", "user": user}