"""Scoring & Ranking API endpoints (Phase 2 — Member 1).

Endpoints:
    POST /api/v1/candidates/score    → compute 6-axis radar for 1 candidate
    POST /api/v1/candidates/compare  → compute radar + comparison aggregate for N candidates
    POST /api/v1/candidates/rank     → rank candidates by overall_match

All endpoints accept either an existing JobRequirement `job_id` (Member 2 CRUD)
or an inline `criteria` object so this module is usable end-to-end today.
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.candidate import CandidateProfile
from app.models.recruiter import JobRequirement
from app.schemas.scoring import (
    CandidateScoreResponse,
    CompareCandidatesRequest,
    InlineJobCriteria,
    RadarScoresResponse,
    RankCandidatesRequest,
    RankingResponse,
    ScoreCandidateRequest,
)
from app.services.scoring import (
    ScoreResult,
    compute_candidate_score,
    rank_candidates,
)


router = APIRouter(prefix="/api/v1/candidates", tags=["scoring"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _criteria_to_job(criteria: InlineJobCriteria) -> JobRequirement:
    """Turn an inline criteria payload into a (transient, un-persisted) JobRequirement."""
    return JobRequirement(
        title=criteria.title or "Ad-hoc search",
        required_skills=list(criteria.required_skills or []),
        years_experience=criteria.years_experience or 0,
        required_role=criteria.required_role,
        customer_facing=bool(criteria.customer_facing),
        tech_stack=list(criteria.tech_stack) if criteria.tech_stack else None,
        is_management_role=bool(criteria.is_management_role),
        weights_config=criteria.weights_config or None,
    )


def _resolve_job(
    db: Session,
    job_id: Optional[int],
    criteria: Optional[InlineJobCriteria],
) -> JobRequirement:
    if job_id is not None:
        job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job requirement {job_id} not found",
            )
        return job
    if criteria is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'job_id' or 'criteria' must be provided.",
        )
    return _criteria_to_job(criteria)


def _load_profile(db: Session, candidate_id: int) -> CandidateProfile:
    profile = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.id == candidate_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate {candidate_id} not found",
        )
    return profile


def _to_response(result: ScoreResult) -> CandidateScoreResponse:
    return CandidateScoreResponse(
        candidate_id=result.candidate_id,
        full_name=result.full_name,
        radar_scores=RadarScoresResponse(**result.radar_scores.to_dict()),
        overall_match=round(result.overall_match, 2),
        match_details=result.match_details,
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/score", response_model=CandidateScoreResponse)
async def score_candidate(
    request: ScoreCandidateRequest,
    db: Session = Depends(get_db),
):
    """Compute the 6-axis radar and overall % match for a single candidate."""
    job = _resolve_job(db, request.job_id, request.criteria)
    profile = _load_profile(db, request.candidate_id)
    result = compute_candidate_score(profile, job)
    return _to_response(result)


@router.post("/compare", response_model=RankingResponse)
async def compare_candidates(
    request: CompareCandidatesRequest,
    db: Session = Depends(get_db),
):
    """Compute radar + overall match for multiple candidates (comparison view)."""
    job = _resolve_job(db, request.job_id, request.criteria)
    profiles: List[CandidateProfile] = (
        db.query(CandidateProfile)
        .filter(CandidateProfile.id.in_(request.candidate_ids))
        .all()
    )

    missing = set(request.candidate_ids) - {p.id for p in profiles}
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidates not found: {sorted(missing)}",
        )

    results = rank_candidates(profiles, job)
    responses = [_to_response(r) for r in results]

    if responses:
        best = max(responses, key=lambda r: r.overall_match)
        avg = round(sum(r.overall_match for r in responses) / len(responses), 2)
        highest_skill = max(
            responses, key=lambda r: r.radar_scores.technical_skills
        )
        comparison = {
            "best_match": best.candidate_id,
            "best_match_name": best.full_name,
            "average_match": avg,
            "highest_skill_candidate": {
                "candidate_id": highest_skill.candidate_id,
                "full_name": highest_skill.full_name,
                "score": highest_skill.radar_scores.technical_skills,
            },
        }
    else:
        comparison = None

    return RankingResponse(
        job_id=job.id,
        total=len(responses),
        candidates=responses,
        comparison=comparison,
    )


@router.post("/rank", response_model=RankingResponse)
async def rank_candidates_endpoint(
    request: RankCandidatesRequest,
    db: Session = Depends(get_db),
):
    """Rank candidates by overall_match desc.

    Pool: if `candidate_ids` is supplied, only those; otherwise all profiles
    flagged `is_public = True`. Caps at `limit` (default 50, max 200).
    """
    job = _resolve_job(db, request.job_id, request.criteria)

    query = db.query(CandidateProfile)
    if request.candidate_ids:
        query = query.filter(CandidateProfile.id.in_(request.candidate_ids))
    else:
        query = query.filter(CandidateProfile.is_public.is_(True))

    profiles: List[CandidateProfile] = query.all()
    results = rank_candidates(profiles, job)[: request.limit]
    responses = [_to_response(r) for r in results]

    return RankingResponse(
        job_id=job.id,
        total=len(responses),
        candidates=responses,
        comparison=None,
    )
