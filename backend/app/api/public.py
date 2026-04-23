"""Public API routes — no authentication required"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.database import get_db
from app.models.user import User, UserRole
from app.models.recruiter import Company, CompanyStatus, JobInvitation
from app.models.candidate import CandidateProfile, Skill

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/stats")
async def get_public_stats(db: Session = Depends(get_db)):
    """Platform-wide statistics for homepage — no auth required."""
    total_candidates = (
        db.query(func.count(CandidateProfile.id))
        .filter(CandidateProfile.is_public == True)  # noqa: E712
        .scalar() or 0
    )
    total_views = (
        db.query(func.coalesce(func.sum(CandidateProfile.views), 0))
        .scalar() or 0
    )
    total_invitations = db.query(func.count(JobInvitation.id)).scalar() or 0

    return {
        "total_candidates": total_candidates,
        "total_views": int(total_views),
        "total_invitations": total_invitations,
    }


@router.get("/featured-candidates")
async def get_featured_candidates(
    limit: int = 4,
    db: Session = Depends(get_db),
):
    """
    Return top public candidates sorted by profile views (descending).
    No auth required — used on the homepage.
    """
    profiles = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.is_public == True)  # noqa: E712
        .order_by(desc(CandidateProfile.views))
        .limit(limit)
        .all()
    )

    result = []
    for p in profiles:
        result.append({
            "id": p.id,
            "full_name": p.full_name or "",
            "headline": p.headline or "",
            "public_slug": p.public_slug or "",
            "avatar_url": p.avatar_url or "",
            "views": p.views or 0,
            "skills": [s.name for s in (p.skills or [])],
        })

    return result
