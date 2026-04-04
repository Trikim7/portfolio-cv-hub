"""User and Auth models"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class UserRole(str, Enum):
    """User role enumeration"""
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate_profile = relationship(
        "CandidateProfile", back_populates="user", uselist=False
    )
    company_profile = relationship(
        "Company", back_populates="user", uselist=False
    )

    class Config:
        from_attributes = True
