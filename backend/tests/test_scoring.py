"""Unit tests for the scoring engine (`app.services.scoring`).

Tests the pure scoring logic with in-memory SQLAlchemy objects (no DB).
"""
from __future__ import annotations

from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import List, Optional

import pytest

from app.models.candidate import CandidateProfile, Experience, ExperienceLevel, Project, Skill
from app.models.recruiter import JobRequirement
from app.services.scoring import (
    DEFAULT_WEIGHTS,
    compute_candidate_score,
    rank_candidates,
    resolve_weights,
    score_experience,
    score_leadership,
    score_portfolio,
    score_readiness,
    score_soft_skills,
    score_technical_skills,
)


# ---------------------------------------------------------------------------
# Fixtures / factory helpers
# ---------------------------------------------------------------------------


def _skill(name: str, level: Optional[ExperienceLevel] = None, endorsements: int = 0) -> Skill:
    s = Skill()
    s.name = name
    s.level = level
    s.endorsements = endorsements
    return s


def _exp(
    title: str,
    company: str,
    start: datetime,
    end: Optional[datetime] = None,
    description: Optional[dict] = None,
) -> Experience:
    e = Experience()
    e.job_title = title
    e.company_name = company
    e.start_date = start
    e.end_date = end
    e.is_current = end is None
    e.description = description
    return e


def _project(
    name: str,
    tech: str = "",
    description: Optional[dict] = None,
    project_url: Optional[str] = None,
    github_url: Optional[str] = None,
    role: Optional[str] = None,
) -> Project:
    p = Project()
    p.project_name = name
    p.technologies = tech
    p.description = description
    p.project_url = project_url
    p.github_url = github_url
    p.role = role
    return p


def _profile(
    *,
    full_name: str = "Test Candidate",
    bio: Optional[dict] = None,
    views: int = 0,
    avatar_url: Optional[str] = None,
    skills: Optional[List[Skill]] = None,
    experiences: Optional[List[Experience]] = None,
    projects: Optional[List[Project]] = None,
    updated_at: Optional[datetime] = None,
) -> CandidateProfile:
    p = CandidateProfile()
    p.id = 1
    p.user_id = 1
    p.full_name = full_name
    p.bio = bio
    p.views = views
    p.avatar_url = avatar_url
    p.skills = skills or []
    p.experiences = experiences or []
    p.projects = projects or []
    p.updated_at = updated_at or datetime.utcnow()
    p.created_at = datetime.utcnow() - timedelta(days=60)
    p.is_public = True
    return p


def _job(
    *,
    required_skills: Optional[list] = None,
    years: int = 3,
    role: Optional[str] = "Backend",
    tech_stack: Optional[list] = None,
    is_management_role: bool = False,
    customer_facing: bool = False,
    weights_config: Optional[dict] = None,
) -> JobRequirement:
    j = JobRequirement()
    j.id = 1
    j.company_id = 1
    j.title = "Test Job"
    j.required_skills = required_skills if required_skills is not None else [
        {"name": "Python", "level": "senior"},
        {"name": "React"},
        {"name": "PostgreSQL"},
    ]
    j.years_experience = years
    j.required_role = role
    j.tech_stack = tech_stack or ["Python", "React", "PostgreSQL"]
    j.is_management_role = is_management_role
    j.customer_facing = customer_facing
    j.weights_config = weights_config
    j.is_active = True
    return j


# ---------------------------------------------------------------------------
# Axis-level tests
# ---------------------------------------------------------------------------


class TestTechnicalSkills:
    def test_perfect_match(self):
        skills = [
            _skill("Python", ExperienceLevel.LEAD, endorsements=10),
            _skill("React", ExperienceLevel.LEAD, endorsements=10),
            _skill("PostgreSQL", ExperienceLevel.LEAD, endorsements=10),
        ]
        job = _job()
        score, details = score_technical_skills(skills, job)
        assert score >= 9.5
        assert set(details["matched"]) == {"python", "react", "postgresql"}
        assert details["missing"] == []

    def test_no_match(self):
        skills = [_skill("Rust"), _skill("Go")]
        job = _job()
        score, details = score_technical_skills(skills, job)
        assert score == 0.0
        assert set(details["missing"]) == {"python", "react", "postgresql"}

    def test_partial_match_scales_linearly(self):
        skills = [_skill("Python", ExperienceLevel.SENIOR, endorsements=5)]
        job = _job()
        score, details = score_technical_skills(skills, job)
        # 1/3 matched → 1.67 match + some depth/endorsement
        assert 3.0 <= score <= 7.0
        assert details["matched"] == ["python"]
        assert len(details["missing"]) == 2

    def test_no_required_skills_uses_depth(self):
        skills = [_skill("Python"), _skill("React"), _skill("SQL"),
                  _skill("Docker"), _skill("K8s")]
        job = _job(required_skills=[])
        score, _ = score_technical_skills(skills, job)
        assert score >= 5.0


class TestExperience:
    def test_meets_required_years_and_role(self):
        exps = [
            _exp("Senior Backend Engineer", "A", datetime(2020, 1, 1),
                 datetime(2023, 1, 1)),
            _exp("Backend Developer", "B", datetime(2023, 1, 1), None),
        ]
        job = _job(years=3, role="Backend")
        score, details = score_experience(exps, job)
        assert details["candidate_years"] >= 3
        assert score >= 8.0

    def test_below_required_years(self):
        exps = [_exp("Dev", "Co", datetime(2024, 1, 1),
                     datetime(2024, 7, 1))]
        job = _job(years=5, role="Backend")
        score, details = score_experience(exps, job)
        assert details["candidate_years"] < 1
        assert score < 3.0

    def test_no_experience(self):
        score, details = score_experience([], _job())
        assert score == 0.0
        assert details["candidate_years"] == 0


class TestPortfolio:
    def test_full_credit_with_tech_url_description(self):
        projects = [
            _project(
                "CV Hub",
                tech="Python, React, PostgreSQL",
                project_url="https://cv-hub.example.com",
                description={"vi": "Dự án web portfolio CV cho recruiter, tính "
                                  "năng tìm kiếm, chấm điểm, so sánh ứng viên"
                                  " với AI ranking và nhiều tính năng khác."},
            )
        ]
        score, details = score_portfolio(projects, _job())
        assert score >= 9.0
        assert details["has_live_url"] is True
        assert details["has_rich_description"] is True

    def test_no_projects(self):
        score, details = score_portfolio([], _job())
        assert score == 0.0
        assert details["projects_count"] == 0


class TestSoftSkills:
    def test_keywords_detected_across_bio_and_experience(self):
        bio = {"vi": "Tôi có nhiều kinh nghiệm giao tiếp và làm việc nhóm."}
        exps = [
            _exp(
                "Backend",
                "Corp",
                datetime(2022, 1, 1),
                None,
                description={"en": "Communicating with clients, presenting "
                                   "architecture to stakeholders."},
            )
        ]
        profile = _profile(bio=bio, experiences=exps)
        job = _job()
        score, details = score_soft_skills(profile, exps, job)
        assert details["keyword_hits"] >= 3
        assert score >= 5.0

    def test_empty_bio_low_score(self):
        profile = _profile(bio=None)
        score, _ = score_soft_skills(profile, [], _job())
        assert score <= 2.0


class TestLeadership:
    def test_leadership_title_scores_high(self):
        exps = [_exp("Team Lead Engineer", "X", datetime(2021, 1, 1), None)]
        skills = [_skill("Python", ExperienceLevel.LEAD)]
        score, details = score_leadership(skills, exps, _job())
        assert score >= 6.0
        assert details["has_leadership_title"] is True
        assert details["has_lead_level_skill"] is True

    def test_no_leadership_signal(self):
        exps = [_exp("Junior Dev", "X", datetime(2023, 1, 1), None)]
        skills = [_skill("Python", ExperienceLevel.JUNIOR)]
        score, _ = score_leadership(skills, exps, _job())
        assert score == 0.0


class TestReadiness:
    def test_active_profile_full_completeness(self):
        profile = _profile(
            bio={"vi": "Mô tả chi tiết về bản thân"},
            avatar_url="https://img.example.com/a.png",
            views=150,
            skills=[_skill("Python"), _skill("React"), _skill("SQL")],
            experiences=[_exp("Dev", "X", datetime(2023, 1, 1), None)],
            updated_at=datetime.utcnow() - timedelta(days=2),
        )
        score, details = score_readiness(profile, profile.skills, profile.experiences)
        assert score >= 9.0
        assert details["days_since_update"] <= 2

    def test_inactive_incomplete(self):
        profile = _profile(
            bio=None, views=0,
            updated_at=datetime.utcnow() - timedelta(days=400),
        )
        score, _ = score_readiness(profile, [], [])
        assert score == 0.0


# ---------------------------------------------------------------------------
# Overall engine tests
# ---------------------------------------------------------------------------


class TestComputeCandidateScore:
    def test_ideal_candidate_close_to_perfect(self):
        profile = _profile(
            bio={"vi": "Backend engineer với 5 năm kinh nghiệm. Giao tiếp tốt,"
                       " làm việc nhóm, thuyết trình thuần thục cho khách hàng."},
            avatar_url="https://a.png",
            views=200,
            updated_at=datetime.utcnow() - timedelta(days=2),
            skills=[
                _skill("Python", ExperienceLevel.SENIOR, endorsements=5),
                _skill("React", ExperienceLevel.MID, endorsements=3),
                _skill("PostgreSQL", ExperienceLevel.SENIOR, endorsements=2),
            ],
            experiences=[
                _exp(
                    "Senior Backend Engineer",
                    "Tech Corp",
                    datetime(2021, 1, 1),
                    None,
                    description={"en": "Leading team of 5, communicating with "
                                       "clients, mentoring engineers, "
                                       "collaborating across teams."},
                )
            ],
            projects=[
                _project(
                    "Fintech Platform",
                    tech="Python, React, PostgreSQL",
                    project_url="https://example.com",
                    description={
                        "vi": (
                            "Xây dựng nền tảng tài chính quy mô lớn, tích hợp "
                            "AI ranking cho thuật toán gợi ý sản phẩm. "
                            "Microservices với Python, React, PostgreSQL, "
                            "hỗ trợ hàng triệu người dùng đồng thời."
                        )
                    },
                )
            ],
        )
        result = compute_candidate_score(profile, _job())
        # At least 5 of 6 axes should be strong for a well-rounded candidate.
        strong_axes = sum(1 for v in result.radar_scores.to_dict().values() if v >= 5.0)
        assert strong_axes >= 5
        assert result.overall_match >= 70.0

    def test_empty_profile_zero(self):
        profile = _profile()  # no skills, exp, projects, bio
        result = compute_candidate_score(profile, _job())
        assert result.overall_match < 15.0


class TestWeights:
    def test_default_weights_sum_to_one(self):
        assert abs(sum(DEFAULT_WEIGHTS.values()) - 1.0) < 1e-9

    def test_custom_weights_normalize(self):
        job = _job(weights_config={"technical_skills": 2.0})
        weights = resolve_weights(job)
        assert abs(sum(weights.values()) - 1.0) < 1e-9
        # technical should dominate
        assert weights["technical_skills"] == max(weights.values())

    def test_invalid_weights_fall_back(self):
        job = _job(weights_config={"technical_skills": -1.0, "experience": 0})
        weights = resolve_weights(job)
        assert abs(sum(weights.values()) - 1.0) < 1e-9


class TestRanking:
    def test_rank_orders_by_overall_desc(self):
        strong = _profile(
            full_name="Strong",
            skills=[_skill("Python", ExperienceLevel.SENIOR, endorsements=5),
                    _skill("React", ExperienceLevel.SENIOR),
                    _skill("PostgreSQL", ExperienceLevel.SENIOR)],
            experiences=[_exp("Senior Backend", "X",
                              datetime(2020, 1, 1), None)],
            projects=[_project("P", "Python, React, PostgreSQL",
                               project_url="https://x",
                               description={"vi": "x" * 200})],
            avatar_url="y", views=200, bio={"vi": "Giao tiếp, làm việc nhóm"},
            updated_at=datetime.utcnow() - timedelta(days=1),
        )
        strong.id = 1
        weak = _profile(full_name="Weak")
        weak.id = 2
        results = rank_candidates([weak, strong], _job())
        assert results[0].candidate_id == 1
        assert results[1].candidate_id == 2
        assert results[0].match_details["ranking"] == 1
        assert results[1].match_details["ranking"] == 2
