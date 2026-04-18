"""Recruiter schemas (Phase 2)."""
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict


LocalizedText = Optional[Dict[str, str]]


class RecruiterRegisterRequest(BaseModel):
    """Combined recruiter + company registration request."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    company_name: str
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    company_email: Optional[EmailStr] = None
    phone: Optional[str] = None

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


class CompanyBase(BaseModel):
    company_name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class CompanyRegister(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def _normalize_email(cls, v):
        if v == "" or v == "contact@example.com":
            return None
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def _normalize_phone(cls, v):
        if v == "" or (v and "+84 123 456 789" in str(v)):
            return None
        return v


class CompanyResponse(CompanyBase):
    id: int
    company_slug: str
    logo_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class JobInvitationCreate(BaseModel):
    candidate_id: int
    job_title: str
    message: Optional[str] = None


class JobInvitationResponse(BaseModel):
    id: int
    company_id: int
    candidate_id: int
    job_title: str
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateSearchResult(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: LocalizedText = None
    public_slug: str
    avatar_url: Optional[str] = None
    skills: List[str] = []

    model_config = ConfigDict(from_attributes=True)
