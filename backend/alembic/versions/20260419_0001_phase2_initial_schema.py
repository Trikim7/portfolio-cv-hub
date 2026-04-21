"""Phase 2 initial schema (PostgreSQL, JSONB i18n, scoring tables).

Revision ID: 20260419_0001
Revises:
Create Date: 2026-04-19

This single migration replaces the Phase 1 SQLite-era schema. Phase 2 is a
clean slate on Postgres per `.agent/skill-team-workflow/database-design.md`.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260419_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # ─── Create enum types explicitly ONCE, then reuse via create_type=False ──
    enum_defs = [
        ("userrole", ("CANDIDATE", "RECRUITER", "ADMIN")),
        ("userstatus", ("ACTIVE", "LOCKED", "PENDING")),
        ("experiencelevel", ("ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD")),
        ("companystatus", ("PENDING", "APPROVED", "REJECTED", "SUSPENDED")),
        ("invitationstatus", ("PENDING", "INTERESTED", "REJECTED", "WITHDRAWN")),
        ("viewertype", ("ANONYMOUS", "COMPANY")),
        ("templatestatus", ("ACTIVE", "INACTIVE")),
    ]
    for name, values in enum_defs:
        postgresql.ENUM(*values, name=name, create_type=True).create(bind, checkfirst=True)

    # Column-usage references — never emit CREATE TYPE again.
    user_role = postgresql.ENUM(name="userrole", create_type=False)
    user_status = postgresql.ENUM(name="userstatus", create_type=False)
    experience_level = postgresql.ENUM(name="experiencelevel", create_type=False)
    company_status = postgresql.ENUM(name="companystatus", create_type=False)
    invitation_status = postgresql.ENUM(name="invitationstatus", create_type=False)
    viewer_type = postgresql.ENUM(name="viewertype", create_type=False)
    template_status = postgresql.ENUM(name="templatestatus", create_type=False)

    # ─── templates (referenced by candidate_profiles) ─────────────
    op.create_table(
        "templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("config_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", template_status, nullable=False, server_default="ACTIVE"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_templates_status", "templates", ["status"])

    # ─── system_settings ──────────────────────────────────────────
    op.create_table(
        "system_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(length=255), nullable=False, unique=True),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_index("ix_system_settings_key", "system_settings", ["key"], unique=True)

    # ─── users ────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("role", user_role, nullable=False, server_default="CANDIDATE"),
        sa.Column("status", user_status, nullable=False, server_default="ACTIVE"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_status", "users", ["status"])

    # ─── social_accounts ──────────────────────────────────────────
    op.create_table(
        "social_accounts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id", sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_account_id", sa.String(length=255), nullable=False),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.UniqueConstraint(
            "provider", "provider_account_id", name="uq_social_accounts_provider_account",
        ),
    )
    op.create_index("ix_social_accounts_user_id", "social_accounts", ["user_id"])
    op.create_index("ix_social_accounts_provider", "social_accounts", ["provider"])

    # ─── candidate_profiles ───────────────────────────────────────
    op.create_table(
        "candidate_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id", sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False, unique=True,
        ),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("headline", sa.String(length=255), nullable=True),
        sa.Column("bio", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column(
            "is_public", sa.Boolean(), nullable=False, server_default=sa.text("false"),
        ),
        sa.Column("views", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("public_slug", sa.String(length=255), nullable=True),
        sa.Column(
            "template_id", sa.Integer(),
            sa.ForeignKey("templates.id", ondelete="SET NULL"), nullable=True,
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index(
        "ix_candidate_profiles_public_slug",
        "candidate_profiles", ["public_slug"], unique=True,
    )

    # ─── skills ───────────────────────────────────────────────────
    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("level", experience_level, nullable=True),
        sa.Column("category", sa.String(length=255), nullable=True),
        sa.Column("endorsements", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_skills_candidate_id", "skills", ["candidate_id"])
    op.create_index("ix_skills_name", "skills", ["name"])

    # ─── experiences ──────────────────────────────────────────────
    op.create_table(
        "experiences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("job_title", sa.String(length=255), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.Column(
            "is_current", sa.Boolean(), nullable=False, server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_experiences_candidate_id", "experiences", ["candidate_id"])

    # ─── projects ─────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("project_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=255), nullable=True),
        sa.Column("technologies", sa.String(length=500), nullable=True),
        sa.Column("description", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("project_url", sa.String(length=500), nullable=True),
        sa.Column("github_url", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_projects_candidate_id", "projects", ["candidate_id"])

    # ─── cvs ──────────────────────────────────────────────────────
    op.create_table(
        "cvs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column(
            "is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_cvs_candidate_id", "cvs", ["candidate_id"])

    # ─── companies ────────────────────────────────────────────────
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id", sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False, unique=True,
        ),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("company_slug", sa.String(length=255), nullable=False),
        sa.Column("industry", sa.String(length=255), nullable=True),
        sa.Column("website", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("status", company_status, nullable=False, server_default="PENDING"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_companies_company_slug", "companies", ["company_slug"], unique=True)
    op.create_index("ix_companies_status", "companies", ["status"])

    # ─── job_requirements ─────────────────────────────────────────
    op.create_table(
        "job_requirements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "company_id", sa.Integer(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column(
            "required_skills", postgresql.JSONB(astext_type=sa.Text()),
            nullable=False, server_default=sa.text("'[]'::jsonb"),
        ),
        sa.Column("years_experience", sa.Integer(), nullable=True),
        sa.Column("required_role", sa.String(length=255), nullable=True),
        sa.Column(
            "customer_facing", sa.Boolean(), nullable=False, server_default=sa.text("false"),
        ),
        sa.Column("tech_stack", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "is_management_role", sa.Boolean(), nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("weights_config", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true"),
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_job_requirements_company_id", "job_requirements", ["company_id"])
    op.create_index("ix_job_requirements_is_active", "job_requirements", ["is_active"])

    # ─── job_invitations ──────────────────────────────────────────
    op.create_table(
        "job_invitations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "company_id", sa.Integer(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("job_title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", invitation_status, nullable=False, server_default="PENDING"),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_job_invitations_company_id", "job_invitations", ["company_id"])
    op.create_index("ix_job_invitations_candidate_id", "job_invitations", ["candidate_id"])
    op.create_index("ix_job_invitations_status", "job_invitations", ["status"])

    # ─── profile_views ────────────────────────────────────────────
    op.create_table(
        "profile_views",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column("viewer_type", viewer_type, nullable=False),
        sa.Column(
            "company_id", sa.Integer(),
            sa.ForeignKey("companies.id", ondelete="SET NULL"), nullable=True,
        ),
        sa.Column(
            "viewed_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_profile_views_candidate_id", "profile_views", ["candidate_id"])
    op.create_index("ix_profile_views_viewed_at", "profile_views", ["viewed_at"])

    # ─── comparisons ──────────────────────────────────────────────
    op.create_table(
        "comparisons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "company_id", sa.Integer(),
            sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "criteria_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False,
        ),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_comparisons_company_id", "comparisons", ["company_id"])
    op.create_index("ix_comparisons_created_at", "comparisons", ["created_at"])

    op.create_table(
        "comparison_candidates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "comparison_id", sa.Integer(),
            sa.ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.Column(
            "candidate_id", sa.Integer(),
            sa.ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False,
        ),
        sa.UniqueConstraint(
            "comparison_id", "candidate_id",
            name="uq_comparison_candidates_pair",
        ),
    )
    op.create_index(
        "ix_comparison_candidates_comparison_id",
        "comparison_candidates", ["comparison_id"],
    )


def downgrade() -> None:
    for name in (
        "comparison_candidates",
        "comparisons",
        "profile_views",
        "job_invitations",
        "job_requirements",
        "companies",
        "cvs",
        "projects",
        "experiences",
        "skills",
        "candidate_profiles",
        "social_accounts",
        "users",
        "system_settings",
        "templates",
    ):
        op.drop_table(name)

    bind = op.get_bind()
    for name in (
        "templatestatus",
        "viewertype",
        "invitationstatus",
        "companystatus",
        "experiencelevel",
        "userstatus",
        "userrole",
    ):
        sa.Enum(name=name).drop(bind, checkfirst=True)
