"""Candidate portfolio schemas"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.models.candidate import ExperienceLevel


class SkillBase(BaseModel):
    """Skill base schema"""
    name: str
    level: Optional[ExperienceLevel] = None


class SkillCreate(SkillBase):
    """Skill create request"""
    pass


class SkillUpdate(SkillBase):
    """Skill update request"""
    pass


class SkillResponse(SkillBase):
    """Skill response schema"""
    id: int
    endorsements: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    """Experience base schema"""
    job_title: str
    company_name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False


class ExperienceCreate(ExperienceBase):
    """Experience create request"""
    pass


class ExperienceUpdate(ExperienceBase):
    """Experience update request"""
    pass


class ExperienceResponse(ExperienceBase):
    """Experience response schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    """Project base schema"""
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    technologies: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Project create request"""
    pass


class ProjectUpdate(ProjectBase):
    """Project update request"""
    pass


class ProjectResponse(ProjectBase):
    """Project response schema"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CVBase(BaseModel):
    """CV base schema"""
    file_name: str
    is_primary: bool = False


class CVCreate(CVBase):
    """CV create request"""
    pass


class CVResponse(CVBase):
    """CV response schema"""
    id: int
    file_path: str
    file_size: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateProfileBase(BaseModel):
    """Candidate profile base schema"""
    full_name: Optional[str] = None
    title: Optional[str] = None  # Job title
    bio: Optional[str] = None
    is_public: bool = False


class CandidateProfileCreate(CandidateProfileBase):
    """Candidate profile create request"""
    pass


class CandidateProfileUpdate(CandidateProfileBase):
    """Candidate profile update request"""
    pass


class CandidateProfileResponse(CandidateProfileBase):
    """Candidate profile response schema"""
    id: int
    user_id: int
    profile_slug: Optional[str]
    avatar_url: Optional[str]
    contact_email: Optional[str] = None
    views: int = 0
    skills: List[SkillResponse] = []
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    cvs: List[CVResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CandidateProfileDetailResponse(CandidateProfileResponse):
    """Detailed candidate profile response (public view)"""
    pass
