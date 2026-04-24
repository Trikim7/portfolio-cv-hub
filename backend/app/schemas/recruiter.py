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


# Job Requirements Schemas (Phase 2)
class SkillRequirement(BaseModel):
    name: str
    level: Optional[str] = None  # entry, junior, mid, senior, lead


class JobRequirementBase(BaseModel):
    title: str
    required_skills: List[SkillRequirement] = []
    years_experience: Optional[int] = None
    required_role: Optional[str] = None
    customer_facing: bool = False
    tech_stack: Optional[List[str]] = None
    is_management_role: bool = False
    weights_config: Optional[Dict] = None  # {"technical": 0.25, ...}
    is_active: bool = True


class JobRequirementCreate(JobRequirementBase):
    pass


class JobRequirementUpdate(BaseModel):
    title: Optional[str] = None
    required_skills: Optional[List[SkillRequirement]] = None
    years_experience: Optional[int] = None
    required_role: Optional[str] = None
    customer_facing: Optional[bool] = None
    tech_stack: Optional[List[str]] = None
    is_management_role: Optional[bool] = None
    weights_config: Optional[Dict] = None
    is_active: Optional[bool] = None


class JobRequirementResponse(JobRequirementBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    model_config = ConfigDict(from_attributes=True)


class CandidateSearchResult(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    headline: Optional[object] = None   # str or {vi/en} dict — accept both
    bio: Optional[object] = None        # str or {vi/en} dict — accept both
    public_slug: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: List[str] = []

    model_config = ConfigDict(from_attributes=True)
