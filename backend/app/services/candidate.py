"""Candidate portfolio service (Phase 2)."""
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.analytics import ProfileView, ViewerType
from app.models.candidate import CandidateProfile, Skill, Experience, Project, CV
from app.repositories.candidate import (
    CandidateProfileRepository, SkillRepository, ExperienceRepository,
    ProjectRepository, CVRepository,
)
from app.schemas.candidate import (
    CandidateProfileCreate, CandidateProfileUpdate, SkillCreate, SkillUpdate,
    ExperienceCreate, ExperienceUpdate, ProjectCreate, ProjectUpdate,
)


class CandidateService:
    """Candidate portfolio business logic."""

    @staticmethod
    def create_profile(
        db: Session, user_id: int, profile_data: CandidateProfileCreate
    ) -> CandidateProfile:
        """Auto-create an empty portfolio after user registration."""
        if CandidateProfileRepository.get_profile_by_user_id(db, user_id):
            raise ValueError(f"Profile already exists for user {user_id}")

        public_slug = f"{user_id}-{uuid.uuid4().hex[:8]}"
        return CandidateProfileRepository.create_profile(db, user_id, public_slug)

    @staticmethod
    def get_my_profile(db: Session, user_id: int) -> Optional[CandidateProfile]:
        return CandidateProfileRepository.get_profile_by_user_id(db, user_id)

    @staticmethod
    def update_profile(
        db: Session, user_id: int, profile_data: CandidateProfileUpdate
    ) -> Optional[CandidateProfile]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        update_dict = profile_data.model_dump(exclude_unset=True)
        return CandidateProfileRepository.update_profile(db, profile.id, **update_dict)

    @staticmethod
    def toggle_public_profile(
        db: Session, user_id: int, is_public: bool
    ) -> Optional[CandidateProfile]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return CandidateProfileRepository.update_profile(db, profile.id, is_public=is_public)

    @staticmethod
    def update_avatar_url(
        db: Session, user_id: int, avatar_url: str
    ) -> Optional[CandidateProfile]:
        """Persist a new avatar_url for the candidate profile."""
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return CandidateProfileRepository.update_profile(db, profile.id, avatar_url=avatar_url)

    @staticmethod
    def get_public_profile(
        db: Session, public_slug: str, viewer_company_id: Optional[int] = None
    ) -> Optional[CandidateProfile]:
        """Return public profile by slug, log the view and bump the counter."""
        profile = CandidateProfileRepository.get_profile_by_slug(db, public_slug)
        if not profile:
            return None

        profile.views = (profile.views or 0) + 1
        view_log = ProfileView(
            candidate_id=profile.id,
            viewer_type=ViewerType.COMPANY if viewer_company_id else ViewerType.ANONYMOUS,
            company_id=viewer_company_id,
        )
        db.add(view_log)
        db.commit()
        db.refresh(profile)

        # Attach email for the response schema.
        if profile.user:
            profile.contact_email = profile.user.email
        return profile

    # ─── Skill ─────────────────────────────────────────────────────
    @staticmethod
    def add_skill(db: Session, user_id: int, skill_data: SkillCreate) -> Skill:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return SkillRepository.create_skill(
            db, profile.id, skill_data.name, skill_data.level, skill_data.category,
        )

    @staticmethod
    def get_skills(db: Session, user_id: int) -> List[Skill]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return SkillRepository.get_skills_by_candidate(db, profile.id)

    @staticmethod
    def update_skill(
        db: Session, user_id: int, skill_id: int, skill_data: SkillUpdate
    ) -> Optional[Skill]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill or skill.candidate_id != profile.id:
            raise ValueError("Skill not found or unauthorized")

        update_dict = skill_data.model_dump(exclude_unset=True)
        return SkillRepository.update_skill(db, skill_id, **update_dict)

    @staticmethod
    def delete_skill(db: Session, user_id: int, skill_id: int) -> bool:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill or skill.candidate_id != profile.id:
            raise ValueError("Skill not found or unauthorized")
        return SkillRepository.delete_skill(db, skill_id)

    # ─── Experience ────────────────────────────────────────────────
    @staticmethod
    def add_experience(db: Session, user_id: int, exp_data: ExperienceCreate) -> Experience:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return ExperienceRepository.create_experience(
            db,
            profile.id,
            exp_data.job_title,
            exp_data.company_name,
            exp_data.start_date,
            exp_data.end_date,
            exp_data.is_current,
            exp_data.description,
        )

    @staticmethod
    def get_experiences(db: Session, user_id: int) -> List[Experience]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return ExperienceRepository.get_experiences_by_candidate(db, profile.id)

    @staticmethod
    def update_experience(
        db: Session, user_id: int, exp_id: int, exp_data: ExperienceUpdate
    ) -> Optional[Experience]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        experience = ExperienceRepository.get_experience_by_id(db, exp_id)
        if not experience or experience.candidate_id != profile.id:
            raise ValueError("Experience not found or unauthorized")

        update_dict = exp_data.model_dump(exclude_unset=True)
        return ExperienceRepository.update_experience(db, exp_id, **update_dict)

    @staticmethod
    def delete_experience(db: Session, user_id: int, exp_id: int) -> bool:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        experience = ExperienceRepository.get_experience_by_id(db, exp_id)
        if not experience or experience.candidate_id != profile.id:
            raise ValueError("Experience not found or unauthorized")
        return ExperienceRepository.delete_experience(db, exp_id)

    # ─── Project ───────────────────────────────────────────────────
    @staticmethod
    def add_project(db: Session, user_id: int, proj_data: ProjectCreate) -> Project:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return ProjectRepository.create_project(
            db,
            profile.id,
            project_name=proj_data.project_name,
            description=proj_data.description,
            role=proj_data.role,
            technologies=proj_data.technologies,
            project_url=proj_data.project_url,
            github_url=proj_data.github_url,
        )

    @staticmethod
    def get_projects(db: Session, user_id: int) -> List[Project]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return ProjectRepository.get_projects_by_candidate(db, profile.id)

    @staticmethod
    def update_project(
        db: Session, user_id: int, proj_id: int, proj_data: ProjectUpdate
    ) -> Optional[Project]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        project = ProjectRepository.get_project_by_id(db, proj_id)
        if not project or project.candidate_id != profile.id:
            raise ValueError("Project not found or unauthorized")

        update_dict = proj_data.model_dump(exclude_unset=True)
        return ProjectRepository.update_project(db, proj_id, **update_dict)

    @staticmethod
    def delete_project(db: Session, user_id: int, proj_id: int) -> bool:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        project = ProjectRepository.get_project_by_id(db, proj_id)
        if not project or project.candidate_id != profile.id:
            raise ValueError("Project not found or unauthorized")
        return ProjectRepository.delete_project(db, proj_id)

    # ─── CV ────────────────────────────────────────────────────────
    @staticmethod
    def add_cv(
        db: Session, user_id: int, file_name: str, file_path: str,
        file_size: Optional[int] = None,
    ) -> CV:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return CVRepository.create_cv(
            db, profile.id, file_name, file_path, file_size, is_primary=False,
        )

    @staticmethod
    def get_cvs(db: Session, user_id: int) -> List[CV]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")
        return CVRepository.get_cvs_by_candidate(db, profile.id)

    @staticmethod
    def set_primary_cv(db: Session, user_id: int, cv_id: int) -> Optional[CV]:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv or cv.candidate_id != profile.id:
            raise ValueError("CV not found or unauthorized")

        for other in CVRepository.get_cvs_by_candidate(db, profile.id):
            if other.id != cv_id and other.is_primary:
                CVRepository.update_cv(db, other.id, is_primary=False)
        return CVRepository.update_cv(db, cv_id, is_primary=True)

    @staticmethod
    def delete_cv(db: Session, user_id: int, cv_id: int) -> bool:
        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv or cv.candidate_id != profile.id:
            raise ValueError("CV not found or unauthorized")
        return CVRepository.delete_cv(db, cv_id)

    # ─── Analytics ─────────────────────────────────────────────────
    @staticmethod
    def get_candidate_analytics(db: Session, user_id: int) -> dict:
        from app.models.recruiter import JobInvitation

        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        total_invitations = (
            db.query(JobInvitation)
            .filter(JobInvitation.candidate_id == profile.id)
            .count()
        )
        return {
            "total_views": profile.views or 0,
            "total_invitations": total_invitations,
        }
