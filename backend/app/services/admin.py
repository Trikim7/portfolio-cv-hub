"""Admin business‑logic service"""
from sqlalchemy.orm import Session
from typing import Optional
from app.repositories.admin import AdminRepository
from app.models.user import User, UserRole
from app.models.recruiter import CompanyStatus


class AdminService:
    """Admin business logic — enforces role check + delegates to repository"""

    # ─── Auth guard ────────────────────────────────────────────────
    @staticmethod
    def _require_admin(user: User) -> None:
        """Raise if user is not admin"""
        if user.role != UserRole.ADMIN:
            raise PermissionError("Chỉ Admin mới có quyền truy cập")

    # ─── Dashboard ─────────────────────────────────────────────────
    @staticmethod
    def get_dashboard_stats(db: Session, current_user: User) -> dict:
        AdminService._require_admin(current_user)
        return AdminRepository.get_stats(db)

    # ─── User management ──────────────────────────────────────────
    @staticmethod
    def list_users(
        db: Session,
        current_user: User,
        page: int = 1,
        page_size: int = 20,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ):
        AdminService._require_admin(current_user)
        skip = (page - 1) * page_size
        users_raw = AdminRepository.get_all_users(
            db, skip=skip, limit=page_size, role=role, is_active=is_active, search=search
        )
        total = AdminRepository.count_users(db, role=role, is_active=is_active, search=search)

        users = []
        for u in users_raw:
            users.append({
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "company_status": (
                    u.company_profile.status.value
                    if u.role == UserRole.RECRUITER and u.company_profile
                    else None
                ),
                "created_at": u.created_at,
                "updated_at": u.updated_at,
            })

        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def toggle_user_active(
        db: Session, current_user: User, user_id: int, is_active: bool
    ) -> User:
        AdminService._require_admin(current_user)
        if current_user.id == user_id:
            raise ValueError("Không thể khóa chính tài khoản của bạn")

        user = AdminRepository.toggle_user_active(db, user_id, is_active)
        if not user:
            raise ValueError(f"Không tìm thấy user ID {user_id}")
            
        # Sync with company status if user is a recruiter
        if user.role == UserRole.RECRUITER and user.company_profile:
            new_status = CompanyStatus.APPROVED if is_active else CompanyStatus.SUSPENDED
            AdminRepository.update_company_status(db, user.company_profile.id, new_status)
            
        return user

    # ─── Company management ────────────────────────────────────────
    @staticmethod
    def list_companies(
        db: Session,
        current_user: User,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ):
        AdminService._require_admin(current_user)
        skip = (page - 1) * page_size
        companies = AdminRepository.get_companies(
            db, skip=skip, limit=page_size, status=status, search=search
        )
        total = AdminRepository.count_companies(db, status=status, search=search)
        return {
            "companies": companies,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    def update_company_status(
        db: Session, current_user: User, company_id: int, new_status_str: str
    ):
        AdminService._require_admin(current_user)

        allowed = {"approved", "rejected", "suspended"}
        if new_status_str not in allowed:
            raise ValueError(f"Trạng thái không hợp lệ. Chọn: {', '.join(allowed)}")

        new_status = CompanyStatus(new_status_str)
        company = AdminRepository.update_company_status(db, company_id, new_status)
        if not company:
            raise ValueError(f"Không tìm thấy company ID {company_id}")
            
        # Sync with user is_active
        is_active = new_status_str == "approved"
        AdminRepository.toggle_user_active(db, company.user_id, is_active)
            
        return company
