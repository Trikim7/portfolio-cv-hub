"""Recruiter data access layer"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.recruiter import Company, JobInvitation, CompanyStatus


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
    def check_duplicate(db: Session, company_id: int, candidate_id: int) -> bool:
        """Check if invitation already exists"""
        existing = db.query(JobInvitation).filter(
            JobInvitation.company_id == company_id,
            JobInvitation.candidate_id == candidate_id,
        ).first()
        return existing is not None

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
