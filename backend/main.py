from fastapi import FastAPI, Depends, HTTPException, Security
from api.users import router as users_router
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.clerk import verify_token
from dotenv import load_dotenv
import os
from jwt.algorithms import RSAAlgorithm
import jwt
import requests
import json
import datetime
from api.students import router as students_router
from api.courses import router as courses_router
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()

app.include_router(users_router)
app.include_router(students_router)
app.include_router(courses_router)

security = HTTPBearer()

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
CLERK_AUDIENCE = os.getenv("CLERK_AUDIENCE")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")



# Получаем публичные ключи Clerk






if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/protected")
def protected_route(user: dict = Depends(verify_token)):
    return {"message": "Access granted", "user": user}