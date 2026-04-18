"""Admin-scoped configuration models: Template, SystemSetting (Phase 2)."""
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from enum import Enum
from app.db.database import Base


class TemplateStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Template(Base):
    """Portfolio/CV template definitions."""
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    config_json = Column(JSONB, nullable=True)  # colors, layout, fonts, etc.
    status = Column(
        SQLEnum(TemplateStatus), default=TemplateStatus.ACTIVE, nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    class Config:
        from_attributes = True


class SystemSetting(Base):
    """Key/value runtime settings, admin-managed."""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    class Config:
        from_attributes = True
