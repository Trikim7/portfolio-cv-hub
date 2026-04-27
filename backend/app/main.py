"""FastAPI application factory (Phase 2 — PostgreSQL)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command
from app.api import auth, candidate, recruiter, admin, scoring, oauth, public, cv_generator
from app.db.database import Base, engine
from app.core.config import settings

# Run Alembic migrations on startup (creates/updates tables automatically).
_alembic_cfg = Config("alembic.ini")
command.upgrade(_alembic_cfg, "head")


# ─── Auto-seed default admin account ──────────────────────────
def _seed_admin():
    """Create admin account on first launch if it doesn't exist yet."""
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole, UserStatus
    from app.core.security import get_password_hash

    ADMIN_EMAIL = "admin@portfoliocvhub.com"
    ADMIN_PASSWORD = "admin123"

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if not existing:
            admin_user = User(
                email=ADMIN_EMAIL,
                password_hash=get_password_hash(ADMIN_PASSWORD),
                full_name="System Administrator",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
            )
            db.add(admin_user)
            db.commit()
            print(f"Default admin created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
        else:
            changed = False
            if existing.role != UserRole.ADMIN:
                existing.role = UserRole.ADMIN
                changed = True
            if existing.status != UserStatus.ACTIVE:
                existing.status = UserStatus.ACTIVE
                changed = True
            if changed:
                db.commit()
            print(f"Admin account ready: {ADMIN_EMAIL}")
    finally:
        db.close()


_seed_admin()


def _load_smtp_config_from_db():
    """1) If `smtp_config` exists in DB, apply it (wins over env). 2) Else, if env has SMTP credentials, copy env → DB so `system_settings` has one row to inspect."""
    from app.db.database import SessionLocal
    from app.core.smtp_config import load_smtp_from_db, bootstrap_smtp_in_db_from_env_if_missing

    db = SessionLocal()
    try:
        if not load_smtp_from_db(db):
            bootstrap_smtp_in_db_from_env_if_missing(db)
    finally:
        db.close()


_load_smtp_config_from_db()


# Create FastAPI app
app = FastAPI(
    title="Portfolio CV Hub API",
    description="Backend API for Portfolio CV Hub - Candidate Module",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(candidate.router)
app.include_router(recruiter.router)
app.include_router(admin.router)
app.include_router(scoring.router)
app.include_router(oauth.router)
app.include_router(public.router)
app.include_router(cv_generator.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK", "service": "Portfolio CV Hub Backend"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Portfolio CV Hub Backend API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
