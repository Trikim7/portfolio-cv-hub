"""
Default demo accounts — created automatically on first startup (idempotent).

Used by app startup and Docker entrypoint so reviewers can log in immediately
without running the full Phase-2 seed (95 candidates, etc.).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.recruiter import Company, CompanyStatus
from app.models.candidate import CandidateProfile, Skill, ExperienceLevel


@dataclass(frozen=True)
class DemoAccount:
    email: str
    password: str
    full_name: str
    role: UserRole
    label_vi: str


# ─── Credentials (also documented in README & scripts/install.sh) ─────────────

DEMO_ADMIN = DemoAccount(
    email="admin@portfoliocvhub.com",
    password="admin123",
    full_name="System Administrator",
    role=UserRole.ADMIN,
    label_vi="Quản trị viên (Admin)",
)

DEMO_RECRUITER = DemoAccount(
    email="recruiter@portfoliocvhub.com",
    password="recruiter123",
    full_name="Doanh Nghiệp",
    role=UserRole.RECRUITER,
    label_vi="Nhà tuyển dụng / Doanh nghiệp",
)

DEMO_CANDIDATE = DemoAccount(
    email="candidate@portfoliocvhub.com",
    password="candidate123",
    full_name="Ứng Viên",
    role=UserRole.CANDIDATE,
    label_vi="Ứng viên",
)

DEMO_ACCOUNTS: tuple[DemoAccount, ...] = (
    DEMO_ADMIN,
    DEMO_RECRUITER,
    DEMO_CANDIDATE,
)

RECRUITER_COMPANY_SLUG = "doanh-nghiep"
CANDIDATE_PUBLIC_SLUG = "ung-vien"


def _hash(password: str) -> str:
    return get_password_hash(password)


def _ensure_user(db: Session, account: DemoAccount) -> User:
    user = db.query(User).filter(User.email == account.email).first()
    if not user:
        user = User(
            email=account.email,
            password_hash=_hash(account.password),
            full_name=account.full_name,
            role=account.role,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        db.flush()
        print(f"  ✓ Created {account.label_vi}: {account.email} / {account.password}")
        return user

    changed = False
    if user.role != account.role:
        user.role = account.role
        changed = True
    if user.status != UserStatus.ACTIVE:
        user.status = UserStatus.ACTIVE
        changed = True
    if not user.password_hash:
        user.password_hash = _hash(account.password)
        changed = True

    if changed:
        db.flush()
    print(f"  ✓ {account.label_vi} ready: {account.email}")
    return user


def _ensure_recruiter_company(db: Session, user: User) -> None:
    company = db.query(Company).filter(Company.user_id == user.id).first()
    if not company:
        company = Company(
            user_id=user.id,
            company_name="Demo Tech Company",
            company_slug=RECRUITER_COMPANY_SLUG,
            industry="Phần mềm & Công nghệ",
            website="https://demo-tech.example.com",
            description=(
                "Công ty mẫu dùng để kiểm thử luồng nhà tuyển dụng. "
                "Đã được phê duyệt sẵn để đăng nhập và tìm kiếm ứng viên."
            ),
            logo_url=None,
            location="Hà Nội, Việt Nam",
            email=DEMO_RECRUITER.email,
            phone="024-0000-0000",
            status=CompanyStatus.APPROVED,
        )
        db.add(company)
        db.flush()
        print("  ✓ Recruiter company profile created (approved)")
        return

    if company.status != CompanyStatus.APPROVED:
        company.status = CompanyStatus.APPROVED
        db.flush()
        print("  ✓ Recruiter company set to approved")


def _ensure_candidate_profile(db: Session, user: User) -> None:
    profile = (
        db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    )
    if not profile:
        profile = CandidateProfile(
            user_id=user.id,
            full_name=user.full_name,
            headline={
                "vi": "Full-Stack Developer | React · FastAPI · PostgreSQL",
                "en": "Full-Stack Developer | React · FastAPI · PostgreSQL",
            },
            bio={
                "vi": (
                    "Ứng viên mẫu dùng để kiểm thử Portfolio CV Hub. "
                    "Hồ sơ công khai, có kỹ năng cơ bản."
                ),
                "en": (
                    "Demo candidate for Portfolio CV Hub testing. "
                    "Public portfolio with sample skills."
                ),
            },
            avatar_url=f"https://api.dicebear.com/8.x/avataaars/svg?seed={user.email}",
            is_public=True,
            views=0,
            public_slug=CANDIDATE_PUBLIC_SLUG,
            template_id=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(profile)
        db.flush()

        for name, category, level in (
            ("Python", "Backend", ExperienceLevel.MID),
            ("React", "Frontend", ExperienceLevel.MID),
            ("PostgreSQL", "Backend", ExperienceLevel.JUNIOR),
        ):
            db.add(
                Skill(
                    candidate_id=profile.id,
                    name=name,
                    category=category,
                    level=level,
                    endorsements=5,
                )
            )
        db.flush()
        print(f"  ✓ Candidate profile created (public slug: {CANDIDATE_PUBLIC_SLUG})")
        return

    if not profile.is_public:
        profile.is_public = True
    if not profile.public_slug:
        profile.public_slug = CANDIDATE_PUBLIC_SLUG
    db.flush()
    print(f"  ✓ Candidate profile ready (slug: {profile.public_slug})")


def seed_default_accounts(db: Session | None = None) -> None:
    """Create or repair default admin, recruiter, and candidate demo accounts."""
    own_session = db is None
    if own_session:
        db = SessionLocal()

    try:
        print("▶ Seeding default demo accounts...")
        _ensure_user(db, DEMO_ADMIN)
        recruiter_user = _ensure_user(db, DEMO_RECRUITER)
        candidate_user = _ensure_user(db, DEMO_CANDIDATE)

        _ensure_recruiter_company(db, recruiter_user)
        _ensure_candidate_profile(db, candidate_user)

        db.commit()
        print("✅ Default demo accounts ready.")
    except Exception:
        db.rollback()
        raise
    finally:
        if own_session:
            db.close()


if __name__ == "__main__":
    seed_default_accounts()
