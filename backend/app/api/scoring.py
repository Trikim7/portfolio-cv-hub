"""Scoring & Ranking API endpoints (Phase 2 — Member 1).

Endpoints:
    POST /api/v1/candidates/score    → compute 6-axis radar for 1 candidate
    POST /api/v1/candidates/compare  → compute radar + comparison aggregate for N candidates
    POST /api/v1/candidates/rank     → rank candidates by overall_match

All endpoints accept either an existing JobRequirement `job_id` (Member 2 CRUD)
or an inline `criteria` object so this module is usable end-to-end today.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.analytics import Comparison, ComparisonCandidate
from app.models.candidate import CandidateProfile
from app.models.recruiter import Company, JobRequirement
from app.models.user import UserRole
from app.schemas.scoring import (
    CandidateScoreResponse,
    ComparisonDetailResponse,
    ComparisonHistoryItem,
    ComparisonHistoryResponse,
    CompareCandidatesRequest,
    InlineJobCriteria,
    RadarScoresResponse,
    RankCandidatesRequest,
    RankingResponse,
    ScoreCandidateRequest,
)
from app.services.auth import AuthService
from app.services.scoring import (
    DEFAULT_WEIGHTS,
    ScoreResult,
    compute_candidate_score,
    rank_candidates,
)


router = APIRouter(prefix="/api/v1/candidates", tags=["scoring"])
logger = logging.getLogger(__name__)


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


def get_current_recruiter_company_id(
    request: Request,
    db: Session = Depends(get_db),
) -> int:
    """Resolve authenticated recruiter's company id from bearer token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    token = auth_header[7:]
    try:
        user = AuthService.get_current_user(db, token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    if user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter only")

    company = db.query(Company).filter(Company.user_id == user.id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company.id


def get_optional_recruiter_company_id(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[int]:
    """Best-effort recruiter company resolution for non-protected endpoints."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        user = AuthService.get_current_user(db, token)
    except ValueError:
        return None
    if user.role != UserRole.RECRUITER:
        return None
    company = db.query(Company).filter(Company.user_id == user.id).first()
    return company.id if company else None


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


def _build_criteria_snapshot(
    request: CompareCandidatesRequest,
    job: JobRequirement,
    responses: List[CandidateScoreResponse],
) -> Dict[str, Any]:
    if request.criteria:
        criteria_source = request.criteria.model_dump()
    else:
        criteria_source = {
            "job_id": job.id,
            "title": job.title,
            "required_skills": job.required_skills or [],
            "years_experience": job.years_experience,
            "required_role": job.required_role,
            "customer_facing": bool(job.customer_facing),
            "tech_stack": job.tech_stack or [],
            "is_management_role": bool(job.is_management_role),
            "weights_config": job.weights_config,
        }

    return {
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "criteria_source": criteria_source,
        "candidate_ids": request.candidate_ids,
        "results": [
            {
                "candidate_id": item.candidate_id,
                "full_name": item.full_name,
                "overall_match": item.overall_match,
                "radar_scores": item.radar_scores.model_dump(),
            }
            for item in responses
        ],
    }


def _try_persist_comparison(
    db: Session,
    request: CompareCandidatesRequest,
    job: JobRequirement,
    responses: List[CandidateScoreResponse],
    company_id_override: Optional[int] = None,
) -> Optional[int]:
    """
    Persist comparison snapshot when company context exists.

    - With `job_id`: company_id is available from JobRequirement → persist.
    - With inline criteria only: no company_id relationship → skip persistence.
    """
    company_id = company_id_override or getattr(job, "company_id", None)
    if not company_id:
        return None

    snapshot = _build_criteria_snapshot(request, job, responses)
    comparison_row = Comparison(company_id=company_id, criteria_json=snapshot)
    db.add(comparison_row)
    db.flush()

    for candidate_id in dict.fromkeys(request.candidate_ids):
        db.add(
            ComparisonCandidate(
                comparison_id=comparison_row.id,
                candidate_id=candidate_id,
            )
        )

    return comparison_row.id


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/settings/default-weights")
async def get_default_ranking_weights(
    db: Session = Depends(get_db),
):
    """
    Return current system default AI ranking weights for recruiter UI.
    Values are normalized to 0..1 and always sum to 1.
    """
    from app.models.admin_config import SystemSetting

    row = db.query(SystemSetting).filter(SystemSetting.key == "ai_ranking_weights").first()
    if not row or not row.value:
        return DEFAULT_WEIGHTS

    try:
        payload = json.loads(row.value)
        percent = {
            "technical_skills": float(payload.get("technical_skills", 25)),
            "experience": float(payload.get("experience", 25)),
            "portfolio": float(payload.get("portfolio", 20)),
            "soft_skills": float(payload.get("soft_skills", 10)),
            "leadership": float(payload.get("leadership", 10)),
            "readiness_signals": float(payload.get("readiness_signals", 10)),
        }
        total = sum(percent.values())
        if total <= 0:
            return DEFAULT_WEIGHTS
        return {k: v / total for k, v in percent.items()}
    except Exception:
        return DEFAULT_WEIGHTS


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

    comparison_saved = False
    comparison_id = None
    persist_error: Optional[str] = None
    try:
        comparison_id = _try_persist_comparison(db, request, job, responses)
        comparison_saved = comparison_id is not None
        if comparison_saved:
            db.commit()
    except Exception:
        # Do not fail compare scoring due to history-write issues.
        db.rollback()
        logger.error("Failed to persist comparison history", exc_info=True)
        persist_error = "comparison history unavailable"

    if comparison is not None:
        comparison["comparison_saved"] = comparison_saved
        comparison["comparison_id"] = comparison_id
        if persist_error:
            comparison["save_error"] = persist_error

    return RankingResponse(
        job_id=job.id,
        total=len(responses),
        candidates=responses,
        comparison=comparison,
    )


@router.post("/rank", response_model=RankingResponse)
async def rank_candidates_endpoint(
    request: RankCandidatesRequest,
    recruiter_company_id: Optional[int] = Depends(get_optional_recruiter_company_id),
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
    try:
        # Persist ranking session for authenticated recruiters (used by ranking history UI).
        ranked_candidate_ids = [item.candidate_id for item in responses]
        compare_like_request = CompareCandidatesRequest(
            candidate_ids=ranked_candidate_ids,
            job_id=request.job_id,
            criteria=request.criteria,
        )
        persisted_id = _try_persist_comparison(
            db,
            compare_like_request,
            job,
            responses,
            company_id_override=recruiter_company_id,
        )
        if persisted_id is not None:
            db.commit()
    except Exception:
        db.rollback()
        logger.error("Failed to persist rank history", exc_info=True)

    return RankingResponse(
        job_id=job.id,
        total=len(responses),
        candidates=responses,
        comparison=None,
    )


@router.get("/compare/history", response_model=ComparisonHistoryResponse)
async def get_compare_history(
    limit: int = 20,
    offset: int = 0,
    company_id: int = Depends(get_current_recruiter_company_id),
    db: Session = Depends(get_db),
):
    """List comparison sessions of current recruiter company."""
    safe_limit = max(1, min(limit, 100))
    safe_offset = max(0, offset)

    query = db.query(Comparison).filter(Comparison.company_id == company_id)
    total = query.count()
    rows = (
        query.order_by(Comparison.created_at.desc())
        .offset(safe_offset)
        .limit(safe_limit)
        .all()
    )

    items: List[ComparisonHistoryItem] = []
    for row in rows:
        payload = row.criteria_json or {}
        source = payload.get("criteria_source") or {}
        title = source.get("title") if isinstance(source, dict) else None
        job_requirement_id = source.get("job_id") if isinstance(source, dict) else None
        candidate_ids = payload.get("candidate_ids")
        candidate_count = len(candidate_ids) if isinstance(candidate_ids, list) else 0
        items.append(
            ComparisonHistoryItem(
                comparison_id=row.id,
                company_id=row.company_id,
                created_at=row.created_at,
                criteria_title=title,
                job_requirement_id=job_requirement_id,
                candidate_count=candidate_count,
            )
        )

    return ComparisonHistoryResponse(total=total, items=items)


@router.get("/compare/history/{comparison_id}", response_model=ComparisonDetailResponse)
async def get_compare_history_detail(
    comparison_id: int,
    company_id: int = Depends(get_current_recruiter_company_id),
    db: Session = Depends(get_db),
):
    """Get one persisted comparison session owned by current recruiter company."""
    row = (
        db.query(Comparison)
        .filter(
            Comparison.id == comparison_id,
            Comparison.company_id == company_id,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comparison not found")

    candidate_ids = [p.candidate_id for p in (row.participants or [])]
    return ComparisonDetailResponse(
        comparison_id=row.id,
        company_id=row.company_id,
        created_at=row.created_at,
        criteria_json=row.criteria_json or {},
        participant_candidate_ids=candidate_ids,
    )
