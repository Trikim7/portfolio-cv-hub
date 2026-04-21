"""Analytics & comparison models (Phase 2 — ProfileView, Comparison)."""
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class ViewerType(str, Enum):
    ANONYMOUS = "anonymous"
    COMPANY = "company"


class ProfileView(Base):
    """Row-per-view log for candidate analytics."""
    __tablename__ = "profile_views"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    viewer_type = Column(SQLEnum(ViewerType), nullable=False)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True
    )
    viewed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    candidate_profile = relationship("CandidateProfile", back_populates="profile_view_logs")
    company = relationship("Company", back_populates="profile_views")

    class Config:
        from_attributes = True


class Comparison(Base):
    """Snapshot log of a candidate-comparison session performed by a recruiter."""
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Frozen snapshot of the job requirement + computed scores so history is stable
    # even if the underlying job_requirement row is later edited.
    criteria_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    company = relationship("Company", back_populates="comparisons")
    participants = relationship(
        "ComparisonCandidate",
        back_populates="comparison",
        cascade="all, delete-orphan",
    )

    class Config:
        from_attributes = True


class ComparisonCandidate(Base):
    """Mapping of candidates included in a comparison session."""
    __tablename__ = "comparison_candidates"

    id = Column(Integer, primary_key=True, index=True)
    comparison_id = Column(
        Integer, ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_id = Column(
        Integer,
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    comparison = relationship("Comparison", back_populates="participants")
    candidate_profile = relationship("CandidateProfile")

    class Config:
        from_attributes = True
