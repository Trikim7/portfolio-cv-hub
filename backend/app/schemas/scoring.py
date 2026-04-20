"""Pydantic schemas for the Scoring & Ranking API (Phase 2 — Member 1)."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class InlineJobCriteria(BaseModel):
    """Transient job requirements payload used when no DB `job_id` exists yet.

    Recruiters can experiment with scoring before persisting a JobRequirement
    (Member 2 will deliver the CRUD). Also accepted by the /compare endpoint.
    """
    title: Optional[str] = "Ad-hoc search"
    required_skills: List[Any] = Field(default_factory=list)
    years_experience: Optional[int] = 0
    required_role: Optional[str] = None
    customer_facing: bool = False
    tech_stack: Optional[List[str]] = None
    is_management_role: bool = False
    weights_config: Optional[Dict[str, float]] = None

    @field_validator("required_skills", mode="before")
    @classmethod
    def _normalize_skills(cls, v):
        if v is None:
            return []
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


class ScoreCandidateRequest(BaseModel):
    """Request for POST /api/v1/candidates/score."""
    candidate_id: int
    job_id: Optional[int] = None
    criteria: Optional[InlineJobCriteria] = None


class CompareCandidatesRequest(BaseModel):
    """Request for POST /api/v1/candidates/compare."""
    candidate_ids: List[int] = Field(..., min_length=1)
    job_id: Optional[int] = None
    criteria: Optional[InlineJobCriteria] = None


class RankCandidatesRequest(BaseModel):
    """Request for POST /api/v1/candidates/rank.

    `limit` caps the ranking list; if `candidate_ids` is omitted, the engine
    ranks all publicly listed candidates.
    """
    job_id: Optional[int] = None
    criteria: Optional[InlineJobCriteria] = None
    candidate_ids: Optional[List[int]] = None
    limit: int = Field(50, ge=1, le=200)


class RadarScoresResponse(BaseModel):
    technical_skills: float
    experience: float
    portfolio: float
    soft_skills: float
    leadership: float
    readiness_signals: float


class CandidateScoreResponse(BaseModel):
    candidate_id: int
    full_name: Optional[str] = None
    radar_scores: RadarScoresResponse
    overall_match: float
    match_details: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class RankingResponse(BaseModel):
    job_id: Optional[int] = None
    total: int
    candidates: List[CandidateScoreResponse]
    comparison: Optional[Dict[str, Any]] = None


class ComparisonHistoryItem(BaseModel):
    comparison_id: int
    company_id: int
    created_at: datetime
    criteria_title: Optional[str] = None
    job_requirement_id: Optional[int] = None
    candidate_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ComparisonHistoryResponse(BaseModel):
    total: int
    items: List[ComparisonHistoryItem]

    model_config = ConfigDict(from_attributes=True)


class ComparisonDetailResponse(BaseModel):
    comparison_id: int
    company_id: int
    created_at: datetime
    criteria_json: Dict[str, Any]
    participant_candidate_ids: List[int]

    model_config = ConfigDict(from_attributes=True)
