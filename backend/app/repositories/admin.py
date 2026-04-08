"""Admin data access layer"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.models.user import User, UserRole
from app.models.recruiter import Company, CompanyStatus, JobInvitation
from app.models.candidate import CandidateProfile


class AdminRepository:
    """Admin data access layer — only queries, no business logic"""

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
        """Get paginated list of users with optional filters"""
        query = db.query(User).options(joinedload(User.company_profile))

        if role:
            try:
                query = query.filter(User.role == UserRole(role))
            except (ValueError, KeyError):
                pass

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

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
        """Count users with optional filters"""
        query = db.query(func.count(User.id))

        if role:
            try:
                query = query.filter(User.role == UserRole(role))
            except (ValueError, KeyError):
                pass

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search:
            query = query.filter(User.email.ilike(f"%{search}%"))

        return query.scalar()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def toggle_user_active(db: Session, user_id: int, is_active: bool) -> Optional[User]:
        """Lock / unlock user account"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        user.is_active = is_active
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
        """Get paginated companies with optional filters"""
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
        """Count companies with optional filters"""
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
        """Get company by ID"""
        return db.query(Company).filter(Company.id == company_id).first()

    @staticmethod
    def update_company_status(
        db: Session, company_id: int, new_status: CompanyStatus
    ) -> Optional[Company]:
        """Update company approval status"""
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
        """Get platform‑wide statistics for admin dashboard"""
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
            .filter(CandidateProfile.is_public == True)
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
