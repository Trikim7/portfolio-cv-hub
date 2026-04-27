"""Admin API routes — all endpoints require role=admin"""
import json
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


def _require_admin_role(authorization: str, db: Session):
    """Parse bearer token and enforce admin role."""
    user = _get_admin_user(authorization, db)
    AdminService._require_admin(user)
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
    """Approve / reject / suspend a company — also triggers email notification."""
    user = _get_admin_user(authorization, db)
    try:
        updated = AdminService.update_company_status(db, user, company_id, body.status)

        # ── Email notification ──────────────────────────────────
        try:
            from app.services.email import EmailService
            from app.models.user import User as UserModel

            recruiter_user = db.query(UserModel).filter(
                UserModel.id == updated.user_id
            ).first()
            if recruiter_user and recruiter_user.email:
                if body.status == "approved":
                    EmailService.notify_company_approved(
                        company_email=recruiter_user.email,
                        company_name=updated.company_name,
                    )
                elif body.status == "rejected":
                    EmailService.notify_company_rejected(
                        company_email=recruiter_user.email,
                        company_name=updated.company_name,
                    )
        except Exception as email_err:
            import logging
            logging.getLogger(__name__).warning("Email notification failed: %s", email_err)
        # ───────────────────────────────────────────────────────

        return updated
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ─── SMTP Settings ────────────────────────────────────────────
from pydantic import BaseModel

class SmtpConfig(BaseModel):
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    smtp_from_address: str = "noreply@portfoliocvhub.com"
    smtp_enabled: bool = True


class RankingWeightsConfig(BaseModel):
    technical_skills: float
    experience: float
    portfolio: float
    soft_skills: float
    leadership: float
    readiness_signals: float


RANKING_WEIGHTS_KEY = "ai_ranking_weights"
DEFAULT_RANKING_WEIGHTS = {
    "technical_skills": 25,
    "experience": 25,
    "portfolio": 20,
    "soft_skills": 10,
    "leadership": 10,
    "readiness_signals": 10,
}


@router.post("/settings/smtp")
async def save_smtp_config(
    config: SmtpConfig,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Save SMTP configuration at runtime (updates in-memory settings singleton)."""
    _require_admin_role(authorization, db)
    from app.core.config import settings
    settings.smtp_host = config.smtp_host
    settings.smtp_port = config.smtp_port
    settings.smtp_username = config.smtp_username
    settings.smtp_password = config.smtp_password
    settings.smtp_from_address = config.smtp_from_address
    settings.smtp_enabled = config.smtp_enabled
    return {"message": "Đã lưu cấu hình SMTP thành công", "smtp_enabled": settings.smtp_enabled}


@router.get("/settings/ranking-weights")
async def get_ranking_weights_config(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Get persisted AI ranking weights for admin settings page."""
    _require_admin_role(authorization, db)
    from app.models.admin_config import SystemSetting

    row = db.query(SystemSetting).filter(SystemSetting.key == RANKING_WEIGHTS_KEY).first()
    if not row or not row.value:
        return DEFAULT_RANKING_WEIGHTS

    try:
        payload = json.loads(row.value)
        return {
            "technical_skills": float(payload.get("technical_skills", 25)),
            "experience": float(payload.get("experience", 25)),
            "portfolio": float(payload.get("portfolio", 20)),
            "soft_skills": float(payload.get("soft_skills", 10)),
            "leadership": float(payload.get("leadership", 10)),
            "readiness_signals": float(payload.get("readiness_signals", 10)),
        }
    except Exception:
        return DEFAULT_RANKING_WEIGHTS


@router.post("/settings/ranking-weights")
async def save_ranking_weights_config(
    config: RankingWeightsConfig,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Persist AI ranking weights (sum must be 100)."""
    _require_admin_role(authorization, db)
    from app.models.admin_config import SystemSetting

    payload = {
        "technical_skills": float(config.technical_skills),
        "experience": float(config.experience),
        "portfolio": float(config.portfolio),
        "soft_skills": float(config.soft_skills),
        "leadership": float(config.leadership),
        "readiness_signals": float(config.readiness_signals),
    }

    total = sum(payload.values())
    if abs(total - 100) > 1e-6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tổng trọng số phải bằng 100",
        )

    row = db.query(SystemSetting).filter(SystemSetting.key == RANKING_WEIGHTS_KEY).first()
    if row:
        row.value = json.dumps(payload)
    else:
        row = SystemSetting(
            key=RANKING_WEIGHTS_KEY,
            value=json.dumps(payload),
            description="AI ranking weights in percent",
        )
        db.add(row)
    db.commit()

    return {"message": "Đã lưu trọng số AI Ranking", "weights": payload}


@router.get("/settings/smtp")
async def get_smtp_config(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Return current SMTP configuration (password masked)."""
    _require_admin_role(authorization, db)
    from app.core.config import settings
    return {
        "smtp_host": settings.smtp_host,
        "smtp_port": settings.smtp_port,
        "smtp_username": settings.smtp_username or "",
        "smtp_password": "••••••••" if settings.smtp_password else "",
        "smtp_from_address": settings.smtp_from_address,
        "smtp_enabled": settings.smtp_enabled,
    }


@router.post("/settings/smtp/test")
async def test_smtp_connection(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Test current SMTP connection."""
    _require_admin_role(authorization, db)
    from app.services.email import EmailService
    result = await EmailService.test_connection()
    if result["success"]:
        return result
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["message"])


# ─── Template Management ────────────────────────────────────────────────────

@router.get("/templates")
def list_templates(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """List all portfolio templates (admin view)."""
    _require_admin_role(authorization, db)
    from app.models.admin_config import Template
    templates = db.query(Template).order_by(Template.created_at).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "config_json": t.config_json,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in templates
    ]


@router.get("/templates/public")
def list_active_templates(db: Session = Depends(get_db)):
    """List only ACTIVE templates — used by candidate theme picker & portfolio page."""
    from app.models.admin_config import Template, TemplateStatus
    templates = db.query(Template).filter(
        Template.status == TemplateStatus.ACTIVE
    ).order_by(Template.created_at).all()
    return [
        {"id": t.id, "name": t.name, "description": t.description, "config_json": t.config_json}
        for t in templates
    ]


@router.post("/templates", status_code=201)
def create_template(
    body: dict,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Create a new portfolio template."""
    _require_admin_role(authorization, db)
    from app.models.admin_config import Template, TemplateStatus
    from datetime import datetime
    tpl = Template(
        name=body.get("name", "New Template"),
        description=body.get("description", ""),
        config_json=body.get("config_json", {"theme": "light", "primaryColor": "#3b5bdb"}),
        status=TemplateStatus.ACTIVE,
        created_at=datetime.utcnow(),
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return {"id": tpl.id, "name": tpl.name, "description": tpl.description,
            "config_json": tpl.config_json, "status": tpl.status}


@router.put("/templates/{template_id}")
def update_template(
    template_id: int,
    body: dict,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Update template fields."""
    _require_admin_role(authorization, db)
    from app.models.admin_config import Template
    tpl = db.query(Template).filter(Template.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template không tồn tại")
    for field in ("name", "description", "config_json", "status"):
        if field in body:
            setattr(tpl, field, body[field])
    db.commit()
    db.refresh(tpl)
    return {"id": tpl.id, "name": tpl.name, "description": tpl.description,
            "config_json": tpl.config_json, "status": tpl.status}


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Delete a portfolio template."""
    user = _get_admin_user(authorization, db)
    from app.services.admin import AdminService
    AdminService._require_admin(user)
    
    from app.models.admin_config import Template
    tpl = db.query(Template).filter(Template.id == template_id).first()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template không tồn tại")
    db.delete(tpl)
    db.commit()
    return {"message": f"Đã xóa template '{tpl.name}'"}


# ─── Data Tools (Seed / Reset) ────────────────────────────────────────────────

@router.post("/tools/seed-demo")
async def seed_demo_data(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Populate database with sample data (Phase 2)."""
    user = _get_admin_user(authorization, db)
    from app.services.admin import AdminService
    AdminService._require_admin(user)
    
    from app.db.seed import (
        seed_templates, seed_system_settings, seed_recruiters, 
        seed_candidates, seed_job_requirements
    )
    
    try:
        # 1. Templates & Settings
        templates = seed_templates(db)
        seed_system_settings(db)
        
        # 2. Recruiters & Companies
        recruiter_pairs = seed_recruiters(db)
        companies = [p[1] for p in recruiter_pairs]
        
        # 3. Candidates
        seed_candidates(db, templates, companies, count=95)
        
        # 4. Job Requirements
        seed_job_requirements(db, companies)
        
        db.commit()
        return {"message": "Dữ liệu mẫu đã được nạp thành công!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi nạp dữ liệu: {str(e)}")


@router.post("/tools/reset-db")
async def reset_demo_database(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    """Clear all non-admin data from the database."""
    user = _get_admin_user(authorization, db)
    from app.services.admin import AdminService
    AdminService._require_admin(user)
    
    from app.models.user import User, UserRole
    from sqlalchemy import delete
    
    try:
        # Delete all users EXCEPT the current admin (and other admins)
        # Cascade delete should handle profiles, experiences, projects, etc.
        db.execute(delete(User).where(User.role != UserRole.ADMIN))
        
        # Also clear system-wide tables that might not be linked to a specific non-admin user
        from app.models.admin_config import Template, SystemSetting
        db.execute(delete(Template))
        db.execute(delete(SystemSetting))
        
        db.commit()
        return {"message": "Đã xóa toàn bộ dữ liệu mẫu. Hệ thống đã sẵn sàng nạp lại."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa dữ liệu: {str(e)}")
