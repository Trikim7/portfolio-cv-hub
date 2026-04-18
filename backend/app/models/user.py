"""User and Auth models (Phase 2)"""
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from app.db.database import Base


class UserRole(str, Enum):
    """User role enumeration"""
    CANDIDATE = "candidate"
    RECRUITER = "recruiter"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """User account status (Phase 2 — replaces Phase 1 is_active)."""
    ACTIVE = "active"
    LOCKED = "locked"
    PENDING = "pending"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # Nullable because social-only accounts have no password (Phase 2).
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False)
    status = Column(
        SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    candidate_profile = relationship(
        "CandidateProfile", back_populates="user", uselist=False
    )
    company_profile = relationship(
        "Company", back_populates="user", uselist=False
    )
    social_accounts = relationship(
        "SocialAccount", back_populates="user", cascade="all, delete-orphan"
    )

    # Backward-compat read-only alias for code paths that still check `is_active`.
    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

    class Config:
        from_attributes = True


class SocialAccount(Base):
    """OAuth provider link for a user (Phase 2)."""
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider = Column(String(50), nullable=False, index=True)  # google | github | facebook
    provider_account_id = Column(String(255), nullable=False, index=True)
    access_token = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="social_accounts")

    class Config:
        from_attributes = True
