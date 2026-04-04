"""Recruiter schemas"""
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List


class RecruiterRegisterRequest(BaseModel):
    """Combined recruiter + company registration request"""
    # User data
    email: EmailStr
    password: str
    # Company data
    company_name: str
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    company_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
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


class CompanyBase(BaseModel):
    """Company base schema"""
    company_name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class CompanyRegister(CompanyBase):
    """Company registration request"""
    pass


class CompanyUpdate(BaseModel):
    """Company update request"""
    company_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    
    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        """Convert empty string to None"""
        if v == '' or v == 'contact@example.com':
            return None
        return v
    
    @field_validator('phone', mode='before')
    @classmethod
    def validate_phone(cls, v):
        """Convert placeholder to None"""
        if v == '' or '+84 123 456 789' in str(v):
            return None
        return v


class CompanyResponse(CompanyBase):
    """Company response schema"""
    id: int
    company_slug: str
    logo_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    user_id: Optional[int] = None

    class Config:
        from_attributes = True


class JobInvitationCreate(BaseModel):
    """Job invitation create request"""
    candidate_id: int
    job_title: str
    message: Optional[str] = None


class JobInvitationResponse(BaseModel):
    """Job invitation response schema"""
    id: int
    company_id: int
    candidate_id: int
    job_title: str
    message: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CandidateSearchResult(BaseModel):
    """Candidate search result"""
    id: int
    user_id: int
    full_name: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    profile_slug: str
    avatar_url: Optional[str] = None
    skills: List[str] = []

    class Config:
        from_attributes = True
