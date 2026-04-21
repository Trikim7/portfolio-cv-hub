"""Scoring engine — 6-axis radar + overall match score (Phase 2, Member 1).

Design reference: `PHASE_2_PLAN.md` §3 and `.agent/skill-team-workflow/
database-design.md`. Each axis returns a float in [0, 10]; `overall_match` is
weighted in [0, 100].

Axes:
    1. technical_skills     (weight 0.25)
    2. experience           (weight 0.25)
    3. portfolio            (weight 0.20)
    4. soft_skills          (weight 0.10)
    5. leadership           (weight 0.10)
    6. readiness_signals    (weight 0.10)

The engine is a pure function of SQLAlchemy ORM objects — no DB access inside —
so it is trivially unit-testable without a live Postgres.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.models.candidate import (
    CandidateProfile,
    Experience,
    ExperienceLevel,
    Project,
    Skill,
)
from app.models.recruiter import JobRequirement


# ---------------------------------------------------------------------------
# Constants & configuration
# ---------------------------------------------------------------------------

DEFAULT_WEIGHTS: Dict[str, float] = {
    "technical_skills": 0.25,
    "experience": 0.25,
    "portfolio": 0.20,
    "soft_skills": 0.10,
    "leadership": 0.10,
    "readiness_signals": 0.10,
}

LEVEL_SCORE: Dict[str, int] = {
    "entry": 1,
    "junior": 2,
    "mid": 3,
    "senior": 4,
    "lead": 5,
}

SOFT_SKILL_KEYWORDS: Tuple[str, ...] = (
    # English
    "communicate", "communicating", "communication", "present", "presentation",
    "teamwork", "team", "collaborate", "collaboration", "mentor", "mentoring",
    "stakeholder", "client", "customer", "negotiat", "report", "document",
    "interpersonal", "leadership",
    # Vietnamese
    "giao tiep", "giao tiếp", "thuyet trinh", "thuyết trình", "lam viec nhom",
    "làm việc nhóm", "lam viec", "làm việc", "hop tac", "hợp tác", "huong dan",
    "hướng dẫn", "khach hang", "khách hàng", "dam phan", "đàm phán",
    "ho tro", "hỗ trợ",
)

LEADERSHIP_KEYWORDS: Tuple[str, ...] = (
    "lead", "leader", "manager", "management", "head", "director",
    "supervisor", "principal", "chief", "tech lead", "team lead",
    # Vietnamese
    "truong nhom", "trưởng nhóm", "quan ly", "quản lý", "giam doc", "giám đốc",
    "chu nhiem", "chủ nhiệm", "truong phong", "trưởng phòng",
)


# ---------------------------------------------------------------------------
# Dataclasses returned to API layer
# ---------------------------------------------------------------------------


@dataclass
class RadarScores:
    technical_skills: float = 0.0
    experience: float = 0.0
    portfolio: float = 0.0
    soft_skills: float = 0.0
    leadership: float = 0.0
    readiness_signals: float = 0.0

    def to_dict(self) -> Dict[str, float]:
        return {
            "technical_skills": round(self.technical_skills, 2),
            "experience": round(self.experience, 2),
            "portfolio": round(self.portfolio, 2),
            "soft_skills": round(self.soft_skills, 2),
            "leadership": round(self.leadership, 2),
            "readiness_signals": round(self.readiness_signals, 2),
        }


@dataclass
class ScoreResult:
    candidate_id: int
    full_name: Optional[str]
    radar_scores: RadarScores
    overall_match: float
    match_details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "candidate_id": self.candidate_id,
            "full_name": self.full_name,
            "radar_scores": self.radar_scores.to_dict(),
            "overall_match": round(self.overall_match, 2),
            "match_details": self.match_details,
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _normalize(text: Optional[str]) -> str:
    """Lowercase & strip; returns empty string for None."""
    return (text or "").strip().lower()


def _i18n_flatten(value: Any) -> str:
    """Flatten an i18n JSONB ({vi, en, ...}) or raw string into one lowercase blob."""
    if not value:
        return ""
    if isinstance(value, str):
        return value.lower()
    if isinstance(value, dict):
        return " ".join(str(v) for v in value.values() if v).lower()
    return str(value).lower()


def _clamp(value: float, lo: float = 0.0, hi: float = 10.0) -> float:
    return max(lo, min(hi, value))


def _level_rank(level: Any) -> int:
    """Normalize a level value (enum, str) to 1..5 ranking. 0 if unknown."""
    if level is None:
        return 0
    key = level.value if isinstance(level, ExperienceLevel) else str(level).lower()
    return LEVEL_SCORE.get(key, 0)


def _tokenize_tech(raw: Any) -> List[str]:
    """Accept comma-separated string or list of strings → list of lowercased tokens."""
    if not raw:
        return []
    if isinstance(raw, list):
        items = raw
    else:
        items = str(raw).split(",")
    out: List[str] = []
    for item in items:
        if isinstance(item, dict):
            name = item.get("name")
            if name:
                out.append(str(name).strip().lower())
        else:
            token = str(item).strip().lower()
            if token:
                out.append(token)
    return out


def _required_skill_names(job: JobRequirement) -> List[str]:
    """Extract required skill names, case-insensitive, from JobRequirement.required_skills."""
    raw = job.required_skills or []
    names: List[str] = []
    for item in raw:
        if isinstance(item, dict):
            n = item.get("name")
            if n:
                names.append(str(n).strip().lower())
        elif isinstance(item, str):
            names.append(item.strip().lower())
    return names


def _total_experience_years(experiences: Iterable[Experience]) -> float:
    """Sum of (end_date - start_date) across experiences, counting current as today."""
    now = datetime.utcnow()
    total_days = 0.0
    for exp in experiences:
        if not exp.start_date:
            continue
        end = exp.end_date if not exp.is_current and exp.end_date else now
        delta = end - exp.start_date
        days = max(delta.days, 0)
        total_days += days
    return round(total_days / 365.25, 2)


# ---------------------------------------------------------------------------
# Axis scorers
# ---------------------------------------------------------------------------


def score_technical_skills(
    skills: List[Skill], job: JobRequirement
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = %match (5) + level depth (2.5) + endorsements signal (2.5)."""
    required = _required_skill_names(job)
    candidate_skills = {(_normalize(s.name)): s for s in skills}

    if not required:
        # No requirement → award based on overall skill depth (5 required skills ~ full).
        depth = min(len(candidate_skills), 5) / 5 * 5
        endorse_sum = sum(max(s.endorsements or 0, 0) for s in skills)
        endorsements = min(endorse_sum / 10, 1.0) * 5
        score = _clamp(depth + endorsements)
        return score, {
            "matched": list(candidate_skills.keys()),
            "missing": [],
            "extra": [],
            "score": round(score, 2),
        }

    matched = [r for r in required if r in candidate_skills]
    missing = [r for r in required if r not in candidate_skills]
    extra = [n for n in candidate_skills if n not in required]

    match_ratio = len(matched) / len(required)
    match_score = match_ratio * 5

    if matched:
        depths = [_level_rank(candidate_skills[m].level) for m in matched]
        avg_depth = sum(depths) / len(depths)
        depth_score = (avg_depth / 5) * 2.5
    else:
        depth_score = 0.0

    if matched:
        endorsements = [max(candidate_skills[m].endorsements or 0, 0) for m in matched]
        avg_endorse = sum(endorsements) / len(endorsements)
        endorse_score = min(avg_endorse / 5, 1.0) * 2.5
    else:
        endorse_score = 0.0

    score = _clamp(match_score + depth_score + endorse_score)
    return score, {
        "matched": matched,
        "missing": missing,
        "extra": extra,
        "score": round(score, 2),
    }


def score_experience(
    experiences: List[Experience], job: JobRequirement
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = total-years coverage (5) + role-keyword match (5)."""
    total_years = _total_experience_years(experiences)
    required_years = job.years_experience or 0

    if required_years <= 0:
        years_score = min(total_years / 3, 1.0) * 5
    elif total_years <= 0:
        years_score = 0.0
    else:
        years_score = min(total_years / required_years, 1.0) * 5

    role_hint = _normalize(job.required_role)
    if role_hint:
        role_tokens = [tok for tok in re.split(r"[\s/\-,]+", role_hint) if tok]
        hits = 0
        for exp in experiences:
            title = _normalize(exp.job_title)
            if not title:
                continue
            if any(tok in title for tok in role_tokens):
                hits += 1
        role_score = min(hits, 2) / 2 * 5 if hits else 0.0
    else:
        role_score = 5.0 if experiences else 0.0

    score = _clamp(years_score + role_score)
    return score, {
        "candidate_years": total_years,
        "required_years": required_years,
        "role_hint": job.required_role,
        "score": round(score, 2),
    }


def score_portfolio(
    projects: List[Project], job: JobRequirement
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = tech-stack match (6) + live URL (2) + description quality (2)."""
    if not projects:
        return 0.0, {"projects_count": 0, "score": 0.0}

    required_stack = set(_tokenize_tech(job.tech_stack))
    if not required_stack:
        required_stack = set(_required_skill_names(job))

    covered: set = set()
    has_live = False
    has_good_desc = False
    for proj in projects:
        tech_tokens = set(_tokenize_tech(proj.technologies))
        if required_stack:
            covered.update(tech_tokens & required_stack)
        if (proj.project_url and proj.project_url.strip()) or (
            proj.github_url and proj.github_url.strip()
        ):
            has_live = True
        desc_blob = _i18n_flatten(proj.description)
        if len(desc_blob) >= 120:
            has_good_desc = True

    if required_stack:
        stack_score = min(len(covered) / len(required_stack), 1.0) * 6
    else:
        stack_score = 3.0  # cannot evaluate; neutral partial credit

    url_score = 2.0 if has_live else 0.0
    desc_score = 2.0 if has_good_desc else 0.0

    score = _clamp(stack_score + url_score + desc_score)
    return score, {
        "projects_count": len(projects),
        "matched_tech": sorted(covered),
        "required_tech": sorted(required_stack),
        "has_live_url": has_live,
        "has_rich_description": has_good_desc,
        "score": round(score, 2),
    }


def _keyword_density(text: str, keywords: Iterable[str]) -> int:
    """Count total keyword occurrences (distinct keywords cap at 10)."""
    if not text:
        return 0
    hits = 0
    for kw in keywords:
        if kw in text:
            hits += 1
    return hits


def score_soft_skills(
    profile: CandidateProfile, experiences: List[Experience], job: JobRequirement
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = keyword density across bio + experience descriptions (8) + bio filled (2)."""
    bio = _i18n_flatten(profile.bio)
    exp_blob = " ".join(_i18n_flatten(e.description) for e in experiences)
    combined = f"{bio} {exp_blob}".strip()

    hits = _keyword_density(combined, SOFT_SKILL_KEYWORDS)
    density_score = min(hits / 6, 1.0) * 8  # 6 distinct hits → full marks

    bio_bonus = 2.0 if len(bio) >= 100 else (1.0 if bio else 0.0)

    score = _clamp(density_score + bio_bonus)
    if job.customer_facing and score < 5:
        score = _clamp(score - 1.0)  # extra-strict when job is client-facing

    return score, {
        "keyword_hits": hits,
        "bio_length": len(bio),
        "customer_facing": bool(job.customer_facing),
        "score": round(score, 2),
    }


def score_leadership(
    skills: List[Skill], experiences: List[Experience], job: JobRequirement
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = title contains Lead/Manager (6) + skill level LEAD (2) + description hits (2).

    Special case (per PHASE_2_PLAN §3): if job does not require management, any
    leadership signal still earns positive score (we don't penalize).
    """
    title_blob = " ".join(_normalize(e.job_title) for e in experiences)
    title_hits = any(kw in title_blob for kw in LEADERSHIP_KEYWORDS)

    has_lead_level = any(_level_rank(s.level) >= LEVEL_SCORE["lead"] for s in skills)

    desc_blob = " ".join(_i18n_flatten(e.description) for e in experiences)
    desc_hits = _keyword_density(desc_blob, LEADERSHIP_KEYWORDS)

    title_score = 6.0 if title_hits else 0.0
    level_score = 2.0 if has_lead_level else 0.0
    desc_score = min(desc_hits / 3, 1.0) * 2

    score = _clamp(title_score + level_score + desc_score)

    if job.is_management_role and score < 5:
        # Under-qualified for a management role: keep score low (no bonus).
        pass

    return score, {
        "has_leadership_title": title_hits,
        "has_lead_level_skill": has_lead_level,
        "description_keyword_hits": desc_hits,
        "is_management_role": bool(job.is_management_role),
        "score": round(score, 2),
    }


def score_readiness(
    profile: CandidateProfile,
    skills: List[Skill],
    experiences: List[Experience],
) -> Tuple[float, Dict[str, Any]]:
    """0-10 = active (<30d, 4) + profile views (3) + profile completeness (3)."""
    now = datetime.utcnow()
    last_update = profile.updated_at or profile.created_at or now
    days_since_update = max((now - last_update).days, 0)

    if days_since_update <= 30:
        active_score = 4.0
    elif days_since_update <= 90:
        active_score = 2.5
    elif days_since_update <= 180:
        active_score = 1.5
    else:
        active_score = 0.0

    views = profile.views or 0
    if views >= 100:
        views_score = 3.0
    elif views >= 30:
        views_score = 2.0
    elif views >= 5:
        views_score = 1.0
    else:
        views_score = 0.0

    completeness = 0.0
    if profile.avatar_url:
        completeness += 0.75
    if _i18n_flatten(profile.bio):
        completeness += 0.75
    if len(skills) >= 3:
        completeness += 0.75
    if len(experiences) >= 1:
        completeness += 0.75
    completeness = min(completeness, 3.0)

    score = _clamp(active_score + views_score + completeness)
    return score, {
        "days_since_update": days_since_update,
        "views": views,
        "avatar": bool(profile.avatar_url),
        "bio": bool(_i18n_flatten(profile.bio)),
        "skills_count": len(skills),
        "experiences_count": len(experiences),
        "score": round(score, 2),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def resolve_weights(job: JobRequirement) -> Dict[str, float]:
    """Merge DEFAULT_WEIGHTS with JobRequirement.weights_config + normalize to sum=1."""
    weights = dict(DEFAULT_WEIGHTS)
    custom = job.weights_config or {}
    if isinstance(custom, dict):
        for key, value in custom.items():
            if key in weights and isinstance(value, (int, float)) and value >= 0:
                weights[key] = float(value)
    # Normalize so sum == 1 (protects against bad recruiter input).
    total = sum(weights.values())
    if total <= 0:
        return dict(DEFAULT_WEIGHTS)
    return {k: v / total for k, v in weights.items()}


def compute_candidate_score(
    profile: CandidateProfile, job: JobRequirement
) -> ScoreResult:
    """Compute all 6 axes + overall % for a single candidate against a job."""
    skills = list(profile.skills or [])
    experiences = list(profile.experiences or [])
    projects = list(profile.projects or [])

    tech_score, tech_details = score_technical_skills(skills, job)
    exp_score, exp_details = score_experience(experiences, job)
    port_score, port_details = score_portfolio(projects, job)
    soft_score, soft_details = score_soft_skills(profile, experiences, job)
    lead_score, lead_details = score_leadership(skills, experiences, job)
    ready_score, ready_details = score_readiness(profile, skills, experiences)

    # Special case: no portfolio → redistribute portfolio weight to technical (per PHASE_2_PLAN).
    weights = resolve_weights(job)
    if not projects:
        port_w = weights.pop("portfolio", 0.0)
        weights["technical_skills"] = weights.get("technical_skills", 0.0) + port_w
        port_score = 0.0
    # Special case: job does not require management → bonus leadership into soft_skills (2x).
    if not job.is_management_role and lead_score > 0:
        bonus = min(lead_score * 0.1, 1.0)  # up to +1 point to soft_skills
        soft_score = _clamp(soft_score + bonus)

    radar = RadarScores(
        technical_skills=tech_score,
        experience=exp_score,
        portfolio=port_score,
        soft_skills=soft_score,
        leadership=lead_score,
        readiness_signals=ready_score,
    )

    overall = (
        weights.get("technical_skills", 0.0) * tech_score
        + weights.get("experience", 0.0) * exp_score
        + weights.get("portfolio", 0.0) * port_score
        + weights.get("soft_skills", 0.0) * soft_score
        + weights.get("leadership", 0.0) * lead_score
        + weights.get("readiness_signals", 0.0) * ready_score
    ) * 10  # scale 0-10 → 0-100
    overall = max(0.0, min(100.0, overall))

    return ScoreResult(
        candidate_id=profile.id,
        full_name=profile.full_name,
        radar_scores=radar,
        overall_match=overall,
        match_details={
            "technical_skills": tech_details,
            "experience": exp_details,
            "portfolio": port_details,
            "soft_skills": soft_details,
            "leadership": lead_details,
            "readiness_signals": ready_details,
            "weights": {k: round(v, 4) for k, v in weights.items()},
            "public_slug": profile.public_slug,  # used by frontend to build /portfolio/{slug}
            "avatar_url": profile.avatar_url,     # used for avatar display in ranking cards
        },
    )


def rank_candidates(
    profiles: List[CandidateProfile], job: JobRequirement
) -> List[ScoreResult]:
    """Compute + sort scores descending by overall_match, assign ranking via match_details."""
    scored = [compute_candidate_score(p, job) for p in profiles]
    scored.sort(key=lambda r: r.overall_match, reverse=True)
    for idx, result in enumerate(scored, start=1):
        result.match_details["ranking"] = idx
    return scored
