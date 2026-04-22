"""Candidate portfolio API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Header, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services.auth import AuthService
from app.services.candidate import CandidateService
from app.services.file_upload import FileUploadService
from app.schemas.candidate import (
    CandidateProfileResponse, CandidateProfileUpdate, SkillCreate, SkillResponse, SkillUpdate,
    ExperienceCreate, ExperienceResponse, ExperienceUpdate, ProjectCreate, ProjectResponse, ProjectUpdate,
    CVResponse
)

router = APIRouter(prefix="/api/candidate", tags=["candidate"])


def get_current_user_id(request: Request, db: Session = Depends(get_db)):
    """Extract user_id from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    token = auth_header.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        return user.id
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


# Profile endpoints
@router.get("/profile", response_model=CandidateProfileResponse)
async def get_my_profile(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get candidate's own profile"""
    try:
        profile = CandidateService.get_my_profile(db, user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/profile", response_model=CandidateProfileResponse)
async def update_profile(
    profile_data: CandidateProfileUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update candidate's profile (name, title, bio, avatar)"""
    try:
        profile = CandidateService.update_profile(db, user_id, profile_data)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Upload a new avatar image for the candidate profile."""
    try:
        avatar_url = await FileUploadService.save_avatar_file(file, user_id)
        profile = CandidateService.update_avatar_url(db, user_id, avatar_url)
        return {"avatar_url": profile.avatar_url}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/profile/toggle-public")
async def toggle_public_profile(
    is_public: bool,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Toggle profile public visibility"""
    try:
        profile = CandidateService.toggle_public_profile(db, user_id, is_public)
        return {"message": "Profile visibility updated", "is_public": profile.is_public}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/public/{profile_slug}", response_model=CandidateProfileResponse)
async def get_public_profile(profile_slug: str, db: Session = Depends(get_db)):
    """Get public profile by slug (increments view count automatically)"""
    try:
        profile = CandidateService.get_public_profile(db, profile_slug)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/analytics/stats")
async def get_candidate_analytics(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get analytics stats for candidate (total views + total invitations)"""
    try:
        stats = CandidateService.get_candidate_analytics(db, user_id)
        return stats
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/invitations")
async def get_my_invitations(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get all job invitations received by the current candidate (UC5)."""
    try:
        from app.services.recruiter import JobInvitationService
        from app.repositories.candidate import CandidateProfileRepository
        from app.models.recruiter import Company

        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        invitations = JobInvitationService.get_candidate_invitations(db, profile.id)

        result = []
        for inv in invitations:
            company = db.query(Company).filter(Company.id == inv.company_id).first()
            result.append({
                "id": inv.id,
                "job_title": inv.job_title,
                "message": inv.message,
                "status": inv.status.value if hasattr(inv.status, "value") else inv.status,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
                "updated_at": inv.updated_at.isoformat() if inv.updated_at else None,
                "company": {
                    "id": company.id if company else None,
                    "name": company.company_name if company else "Không rõ",
                    "logo_url": company.logo_url if company else None,
                    "website": company.website if company else None,
                } if company else None,
            })
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/invitations/{invitation_id}/respond")
async def respond_to_invitation(
    invitation_id: int,
    status_value: str,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Candidate responds to a job invitation: interested | rejected (UC5)."""
    allowed = {"interested", "rejected"}
    if status_value not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"status_value must be one of: {', '.join(allowed)}"
        )
    try:
        from app.services.recruiter import JobInvitationService
        from app.repositories.candidate import CandidateProfileRepository
        from app.models.recruiter import JobInvitation

        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        inv = db.query(JobInvitation).filter(
            JobInvitation.id == invitation_id,
            JobInvitation.candidate_id == profile.id,
        ).first()
        if not inv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

        updated = JobInvitationService.update_status(db, invitation_id, status_value)
        return {
            "id": updated.id,
            "status": updated.status.value if hasattr(updated.status, "value") else updated.status,
            "message": "Đã cập nhật trạng thái lời mời",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Skills endpoints
@router.post("/skills", response_model=SkillResponse)
async def add_skill(
    skill_data: SkillCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add skill to candidate"""
    try:
        skill = CandidateService.add_skill(db, user_id, skill_data)
        return skill
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/skills", response_model=List[SkillResponse])
async def get_skills(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get all skills for candidate"""
    try:
        skills = CandidateService.get_skills(db, user_id)
        return skills
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/skills/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update candidate's skill"""
    try:
        skill = CandidateService.update_skill(db, user_id, skill_id, skill_data)
        return skill
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/skills/{skill_id}")
async def delete_skill(
    skill_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete candidate's skill"""
    try:
        success = CandidateService.delete_skill(db, user_id, skill_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        return {"message": "Skill deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Experiences endpoints
@router.post("/experiences", response_model=ExperienceResponse)
async def add_experience(
    exp_data: ExperienceCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add work experience to candidate"""
    try:
        experience = CandidateService.add_experience(db, user_id, exp_data)
        return experience
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/experiences", response_model=List[ExperienceResponse])
async def get_experiences(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get all experiences for candidate"""
    try:
        experiences = CandidateService.get_experiences(db, user_id)
        return experiences
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/experiences/{experience_id}", response_model=ExperienceResponse)
async def update_experience(
    experience_id: int,
    exp_data: ExperienceUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update candidate's experience"""
    try:
        experience = CandidateService.update_experience(db, user_id, experience_id, exp_data)
        return experience
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/experiences/{experience_id}")
async def delete_experience(
    experience_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete candidate's experience"""
    try:
        success = CandidateService.delete_experience(db, user_id, experience_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience not found")
        return {"message": "Experience deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Projects endpoints
@router.post("/projects", response_model=ProjectResponse)
async def add_project(
    proj_data: ProjectCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Add project to candidate"""
    try:
        project = CandidateService.add_project(db, user_id, proj_data)
        return project
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get all projects for candidate"""
    try:
        projects = CandidateService.get_projects(db, user_id)
        return projects
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    proj_data: ProjectUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update candidate's project"""
    try:
        project = CandidateService.update_project(db, user_id, project_id, proj_data)
        return project
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete candidate's project"""
    try:
        success = CandidateService.delete_project(db, user_id, project_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# CV/Resume endpoints
@router.post("/cvs/upload", response_model=CVResponse)
async def upload_cv(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload CV file (PDF only)"""
    try:
        file_path, file_name, file_size = await FileUploadService.save_cv_file(file, user_id)
        cv = CandidateService.add_cv(db, user_id, file_name, file_path, file_size)
        return cv
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/cvs", response_model=List[CVResponse])
async def get_cvs(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Get all CVs for candidate"""
    try:
        cvs = CandidateService.get_cvs(db, user_id)
        return cvs
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/cvs/{cv_id}/set-primary")
async def set_primary_cv(
    cv_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Set CV as primary"""
    try:
        cv = CandidateService.set_primary_cv(db, user_id, cv_id)
        return {"message": "CV set as primary", "cv": cv}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/cvs/{cv_id}")
async def delete_cv(
    cv_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete candidate's CV"""
    try:
        success = CandidateService.delete_cv(db, user_id, cv_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")
        return {"message": "CV deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Public CV download — no auth required (portfolio is public)
@router.get("/cvs/download/{cv_id}")
async def download_cv_public(cv_id: int, db: Session = Depends(get_db)):
    """Download a CV file by id (public — used from public portfolio page).
    Always forces browser download via Content-Disposition: attachment.
    """
    from app.repositories.candidate import CVRepository
    from pathlib import Path
    from fastapi.responses import StreamingResponse
    import httpx
    import io

    cv = CVRepository.get_cv_by_id(db, cv_id)
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")

    file_path: str = cv.file_path or ""
    safe_filename = cv.file_name or "cv.pdf"
    # RFC 5987 — safe ASCII fallback for Content-Disposition
    ascii_filename = safe_filename.encode("ascii", errors="replace").decode()
    disposition = f'attachment; filename="{ascii_filename}"'

    # Cloudinary / CDN URL — proxy through backend so we control headers
    if file_path.startswith("http://") or file_path.startswith("https://"):
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
                resp = await client.get(file_path)
            resp.raise_for_status()
            return StreamingResponse(
                io.BytesIO(resp.content),
                media_type="application/pdf",
                headers={"Content-Disposition": disposition},
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Could not fetch CV from storage: {exc}")

    # Local disk path
    path = Path(file_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV file not found on disk")

    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=safe_filename,
        headers={"Content-Disposition": disposition},
    )


# CV inline view — opens in browser tab (used by candidate dashboard)
@router.get("/cvs/view/{cv_id}")
async def view_cv(cv_id: int, db: Session = Depends(get_db)):
    """Serve CV for inline viewing in browser (Content-Disposition: inline).
    Always proxies through backend so we fully control headers.
    """
    from app.repositories.candidate import CVRepository
    from pathlib import Path
    from fastapi.responses import Response
    import httpx

    cv = CVRepository.get_cv_by_id(db, cv_id)
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")

    file_path: str = cv.file_path or ""
    safe_filename = cv.file_name or "cv.pdf"
    ascii_filename = safe_filename.encode("ascii", errors="replace").decode()
    inline_headers = {
        "Content-Disposition": f'inline; filename="{ascii_filename}"',
        "Content-Type": "application/pdf",
    }

    # Cloudinary / CDN URL — proxy content so we control Content-Disposition
    if file_path.startswith("http://") or file_path.startswith("https://"):
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
                resp = await client.get(file_path)
            resp.raise_for_status()
            return Response(content=resp.content, headers=inline_headers)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Could not fetch CV: {exc}")

    # Local disk path
    path = Path(file_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV file not found on disk")

    return Response(content=path.read_bytes(), headers=inline_headers)

