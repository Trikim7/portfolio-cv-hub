"""Admin API routes — all endpoints require role=admin"""
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.services.auth import AuthService
from app.services.admin import AdminService
from app.schemas.admin import (
    DashboardStats,
    AdminUserListResponse,
    AdminUserResponse,
    ToggleActiveRequest,
    AdminCompanyListResponse,
    AdminCompanyResponse,
    CompanyStatusUpdate,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Helper: extract current admin user from token ─────────────
def _get_admin_user(authorization: str, db: Session):
    """Parse Bearer token and return User object"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
        )
    token = authorization.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return user


# ─── Dashboard stats ──────────────────────────────────────────
@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Get platform-wide statistics for admin dashboard"""
    user = _get_admin_user(authorization, db)
    try:
        stats = AdminService.get_dashboard_stats(db, user)
        return stats
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


# ─── User management ──────────────────────────────────────────
@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """List all users with pagination + filters"""
    user = _get_admin_user(authorization, db)
    try:
        result = AdminService.list_users(
            db, user, page=page, page_size=page_size,
            role=role, is_active=is_active, search=search,
        )
        return result
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/users/{user_id}/toggle-active", response_model=AdminUserResponse)
async def toggle_user_active(
    user_id: int,
    body: ToggleActiveRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Lock or unlock a user account"""
    admin = _get_admin_user(authorization, db)
    try:
        updated = AdminService.toggle_user_active(db, admin, user_id, body.is_active)
        return updated
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ─── Company management ───────────────────────────────────────
@router.get("/companies", response_model=AdminCompanyListResponse)
async def list_companies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """List all companies with pagination + filters"""
    user = _get_admin_user(authorization, db)
    try:
        result = AdminService.list_companies(
            db, user, page=page, page_size=page_size,
            status=status_filter, search=search,
        )
        return result
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.put("/companies/{company_id}/status", response_model=AdminCompanyResponse)
async def update_company_status(
    company_id: int,
    body: CompanyStatusUpdate,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Approve / reject / suspend a company"""
    user = _get_admin_user(authorization, db)
    try:
        updated = AdminService.update_company_status(db, user, company_id, body.status)
        return updated
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
