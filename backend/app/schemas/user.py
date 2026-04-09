"""User and Auth schemas"""
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    """User base schema"""
    email: EmailStr


class UserRegister(UserBase):
    """User registration request schema"""
    password: str
    role: Optional[str] = "candidate"
    
    @field_validator('password', mode='before')
    @classmethod
    def validate_password(cls, v):
        """Validate password length (bcrypt has 72 byte limit)"""
        if isinstance(v, str):
            if len(v.encode('utf-8')) > 72:
                raise ValueError('Password cannot be longer than 72 bytes. Please use a shorter password.')
            if len(v) < 6:
                raise ValueError('Password must be at least 6 characters long')
        return v


class UserLogin(UserBase):
    """User login request schema"""
    password: str
    
    @field_validator('password', mode='before')
    @classmethod
    def validate_password(cls, v):
        """Validate password length (bcrypt has 72 byte limit)"""
        if isinstance(v, str):
            if len(v.encode('utf-8')) > 72:
                raise ValueError('Password cannot be longer than 72 bytes. Please use a shorter password.')
        return v


class UserResponse(UserBase):
    """User response schema"""
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
