"""User and Auth schemas (Phase 2)."""
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr


class UserRegister(UserBase):
    password: str
    role: Optional[str] = "candidate"
    full_name: Optional[str] = None

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v):
        if isinstance(v, str):
            if len(v.encode("utf-8")) > 72:
                raise ValueError(
                    "Password cannot be longer than 72 bytes. Please use a shorter password."
                )
            if len(v) < 6:
                raise ValueError("Password must be at least 6 characters long")
        return v


class UserLogin(UserBase):
    password: str

    @field_validator("password", mode="before")
    @classmethod
    def validate_password(cls, v):
        if isinstance(v, str):
            if len(v.encode("utf-8")) > 72:
                raise ValueError(
                    "Password cannot be longer than 72 bytes. Please use a shorter password."
                )
        return v


class UserResponse(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    full_name: Optional[str] = None
    # Derived convenience for the frontend/admin UIs that still read `is_active`.
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
