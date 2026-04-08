"""Candidate portfolio service"""
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid
from app.repositories.candidate import (
    CandidateProfileRepository, SkillRepository, ExperienceRepository, 
    ProjectRepository, CVRepository
)
from app.repositories.user import UserRepository
from app.models.candidate import CandidateProfile, Skill, Experience, Project, CV
from app.schemas.candidate import (
    CandidateProfileCreate, CandidateProfileUpdate, SkillCreate, SkillUpdate,
    ExperienceCreate, ExperienceUpdate, ProjectCreate, ProjectUpdate
)


class CandidateService:
    """Candidate portfolio business logic"""

    @staticmethod
    def create_profile(db: Session, user_id: int, profile_data: CandidateProfileCreate) -> CandidateProfile:
        """Create candidate profile automatically after registration"""
        # Check if profile already exists
        existing = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if existing:
            raise ValueError(f"Profile already exists for user {user_id}")

        # Generate unique slug from user_id and uuid
        profile_slug = f"{user_id}-{uuid.uuid4().hex[:8]}"

        profile = CandidateProfileRepository.create_profile(db, user_id, profile_slug)
        return profile

    @staticmethod
    def get_my_profile(db: Session, user_id: int) -> Optional[CandidateProfile]:
        """Get candidate's own profile"""
        return CandidateProfileRepository.get_profile_by_user_id(db, user_id)

    @staticmethod
    def update_profile(db: Session, user_id: int, profile_data: CandidateProfileUpdate) -> Optional[CandidateProfile]:
        """Update candidate's profile"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        update_dict = profile_data.dict(exclude_unset=True)
        updated = CandidateProfileRepository.update_profile(db, profile.id, **update_dict)
        return updated

    @staticmethod
    def toggle_public_profile(db: Session, user_id: int, is_public: bool) -> Optional[CandidateProfile]:
        """Toggle profile public visibility"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        updated = CandidateProfileRepository.update_profile(db, profile.id, is_public=is_public)
        return updated

    @staticmethod
    def get_public_profile(db: Session, profile_slug: str) -> Optional[CandidateProfile]:
        """Get public profile by slug with user email and increment views"""
        profile = CandidateProfileRepository.get_profile_by_slug(db, profile_slug)
        if profile:
            # Increment views
            profile.views = (profile.views or 0) + 1
            db.commit()
            db.refresh(profile)
            
            if profile.user:
                # Manually attach email for response schema
                profile.contact_email = profile.user.email
        return profile

    # Skill methods
    @staticmethod
    def add_skill(db: Session, user_id: int, skill_data: SkillCreate) -> Skill:
        """Add skill to candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        skill = SkillRepository.create_skill(
            db,
            profile.id,
            skill_data.name,
            skill_data.level
        )
        return skill

    @staticmethod
    def get_skills(db: Session, user_id: int) -> List[Skill]:
        """Get all skills for candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        return SkillRepository.get_skills_by_candidate(db, profile.id)

    @staticmethod
    def update_skill(db: Session, user_id: int, skill_id: int, skill_data: SkillUpdate) -> Optional[Skill]:
        """Update candidate's skill"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill or skill.candidate_id != profile.id:
            raise ValueError(f"Skill not found or unauthorized")

        update_dict = skill_data.dict(exclude_unset=True)
        updated = SkillRepository.update_skill(db, skill_id, **update_dict)
        return updated

    @staticmethod
    def delete_skill(db: Session, user_id: int, skill_id: int) -> bool:
        """Delete candidate's skill"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill or skill.candidate_id != profile.id:
            raise ValueError(f"Skill not found or unauthorized")

        return SkillRepository.delete_skill(db, skill_id)

    # Experience methods
    @staticmethod
    def add_experience(db: Session, user_id: int, exp_data: ExperienceCreate) -> Experience:
        """Add work experience to candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        experience = ExperienceRepository.create_experience(
            db,
            profile.id,
            exp_data.job_title,
            exp_data.company_name,
            exp_data.start_date,
            exp_data.end_date,
            exp_data.is_current,
            exp_data.description
        )
        return experience

    @staticmethod
    def get_experiences(db: Session, user_id: int) -> List[Experience]:
        """Get all experiences for candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        return ExperienceRepository.get_experiences_by_candidate(db, profile.id)

    @staticmethod
    def update_experience(db: Session, user_id: int, exp_id: int, exp_data: ExperienceUpdate) -> Optional[Experience]:
        """Update candidate's experience"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        experience = ExperienceRepository.get_experience_by_id(db, exp_id)
        if not experience or experience.candidate_id != profile.id:
            raise ValueError(f"Experience not found or unauthorized")

        update_dict = exp_data.dict(exclude_unset=True)
        updated = ExperienceRepository.update_experience(db, exp_id, **update_dict)
        return updated

    @staticmethod
    def delete_experience(db: Session, user_id: int, exp_id: int) -> bool:
        """Delete candidate's experience"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        experience = ExperienceRepository.get_experience_by_id(db, exp_id)
        if not experience or experience.candidate_id != profile.id:
            raise ValueError(f"Experience not found or unauthorized")

        return ExperienceRepository.delete_experience(db, exp_id)

    # Project methods
    @staticmethod
    def add_project(db: Session, user_id: int, proj_data: ProjectCreate) -> Project:
        """Add project to candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        project = ProjectRepository.create_project(
            db,
            profile.id,
            proj_data.title,
            proj_data.description,
            proj_data.url,
            proj_data.technologies
        )
        return project

    @staticmethod
    def get_projects(db: Session, user_id: int) -> List[Project]:
        """Get all projects for candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        return ProjectRepository.get_projects_by_candidate(db, profile.id)

    @staticmethod
    def update_project(db: Session, user_id: int, proj_id: int, proj_data: ProjectUpdate) -> Optional[Project]:
        """Update candidate's project"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        project = ProjectRepository.get_project_by_id(db, proj_id)
        if not project or project.candidate_id != profile.id:
            raise ValueError(f"Project not found or unauthorized")

        update_dict = proj_data.dict(exclude_unset=True)
        updated = ProjectRepository.update_project(db, proj_id, **update_dict)
        return updated

    @staticmethod
    def delete_project(db: Session, user_id: int, proj_id: int) -> bool:
        """Delete candidate's project"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        project = ProjectRepository.get_project_by_id(db, proj_id)
        if not project or project.candidate_id != profile.id:
            raise ValueError(f"Project not found or unauthorized")

        return ProjectRepository.delete_project(db, proj_id)

    # CV methods
    @staticmethod
    def add_cv(db: Session, user_id: int, file_name: str, file_path: str, file_size: int = None) -> CV:
        """Add CV file to candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv = CVRepository.create_cv(db, profile.id, file_name, file_path, file_size, is_primary=False)
        return cv

    @staticmethod
    def get_cvs(db: Session, user_id: int) -> List[CV]:
        """Get all CVs for candidate"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        return CVRepository.get_cvs_by_candidate(db, profile.id)

    @staticmethod
    def set_primary_cv(db: Session, user_id: int, cv_id: int) -> Optional[CV]:
        """Set CV as primary"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv or cv.candidate_id != profile.id:
            raise ValueError(f"CV not found or unauthorized")

        # Unset other primary CVs
        cvs = CVRepository.get_cvs_by_candidate(db, profile.id)
        for other_cv in cvs:
            if other_cv.id != cv_id and other_cv.is_primary:
                CVRepository.update_cv(db, other_cv.id, is_primary=False)

        # Set this CV as primary
        updated = CVRepository.update_cv(db, cv_id, is_primary=True)
        return updated

    @staticmethod
    def delete_cv(db: Session, user_id: int, cv_id: int) -> bool:
        """Delete candidate's CV"""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv or cv.candidate_id != profile.id:
            raise ValueError(f"CV not found or unauthorized")

        return CVRepository.delete_cv(db, cv_id)
