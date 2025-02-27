from fastapi import Depends, HTTPException
from auth.clerk import verify_token

def get_current_user():
    async def dependency(user: dict = Depends(verify_token)):
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    return dependency 