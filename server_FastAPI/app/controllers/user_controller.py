from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.utils.api_response import ApiResponse
from app.utils.security import create_access_token, create_refresh_token
from app.helper.common import validate_phone
from app.utils.cloudinary import upload_to_cloudinary
from app.db import db
from datetime import datetime
import bcrypt

router = APIRouter()

async def get_user_by_phone(phone: str) -> dict:
    return await db["users"].find_one({"phone": phone})

async def create_user(user_data: dict) -> dict:
    result = await db["users"].insert_one(user_data)
    new_user = await db["users"].find_one({"_id": result.inserted_id})
    return new_user

@router.post("/register", response_model=ApiResponse[UserResponse])
async def register_user(
    user: UserCreate = Depends(),
    image: UploadFile = File(None)
):
    # Phone validation
    if not validate_phone(user.phone):
        return ApiResponse.error("Invalid phone number", 400)
    
    # Check existing user
    if await get_user_by_phone(user.phone):
        return ApiResponse.error("User already exists", 400)
    
    # Hash PIN
    hashed_pin = bcrypt.hashpw(user.pin.encode(), bcrypt.gensalt())
    
    # Upload image if exists
    image_url = ""
    if image:
        image_url = await upload_to_cloudinary(await image.read())
    
    # Create user
    user_data = {
        **user.dict(exclude={"pin"}),
        "pin": hashed_pin.decode(),
        "image": image_url,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    new_user = await create_user(user_data)
    
    # Generate tokens
    access_token = create_access_token(str(new_user["_id"]), new_user["role"])
    refresh_token = create_refresh_token(
        str(new_user["_id"]),
        new_user["role"],
        new_user.get("token_version", 0)
    )
    
    # Update user with refresh token
    await db["users"].update_one(
        {"_id": new_user["_id"]},
        {"$set": {"refresh_token": refresh_token}}
    )
    
    # Prepare response
    response_data = {
        **UserResponse(**new_user).dict(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }
    
    return ApiResponse.success(
        data=response_data,
        message="User registered successfully"
    )

@router.post("/login", response_model=ApiResponse[UserResponse])
async def login_user(credentials: UserLogin):
    # Phone validation
    if not validate_phone(credentials.phone):
        return ApiResponse.error("Invalid phone number", 400)
    
    # Find user
    user = await get_user_by_phone(credentials.phone)
    if not user:
        return ApiResponse.error("User not found", 404)
    
    # Verify PIN
    if not bcrypt.checkpw(credentials.pin.encode(), user["pin"].encode()):
        return ApiResponse.error("Invalid credentials", 401)
    
    # Generate tokens
    access_token = create_access_token(str(user["_id"]), user["role"])
    refresh_token = create_refresh_token(
        str(user["_id"]),
        user["role"],
        user.get("token_version", 0)
    )
    
    # Update user with refresh token
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"refresh_token": refresh_token}}
    )
    
    # Prepare response
    response_data = {
        **UserResponse(**user).dict(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }
    
    return ApiResponse.success(
        data=response_data,
        message="Login successful"
    )