"""Admin schemas (Phase 2)."""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.user import UserRole, UserStatus


class DashboardStats(BaseModel):
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_companies: int
    pending_companies: int
    approved_companies: int
    public_profiles: int
    total_invitations: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    status: UserStatus
    # Derived from status for clients still polling the boolean.
    is_active: bool
    company_status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    users: List[AdminUserResponse]
    total: int
    page: int
    page_size: int


class ToggleActiveRequest(BaseModel):
    """Lock / unlock user (boolean kept for backward-compat with the admin UI)."""
    is_active: bool


class AdminCompanyResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    company_name: str
    company_slug: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminCompanyListResponse(BaseModel):
    companies: List[AdminCompanyResponse]
    total: int
    page: int
    page_size: int


class CompanyStatusUpdate(BaseModel):
    status: str  # approved | rejected | suspended
