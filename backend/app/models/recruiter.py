"""Recruiter, Company, JobRequirement and Invitation models (Phase 2)."""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class CompanyStatus(str, Enum):
    """Company approval lifecycle.

    Kept as a richer enum than the bare `is_approved` boolean in the design doc
    because the admin UI already drives `pending / approved / rejected / suspended`
    flows from Phase 1. Documented deviation in `.agent/skill-team-workflow/
    database-design.md`.
    """
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class InvitationStatus(str, Enum):
    PENDING = "pending"
    INTERESTED = "interested"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    company_name = Column(String(255), nullable=False)
    company_slug = Column(String(255), unique=True, nullable=False, index=True)
    industry = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(
        SQLEnum(CompanyStatus), default=CompanyStatus.PENDING, nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", back_populates="company_profile")
    job_requirements = relationship(
        "JobRequirement", back_populates="company", cascade="all, delete-orphan"
    )
    job_invitations = relationship(
        "JobInvitation", back_populates="company", cascade="all, delete-orphan"
    )
    profile_views = relationship("ProfileView", back_populates="company")
    comparisons = relationship(
        "Comparison", back_populates="company", cascade="all, delete-orphan"
    )

    # Design-compatible derived alias.
    @property
    def is_approved(self) -> bool:
        return self.status == CompanyStatus.APPROVED

    class Config:
        from_attributes = True


class JobRequirement(Base):
    """Recruiter-authored hiring criteria used by the Phase 2 scoring engine."""
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String(255), nullable=False)
    # [{"name": "Python", "level": "senior"}, ...]
    required_skills = Column(JSONB, nullable=False, default=list)
    years_experience = Column(Integer, nullable=True)
    required_role = Column(String(255), nullable=True)  # e.g. Backend / Frontend
    customer_facing = Column(Boolean, default=False, nullable=False)
    tech_stack = Column(JSONB, nullable=True)  # ["Python", "React", ...]
    is_management_role = Column(Boolean, default=False, nullable=False)
    # Optional weight override for the 6 radar axes: {"technical": 0.25, ...}
    weights_config = Column(JSONB, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    company = relationship("Company", back_populates="job_requirements")

    class Config:
        from_attributes = True


class JobInvitation(Base):
    """Invitation sent from a company to a candidate."""
    __tablename__ = "job_invitations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(
        SQLEnum(InvitationStatus),
        default=InvitationStatus.PENDING,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    company = relationship("Company", back_populates="job_invitations")
    candidate_profile = relationship("CandidateProfile")

    class Config:
        from_attributes = True
