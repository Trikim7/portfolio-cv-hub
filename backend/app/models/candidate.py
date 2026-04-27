"""Candidate portfolio models (Phase 2 — JSONB i18n + template link)."""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, ForeignKey, Boolean,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class ExperienceLevel(str, Enum):
    """Skill/experience level enumeration."""
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_name = Column(String(255), nullable=True)
    # i18n headline: {"vi": "...", "en": "..."}
    headline = Column(JSONB, nullable=True)  # Phase 2: renamed from `title`
    # i18n bio: {"vi": "...", "en": "..."}
    bio = Column(JSONB, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    # Denormalized view counter; detailed rows live in profile_views table.
    views = Column(Integer, default=0, nullable=False)
    public_slug = Column(String(255), unique=True, nullable=True, index=True)
    template_id = Column(
        Integer, ForeignKey("templates.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="candidate_profile")
    template = relationship("Template")
    skills = relationship(
        "Skill", back_populates="candidate_profile", cascade="all, delete-orphan"
    )
    experiences = relationship(
        "Experience", back_populates="candidate_profile", cascade="all, delete-orphan"
    )
    projects = relationship(
        "Project", back_populates="candidate_profile", cascade="all, delete-orphan"
    )
    cvs = relationship(
        "CV", back_populates="candidate_profile", cascade="all, delete-orphan"
    )
    profile_view_logs = relationship(
        "ProfileView", back_populates="candidate_profile", cascade="all, delete-orphan"
    )

    class Config:
        from_attributes = True


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    level = Column(SQLEnum(ExperienceLevel), nullable=True)
    category = Column(String(255), nullable=True)  # Phase 2: Frontend / Backend / DevOps
    endorsements = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    candidate_profile = relationship("CandidateProfile", back_populates="skills")

    class Config:
        from_attributes = True


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    # i18n description: {"vi": "...", "en": "..."}
    description = Column(JSONB, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    candidate_profile = relationship("CandidateProfile", back_populates="experiences")

    class Config:
        from_attributes = True


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_name = Column(String(255), nullable=False)  # Phase 2: renamed from `title`
    role = Column(String(255), nullable=True)
    technologies = Column(String(500), nullable=True)  # comma-separated
    # i18n description: {"vi": "...", "en": "..."}
    description = Column(JSONB, nullable=True)
    project_url = Column(String(500), nullable=True)  # Phase 2: renamed from `url`
    github_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    candidate_profile = relationship("CandidateProfile", back_populates="projects")

    class Config:
        from_attributes = True


class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Local path or S3/MinIO URL
    file_size = Column(Integer, nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    candidate_profile = relationship("CandidateProfile", back_populates="cvs")

    class Config:
        from_attributes = True
