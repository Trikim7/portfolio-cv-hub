"""Admin data-access layer (Phase 2)."""
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.user import User, UserRole, UserStatus
from app.models.recruiter import Company, CompanyStatus, JobInvitation
from app.models.candidate import CandidateProfile


def _status_from_flag(is_active: bool) -> UserStatus:
    return UserStatus.ACTIVE if is_active else UserStatus.LOCKED


class AdminRepository:
    """Admin data-access layer — queries only, no business logic."""

    # ─── User queries ──────────────────────────────────────────────
    @staticmethod
    def get_all_users(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> List[User]:
        query = db.query(User).options(joinedload(User.company_profile))

        if role:
            try:
                query = query.filter(User.role == UserRole(role))
            except (ValueError, KeyError):
                pass

        if is_active is not None:
            query = query.filter(User.status == _status_from_flag(is_active))

        if search:
            query = query.filter(User.email.ilike(f"%{search}%"))

        return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def count_users(
        db: Session,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> int:
        query = db.query(func.count(User.id))

        if role:
            try:
                query = query.filter(User.role == UserRole(role))
            except (ValueError, KeyError):
                pass

        if is_active is not None:
            query = query.filter(User.status == _status_from_flag(is_active))

        if search:
            query = query.filter(User.email.ilike(f"%{search}%"))

        return query.scalar()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def toggle_user_active(db: Session, user_id: int, is_active: bool) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.status = _status_from_flag(is_active)
        db.commit()
        db.refresh(user)
        return user

    # ─── Company queries ───────────────────────────────────────────
    @staticmethod
    def get_companies(
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Company]:
        query = db.query(Company)

        if status:
            try:
                query = query.filter(Company.status == CompanyStatus(status))
            except (ValueError, KeyError):
                pass

        if search:
            query = query.filter(Company.company_name.ilike(f"%{search}%"))

        return query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def count_companies(
        db: Session,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> int:
        query = db.query(func.count(Company.id))

        if status:
            try:
                query = query.filter(Company.status == CompanyStatus(status))
            except (ValueError, KeyError):
                pass

        if search:
            query = query.filter(Company.company_name.ilike(f"%{search}%"))

        return query.scalar()

    @staticmethod
    def get_company_by_id(db: Session, company_id: int) -> Optional[Company]:
        return db.query(Company).filter(Company.id == company_id).first()

    @staticmethod
    def update_company_status(
        db: Session, company_id: int, new_status: CompanyStatus
    ) -> Optional[Company]:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return None
        company.status = new_status
        db.commit()
        db.refresh(company)
        return company

    # ─── Dashboard statistics ──────────────────────────────────────
    @staticmethod
    def get_stats(db: Session) -> dict:
        total_users = db.query(func.count(User.id)).scalar()
        total_candidates = (
            db.query(func.count(User.id))
            .filter(User.role == UserRole.CANDIDATE)
            .scalar()
        )
        total_recruiters = (
            db.query(func.count(User.id))
            .filter(User.role == UserRole.RECRUITER)
            .join(Company, Company.user_id == User.id)
            .filter(Company.status == CompanyStatus.APPROVED)
            .scalar()
        )
        total_companies = db.query(func.count(Company.id)).scalar()
        pending_companies = (
            db.query(func.count(Company.id))
            .filter(Company.status == CompanyStatus.PENDING)
            .scalar()
        )
        approved_companies = (
            db.query(func.count(Company.id))
            .filter(Company.status == CompanyStatus.APPROVED)
            .scalar()
        )
        public_profiles = (
            db.query(func.count(CandidateProfile.id))
            .filter(CandidateProfile.is_public == True)  # noqa: E712
            .scalar()
        )
        total_invitations = db.query(func.count(JobInvitation.id)).scalar()

        return {
            "total_users": total_users,
            "total_candidates": total_candidates,
            "total_recruiters": total_recruiters,
            "total_companies": total_companies,
            "pending_companies": pending_companies,
            "approved_companies": approved_companies,
            "public_profiles": public_profiles,
            "total_invitations": total_invitations,
        }
