"""Candidate portfolio models"""
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum,
    Table
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class ExperienceLevel(str, Enum):
    """Experience level enumeration"""
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


class CandidateProfile(Base):
    """Candidate profile model"""
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)  # Job title/Position
    bio = Column(Text, nullable=True)  # Short description
    profile_slug = Column(String(255), unique=True, nullable=True, index=True)  # URL slug
    is_public = Column(Boolean, default=False)  # Public portfolio visibility
    views = Column(Integer, default=0)  # Number of profile views
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="candidate_profile")
    skills = relationship("Skill", back_populates="candidate_profile", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="candidate_profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="candidate_profile", cascade="all, delete-orphan")
    cvs = relationship("CV", back_populates="candidate_profile", cascade="all, delete-orphan")

    class Config:
        from_attributes = True


class Skill(Base):
    """Skill model"""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    level = Column(SQLEnum(ExperienceLevel), nullable=True)  # e.g., JUNIOR, SENIOR
    endorsements = Column(Integer, default=0)  # Number of endorsements
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="skills")

    class Config:
        from_attributes = True


class Experience(Base):
    """Work experience model"""
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"))
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="experiences")

    class Config:
        from_attributes = True


class Project(Base):
    """Project model"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)  # Project link
    technologies = Column(String(500), nullable=True)  # Comma-separated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="projects")

    class Config:
        from_attributes = True


class CV(Base):
    """CV/Resume file model"""
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Local path or S3/MinIO URL
    file_size = Column(Integer, nullable=True)  # Size in bytes
    is_primary = Column(Boolean, default=False)  # Primary CV
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="cvs")

    class Config:
        from_attributes = True
