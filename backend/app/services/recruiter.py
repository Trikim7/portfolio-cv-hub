"""Recruiter business logic services"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import uuid
from app.repositories.recruiter import CompanyRepository, JobInvitationRepository
from app.repositories.candidate import CandidateProfileRepository
from app.models.recruiter import CompanyStatus
from app.schemas.recruiter import CompanyRegister, CompanyUpdate, CandidateSearchResult


class RecruiterService:
    """Recruiter company management"""

    @staticmethod
    def register_company(
        db: Session, user_id: int, company_data: CompanyRegister
    ):
        """Register new company (pending admin approval)"""
        slug = (
            company_data.company_name.lower()
            .replace(" ", "-")
            .replace(".", "")
            + f"-{uuid.uuid4().hex[:6]}"
        )
        return CompanyRepository.create_company(
            db,
            user_id=user_id,
            company_name=company_data.company_name,
            company_slug=slug,
            website=company_data.website,
            description=company_data.description,
            location=company_data.location,
            email=company_data.email,
            phone=company_data.phone,
            status=CompanyStatus.PENDING,
        )

    @staticmethod
    def get_profile(db: Session, user_id: int):
        """Get company profile"""
        return CompanyRepository.get_by_user_id(db, user_id)

    @staticmethod
    def update_profile(db: Session, company_id: int, company_data: CompanyUpdate):
        """Update company information"""
        update_dict = company_data.dict(exclude_unset=True)
        return CompanyRepository.update(db, company_id, **update_dict)


class SearchService:
    """Candidate search and filter"""

    @staticmethod
    def search(
        db: Session,
        keyword: Optional[str] = None,
        skill: Optional[str] = None,
        experience_level: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 20,
    ) -> List:
        """Search public candidates with filters"""
        from app.models.candidate import CandidateProfile, Skill, Experience
        from sqlalchemy import cast, String as SAString
        from datetime import datetime

        query = db.query(CandidateProfile).filter(CandidateProfile.is_public == True)  # noqa: E712

        if keyword:
            keyword_filter = f"%{keyword}%"
            from sqlalchemy import exists
            # Search across: full_name, headline, bio (JSONB cast), AND skill names
            skill_subq = exists().where(
                (Skill.candidate_id == CandidateProfile.id)
                & Skill.name.ilike(keyword_filter)
            )
            query = query.filter(
                (CandidateProfile.full_name.ilike(keyword_filter))
                | (CandidateProfile.headline.ilike(keyword_filter))
                | (cast(CandidateProfile.bio, SAString).ilike(keyword_filter))
                | skill_subq
            )

        if skill:
            skill_filter = f"%{skill}%"
            query = query.join(Skill).filter(Skill.name.ilike(skill_filter)).distinct()

        # Filter by experience level based on years of work
        if experience_level:
            from app.models.candidate import ExperienceLevel
            now = datetime.utcnow()
            
            # Join with Experiences to calculate total years
            query = query.outerjoin(Experience).group_by(CandidateProfile.id)
            
            if experience_level.lower() == "fresher":
                # 0-1 year
                query = query.having(
                    (func.sum(
                        func.extract('epoch', 
                            func.coalesce(Experience.end_date, now) - Experience.start_date
                        ) / (365.25 * 24 * 3600)
                    ) < 1) | (func.count(Experience.id) == 0)
                )
            elif experience_level.lower() == "junior":
                # 1-3 years
                query = query.having(
                    (func.sum(
                        func.extract('epoch', 
                            func.coalesce(Experience.end_date, now) - Experience.start_date
                        ) / (365.25 * 24 * 3600)
                    ).between(1, 3))
                )
            elif experience_level.lower() == "mid":
                # 3-5 years
                query = query.having(
                    (func.sum(
                        func.extract('epoch', 
                            func.coalesce(Experience.end_date, now) - Experience.start_date
                        ) / (365.25 * 24 * 3600)
                    ).between(3, 5))
                )
            elif experience_level.lower() == "senior":
                # 5+ years
                query = query.having(
                    (func.sum(
                        func.extract('epoch', 
                            func.coalesce(Experience.end_date, now) - Experience.start_date
                        ) / (365.25 * 24 * 3600)
                    ) >= 5)
                )

        # Filter by location (if CandidateProfile has location field, otherwise skip)
        if location:
            if hasattr(CandidateProfile, 'location'):
                location_filter = f"%{location}%"
                query = query.filter(CandidateProfile.location.ilike(location_filter))

        return query.limit(limit).all()

    @staticmethod
    def format_result(profile) -> CandidateSearchResult:
        """Format candidate profile for search"""
        skills = [skill.name for skill in profile.skills]
        return CandidateSearchResult(
            id=profile.id,
            user_id=profile.user_id,
            full_name=profile.full_name,
            headline=profile.headline,
            bio=profile.bio,
            public_slug=profile.public_slug,
            avatar_url=profile.avatar_url,
            skills=skills,
        )


class JobInvitationService:
    """Job invitation management"""

    @staticmethod
    def send(
        db: Session,
        company_id: int,
        candidate_id: int,
        job_title: str,
        message: Optional[str] = None,
    ):
        """Send job invitation"""
        company = CompanyRepository.get_by_id(db, company_id)
        if not company or company.status != CompanyStatus.APPROVED:
            raise ValueError("Company not found or not approved")

        candidate = CandidateProfileRepository.get_profile_by_id(db, candidate_id)
        if not candidate:
            raise ValueError("Candidate not found")

        if JobInvitationRepository.check_duplicate(db, company_id, candidate_id):
            raise ValueError("Invitation already sent")

        return JobInvitationRepository.create(
            db, company_id, candidate_id, job_title, message
        )

    @staticmethod
    def get_company_invitations(db: Session, company_id: int):
        """Get invitations sent by company"""
        return JobInvitationRepository.get_by_company(db, company_id)

    @staticmethod
    def get_candidate_invitations(db: Session, candidate_id: int):
        """Get invitations for candidate"""
        return JobInvitationRepository.get_by_candidate(db, candidate_id)

    @staticmethod
    def update_status(db: Session, invitation_id: int, status: str):
        """Update invitation status"""
        return JobInvitationRepository.update(db, invitation_id, status=status)

    @staticmethod
    def delete(db: Session, invitation_id: int) -> bool:
        """Delete invitation"""
        return JobInvitationRepository.delete(db, invitation_id)
