"""Candidate portfolio repository"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.candidate import CandidateProfile, Skill, Experience, Project, CV


class CandidateProfileRepository:
    """Candidate profile data access layer"""

    @staticmethod
    def create_profile(db: Session, user_id: int, profile_slug: str) -> CandidateProfile:
        """Create new candidate profile"""
        profile = CandidateProfile(user_id=user_id, profile_slug=profile_slug)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def get_profile_by_id(db: Session, profile_id: int) -> Optional[CandidateProfile]:
        """Get profile by ID"""
        return db.query(CandidateProfile).filter(CandidateProfile.id == profile_id).first()

    @staticmethod
    def get_profile_by_user_id(db: Session, user_id: int) -> Optional[CandidateProfile]:
        """Get profile by user ID"""
        return db.query(CandidateProfile).filter(CandidateProfile.user_id == user_id).first()

    @staticmethod
    def get_profile_by_slug(db: Session, profile_slug: str) -> Optional[CandidateProfile]:
        """Get public profile by slug"""
        return db.query(CandidateProfile).filter(
            CandidateProfile.profile_slug == profile_slug,
            CandidateProfile.is_public == True
        ).first()

    @staticmethod
    def update_profile(db: Session, profile_id: int, **kwargs) -> Optional[CandidateProfile]:
        """Update profile"""
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
    """Skill data access layer"""

    @staticmethod
    def create_skill(db: Session, candidate_id: int, name: str, level: Optional[str] = None) -> Skill:
        """Create new skill"""
        skill = Skill(candidate_id=candidate_id, name=name, level=level)
        db.add(skill)
        db.commit()
        db.refresh(skill)
        return skill

    @staticmethod
    def get_skill_by_id(db: Session, skill_id: int) -> Optional[Skill]:
        """Get skill by ID"""
        return db.query(Skill).filter(Skill.id == skill_id).first()

    @staticmethod
    def get_skills_by_candidate(db: Session, candidate_id: int) -> List[Skill]:
        """Get all skills for candidate"""
        return db.query(Skill).filter(Skill.candidate_id == candidate_id).all()

    @staticmethod
    def update_skill(db: Session, skill_id: int, **kwargs) -> Optional[Skill]:
        """Update skill"""
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
        """Delete skill"""
        skill = SkillRepository.get_skill_by_id(db, skill_id)
        if not skill:
            return False
        db.delete(skill)
        db.commit()
        return True


class ExperienceRepository:
    """Experience data access layer"""

    @staticmethod
    def create_experience(db: Session, candidate_id: int, job_title: str, company_name: str, 
                         start_date, end_date=None, is_current: bool = False, description: str = None) -> Experience:
        """Create new experience"""
        experience = Experience(
            candidate_id=candidate_id,
            job_title=job_title,
            company_name=company_name,
            start_date=start_date,
            end_date=end_date,
            is_current=is_current,
            description=description
        )
        db.add(experience)
        db.commit()
        db.refresh(experience)
        return experience

    @staticmethod
    def get_experience_by_id(db: Session, experience_id: int) -> Optional[Experience]:
        """Get experience by ID"""
        return db.query(Experience).filter(Experience.id == experience_id).first()

    @staticmethod
    def get_experiences_by_candidate(db: Session, candidate_id: int) -> List[Experience]:
        """Get all experiences for candidate"""
        return db.query(Experience).filter(Experience.candidate_id == candidate_id).all()

    @staticmethod
    def update_experience(db: Session, experience_id: int, **kwargs) -> Optional[Experience]:
        """Update experience"""
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
        """Delete experience"""
        experience = ExperienceRepository.get_experience_by_id(db, experience_id)
        if not experience:
            return False
        db.delete(experience)
        db.commit()
        return True


class ProjectRepository:
    """Project data access layer"""

    @staticmethod
    def create_project(db: Session, candidate_id: int, title: str, description: str = None,
                      url: str = None, technologies: str = None) -> Project:
        """Create new project"""
        project = Project(
            candidate_id=candidate_id,
            title=title,
            description=description,
            url=url,
            technologies=technologies
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        """Get project by ID"""
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def get_projects_by_candidate(db: Session, candidate_id: int) -> List[Project]:
        """Get all projects for candidate"""
        return db.query(Project).filter(Project.candidate_id == candidate_id).all()

    @staticmethod
    def update_project(db: Session, project_id: int, **kwargs) -> Optional[Project]:
        """Update project"""
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
        """Delete project"""
        project = ProjectRepository.get_project_by_id(db, project_id)
        if not project:
            return False
        db.delete(project)
        db.commit()
        return True


class CVRepository:
    """CV file data access layer"""

    @staticmethod
    def create_cv(db: Session, candidate_id: int, file_name: str, file_path: str,
                 file_size: int = None, is_primary: bool = False) -> CV:
        """Create new CV record"""
        cv = CV(
            candidate_id=candidate_id,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size,
            is_primary=is_primary
        )
        db.add(cv)
        db.commit()
        db.refresh(cv)
        return cv

    @staticmethod
    def get_cv_by_id(db: Session, cv_id: int) -> Optional[CV]:
        """Get CV by ID"""
        return db.query(CV).filter(CV.id == cv_id).first()

    @staticmethod
    def get_cvs_by_candidate(db: Session, candidate_id: int) -> List[CV]:
        """Get all CVs for candidate"""
        return db.query(CV).filter(CV.candidate_id == candidate_id).all()

    @staticmethod
    def get_primary_cv(db: Session, candidate_id: int) -> Optional[CV]:
        """Get primary CV for candidate"""
        return db.query(CV).filter(
            CV.candidate_id == candidate_id,
            CV.is_primary == True
        ).first()

    @staticmethod
    def update_cv(db: Session, cv_id: int, **kwargs) -> Optional[CV]:
        """Update CV record"""
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
        """Delete CV record"""
        cv = CVRepository.get_cv_by_id(db, cv_id)
        if not cv:
            return False
        db.delete(cv)
        db.commit()
        return True
