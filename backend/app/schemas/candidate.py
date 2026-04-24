"""Candidate portfolio schemas (Phase 2 — i18n JSONB)."""
from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Union
from app.models.candidate import ExperienceLevel


# Shape of every i18n text field: {"vi": "...", "en": "..."}.
# Accepts either a bare string (legacy clients) or a dict.
LocalizedText = Optional[Dict[str, str]]


def _coerce_i18n(value):
    """Accept plain string input and normalize to {'vi': value} for storage."""
    if value is None or isinstance(value, dict):
        return value
    if isinstance(value, str):
        return {"vi": value}
    return value


class SkillBase(BaseModel):
    name: str
    level: Optional[ExperienceLevel] = None
    category: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    endorsements: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExperienceBase(BaseModel):
    job_title: str
    company_name: str
    description: LocalizedText = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False

    @field_validator("description", mode="before")
    @classmethod
    def _description_to_i18n(cls, v):
        return _coerce_i18n(v)


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceResponse(ExperienceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    project_name: str
    role: Optional[str] = None
    technologies: Optional[str] = None
    description: LocalizedText = None
    project_url: Optional[str] = None
    github_url: Optional[str] = None

    @field_validator("description", mode="before")
    @classmethod
    def _description_to_i18n(cls, v):
        return _coerce_i18n(v)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CVBase(BaseModel):
    file_name: str
    is_primary: bool = False


class CVCreate(CVBase):
    pass


class CVResponse(CVBase):
    id: int
    file_path: str
    file_size: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileBase(BaseModel):
    full_name: Optional[str] = None
    headline: LocalizedText = None
    bio: LocalizedText = None
    is_public: bool = False

    @field_validator("headline", "bio", mode="before")
    @classmethod
    def _to_i18n(cls, v):
        return _coerce_i18n(v)


class CandidateProfileCreate(CandidateProfileBase):
    pass


class CandidateProfileUpdate(CandidateProfileBase):
    pass


class CandidateProfileResponse(CandidateProfileBase):
    id: int
    user_id: int
    public_slug: Optional[str] = None
    avatar_url: Optional[str] = None
    template_id: Optional[int] = None
    contact_email: Optional[str] = None
    views: int = 0
    skills: List[SkillResponse] = []
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    cvs: List[CVResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CandidateProfileDetailResponse(CandidateProfileResponse):
    """Public portfolio view — identical shape today, reserved for future fields."""
    pass
