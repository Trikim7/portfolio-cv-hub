"""Admin schemas"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.user import UserRole


# ─── Dashboard stats ──────────────────────────────────────────
class DashboardStats(BaseModel):
    """Admin dashboard overview numbers"""
    total_users: int
    total_candidates: int
    total_recruiters: int
    total_companies: int
    pending_companies: int
    approved_companies: int
    public_profiles: int
    total_invitations: int


# ─── User management ──────────────────────────────────────────
class AdminUserResponse(BaseModel):
    """User item returned for admin list"""
    id: int
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    """Paginated user list"""
    users: List[AdminUserResponse]
    total: int
    page: int
    page_size: int


class ToggleActiveRequest(BaseModel):
    """Lock / unlock user"""
    is_active: bool


# ─── Company management ───────────────────────────────────────
class AdminCompanyResponse(BaseModel):
    """Company item returned for admin list"""
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
    """Paginated company list"""
    companies: List[AdminCompanyResponse]
    total: int
    page: int
    page_size: int


class CompanyStatusUpdate(BaseModel):
    """Change company approval status"""
    status: str  # approved | rejected | suspended
