"""Models package.

Importing each module here ensures SQLAlchemy registers every model on `Base`
so Alembic's autogenerate sees the full schema in one place.
"""
from app.models.admin_config import Template, TemplateStatus, SystemSetting  # noqa: F401
from app.models.user import User, UserRole, UserStatus, SocialAccount  # noqa: F401
from app.models.candidate import (  # noqa: F401
    CandidateProfile, Skill, Experience, Project, CV, ExperienceLevel,
)
from app.models.recruiter import (  # noqa: F401
    Company, CompanyStatus, JobRequirement, JobInvitation, InvitationStatus,
)
from app.models.analytics import (  # noqa: F401
    ProfileView, ViewerType, Comparison, ComparisonCandidate,
)
