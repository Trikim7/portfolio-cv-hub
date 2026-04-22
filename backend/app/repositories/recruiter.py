"""Recruiter data access layer"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.recruiter import Company, JobInvitation, JobRequirement, CompanyStatus


class CompanyRepository:
    """Company data access layer"""

    @staticmethod
    def create_company(
        db: Session, user_id: int, company_name: str, company_slug: str, **kwargs
    ) -> Company:
        """Create new company"""
        company = Company(
            user_id=user_id,
            company_name=company_name,
            company_slug=company_slug,
            **kwargs
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        return company

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> Optional[Company]:
        """Get company by user ID"""
        return db.query(Company).filter(Company.user_id == user_id).first()

    @staticmethod
    def get_by_id(db: Session, company_id: int) -> Optional[Company]:
        """Get company by ID"""
        return db.query(Company).filter(Company.id == company_id).first()

    @staticmethod
    def update(db: Session, company_id: int, **kwargs) -> Optional[Company]:
        """Update company"""
        company = CompanyRepository.get_by_id(db, company_id)
        if not company:
            return None
        for key, value in kwargs.items():
            if hasattr(company, key):
                setattr(company, key, value)
        db.commit()
        db.refresh(company)
        return company


class JobInvitationRepository:
    """Job invitation data access layer"""

    @staticmethod
    def create(
        db: Session,
        company_id: int,
        candidate_id: int,
        job_title: str,
        message: Optional[str] = None,
    ) -> JobInvitation:
        """Create new job invitation"""
        invitation = JobInvitation(
            company_id=company_id,
            candidate_id=candidate_id,
            job_title=job_title,
            message=message,
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
        return invitation

    @staticmethod
    def get_by_id(db: Session, invitation_id: int) -> Optional[JobInvitation]:
        """Get invitation by ID"""
        return db.query(JobInvitation).filter(JobInvitation.id == invitation_id).first()

    @staticmethod
    def get_by_company(db: Session, company_id: int) -> List[JobInvitation]:
        """Get all invitations sent by company"""
        return db.query(JobInvitation).filter(JobInvitation.company_id == company_id).all()

    @staticmethod
    def get_by_candidate(db: Session, candidate_id: int) -> List[JobInvitation]:
        """Get all invitations received by candidate"""
        return db.query(JobInvitation).filter(JobInvitation.candidate_id == candidate_id).all()

    @staticmethod
    def check_duplicate(db: Session, company_id: int, candidate_id: int, job_title: str = "") -> bool:
        """Check if an active (pending) invitation already exists for this company+candidate+job."""
        from app.models.recruiter import InvitationStatus
        query = db.query(JobInvitation).filter(
            JobInvitation.company_id == company_id,
            JobInvitation.candidate_id == candidate_id,
            JobInvitation.status == InvitationStatus.PENDING,
        )
        # If a job_title is provided, also check same position to avoid exact duplicates
        if job_title:
            query = query.filter(JobInvitation.job_title == job_title)
        return query.first() is not None

    @staticmethod
    def update(db: Session, invitation_id: int, **kwargs) -> Optional[JobInvitation]:
        """Update invitation"""
        invitation = JobInvitationRepository.get_by_id(db, invitation_id)
        if not invitation:
            return None
        for key, value in kwargs.items():
            if hasattr(invitation, key):
                setattr(invitation, key, value)
        db.commit()
        db.refresh(invitation)
        return invitation

    @staticmethod
    def delete(db: Session, invitation_id: int) -> bool:
        """Delete invitation"""
        invitation = JobInvitationRepository.get_by_id(db, invitation_id)
        if not invitation:
            return False
        db.delete(invitation)
        db.commit()
        return True


class JobRequirementRepository:
    """Job requirement (hiring criteria) data access layer"""

    @staticmethod
    def create(
        db: Session,
        company_id: int,
        title: str,
        required_skills: list,
        **kwargs
    ) -> JobRequirement:
        """Create new job requirement"""
        job_req = JobRequirement(
            company_id=company_id,
            title=title,
            required_skills=required_skills,
            **kwargs
        )
        db.add(job_req)
        db.commit()
        db.refresh(job_req)
        return job_req

    @staticmethod
    def get_by_id(db: Session, job_requirement_id: int) -> Optional[JobRequirement]:
        """Get job requirement by ID"""
        return db.query(JobRequirement).filter(JobRequirement.id == job_requirement_id).first()

    @staticmethod
    def get_by_company(db: Session, company_id: int, active_only: bool = False) -> List[JobRequirement]:
        """Get all job requirements for a company"""
        query = db.query(JobRequirement).filter(JobRequirement.company_id == company_id)
        if active_only:
            query = query.filter(JobRequirement.is_active == True)
        return query.order_by(JobRequirement.created_at.desc()).all()

    @staticmethod
    def list_all(db: Session, active_only: bool = True, limit: int = 100, offset: int = 0) -> List[JobRequirement]:
        """List all job requirements (for admin/public view)"""
        query = db.query(JobRequirement)
        if active_only:
            query = query.filter(JobRequirement.is_active == True)
        return query.order_by(JobRequirement.created_at.desc()).limit(limit).offset(offset).all()

    @staticmethod
    def update(db: Session, job_requirement_id: int, **kwargs) -> Optional[JobRequirement]:
        """Update job requirement"""
        job_req = JobRequirementRepository.get_by_id(db, job_requirement_id)
        if not job_req:
            return None
        for key, value in kwargs.items():
            if hasattr(job_req, key) and value is not None:
                setattr(job_req, key, value)
        db.commit()
        db.refresh(job_req)
        return job_req

    @staticmethod
    def delete(db: Session, job_requirement_id: int) -> bool:
        """Delete job requirement"""
        job_req = JobRequirementRepository.get_by_id(db, job_requirement_id)
        if not job_req:
            return False
        db.delete(job_req)
        db.commit()
        return True

    @staticmethod
    def deactivate(db: Session, job_requirement_id: int) -> Optional[JobRequirement]:
        """Soft delete: mark as inactive instead of hard delete"""
        return JobRequirementRepository.update(db, job_requirement_id, is_active=False)
