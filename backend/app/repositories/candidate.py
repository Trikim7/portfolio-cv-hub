"""Candidate portfolio repository (Phase 2)."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.candidate import CandidateProfile, Skill, Experience, Project, CV


class CandidateProfileRepository:
    @staticmethod
    def create_profile(db: Session, user_id: int, public_slug: str) -> CandidateProfile:
        profile = CandidateProfile(user_id=user_id, public_slug=public_slug)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def get_profile_by_id(db: Session, profile_id: int) -> Optional[CandidateProfile]:
        return db.query(CandidateProfile).filter(CandidateProfile.id == profile_id).first()

    @staticmethod
    def get_profile_by_user_id(db: Session, user_id: int) -> Optional[CandidateProfile]:
        return db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()

    @staticmethod
    def get_profile_by_slug(db: Session, public_slug: str) -> Optional[CandidateProfile]:
        return db.query(CandidateProfile).filter(
            CandidateProfile.public_slug == public_slug,
            CandidateProfile.is_public == True,  # noqa: E712
        ).first()

    @staticmethod
    def update_profile(db: Session, profile_id: int, **kwargs) -> Optional[CandidateProfile]:
        profile = CandidateProfileRepository.get_profile_by_id(db, profile_id)
        if not profile:
            return None
        for key, value in kwargs.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        db.commit()
        db.refresh(profile)
        return profile


class SkillRepository:
    @staticmethod
    def create_skill(
        db: Session,
        candidate_id: int,
        name: str,
        level: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Skill:
        skill = Skill(
            candidate_id=candidate_id,
            name=name,
            level=level,
            category=category,
        )
        db.add(skill)
        db.commit()
        db.refresh(skill)
        return skill

    @staticmethod
    def get_skill_by_id(db: Session, skill_id: int) -> Optional[Skill]:
        return db.query(Skill).filter(Skill.id == skill_id).first()

    @staticmethod
    def get_skills_by_candidate(db: Session, candidate_id: int) -> List[Skill]:
        return db.query(Skill).filter(Skill.candidate_id == candidate_id).all()

    @staticmethod
    def update_skill(db: Session, skill_id: int, **kwargs) -> Optional[Skill]:
        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill:
            return None
        for key, value in kwargs.items():
            if hasattr(skill, key):
                setattr(skill, key, value)
        db.commit()
        db.refresh(skill)
        return skill

    @staticmethod
    def delete_skill(db: Session, skill_id: int) -> bool:
        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill:
            return False
        db.delete(skill)
        db.commit()
        return True


class ExperienceRepository:
    @staticmethod
    def create_experience(
        db: Session,
        candidate_id: int,
        job_title: str,
        company_name: str,
        start_date,
        end_date=None,
        is_current: bool = False,
        description=None,
    ) -> Experience:
        experience = Experience(
            candidate_id=candidate_id,
            job_title=job_title,
            company_name=company_name,
            start_date=start_date,
            end_date=end_date,
            is_current=is_current,
            description=description,
        )
        db.add(experience)
        db.commit()
        db.refresh(experience)
        return experience

    @staticmethod
    def get_experience_by_id(db: Session, experience_id: int) -> Optional[Experience]:
        return db.query(Experience).filter(Experience.id == experience_id).first()

    @staticmethod
    def get_experiences_by_candidate(db: Session, candidate_id: int) -> List[Experience]:
        return db.query(Experience).filter(Experience.candidate_id == candidate_id).all()

    @staticmethod
    def update_experience(db: Session, experience_id: int, **kwargs) -> Optional[Experience]:
        experience = ExperienceRepository.get_experience_by_id(db, experience_id)
        if not experience:
            return None
        for key, value in kwargs.items():
            if hasattr(experience, key):
                setattr(experience, key, value)
        db.commit()
        db.refresh(experience)
        return experience

    @staticmethod
    def delete_experience(db: Session, experience_id: int) -> bool:
        experience = ExperienceRepository.get_experience_by_id(db, experience_id)
        if not experience:
            return False
        db.delete(experience)
        db.commit()
        return True


class ProjectRepository:
    @staticmethod
    def create_project(
        db: Session,
        candidate_id: int,
        project_name: str,
        description=None,
        role: Optional[str] = None,
        technologies: Optional[str] = None,
        project_url: Optional[str] = None,
        github_url: Optional[str] = None,
    ) -> Project:
        project = Project(
            candidate_id=candidate_id,
            project_name=project_name,
            description=description,
            role=role,
            technologies=technologies,
            project_url=project_url,
            github_url=github_url,
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def get_projects_by_candidate(db: Session, candidate_id: int) -> List[Project]:
        return db.query(Project).filter(Project.candidate_id == candidate_id).all()

    @staticmethod
    def update_project(db: Session, project_id: int, **kwargs) -> Optional[Project]:
        project = ProjectRepository.get_project_by_id(db, project_id)
        if not project:
            return None
        for key, value in kwargs.items():
            if hasattr(project, key):
                setattr(project, key, value)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        project = ProjectRepository.get_project_by_id(db, project_id)
        if not project:
            return False
        db.delete(project)
        db.commit()
        return True


class CVRepository:
    @staticmethod
    def create_cv(
        db: Session,
        candidate_id: int,
        file_name: str,
        file_path: str,
        file_size: Optional[int] = None,
        is_primary: bool = False,
    ) -> CV:
        cv = CV(
            candidate_id=candidate_id,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            is_primary=is_primary,
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)
        return cv

    @staticmethod
    def get_cv_by_id(db: Session, cv_id: int) -> Optional[CV]:
        return db.query(CV).filter(CV.id == cv_id).first()

    @staticmethod
    def get_cvs_by_candidate(db: Session, candidate_id: int) -> List[CV]:
        return db.query(CV).filter(CV.candidate_id == candidate_id).all()

    @staticmethod
    def get_primary_cv(db: Session, candidate_id: int) -> Optional[CV]:
        return db.query(CV).filter(
            CV.candidate_id == candidate_id,
            CV.is_primary == True,  # noqa: E712
        ).first()

    @staticmethod
    def update_cv(db: Session, cv_id: int, **kwargs) -> Optional[CV]:
        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv:
            return None
        for key, value in kwargs.items():
            if hasattr(cv, key):
                setattr(cv, key, value)
        db.commit()
        db.refresh(cv)
        return cv

    @staticmethod
    def delete_cv(db: Session, cv_id: int) -> bool:
        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv:
            return False
        db.delete(cv)
        db.commit()
        return True
