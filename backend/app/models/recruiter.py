"""Recruiter and Company models"""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class CompanyStatus(str, Enum):
    """Company approval status"""
    PENDING = "pending"  # Chờ Admin duyệt
    APPROVED = "approved"  # Đã duyệt
    REJECTED = "rejected"  # Bị từ chối
    SUSPENDED = "suspended"  # Bị khóa


class InvitationStatus(str, Enum):
    """Job invitation status"""
    PENDING = "pending"  # Chờ ứng viên phản hồi
    INTERESTED = "interested"  # Ứng viên quan tâm
    REJECTED = "rejected"  # Ứng viên từ chối
    WITHDRAWN = "withdrawn"  # Doanh nghiệp hủy


class Company(Base):
    """Company/Recruiter profile model"""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    company_name = Column(String(255), nullable=False)
    company_slug = Column(String(255), unique=True, nullable=False, index=True)
    industry = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Status & Verification
    status = Column(SQLEnum(CompanyStatus), default=CompanyStatus.PENDING, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="company_profile")
    job_invitations = relationship(
        "JobInvitation", back_populates="company", cascade="all, delete-orphan"
    )

    class Config:
        from_attributes = True


class JobInvitation(Base):
    """Job invitation (Offer sent to Candidate)"""
    __tablename__ = "job_invitations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"))
    
    job_title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="job_invitations")
    candidate_profile = relationship("CandidateProfile")

    class Config:
        from_attributes = True
