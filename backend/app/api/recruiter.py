"""Recruiter API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services.auth import AuthService
from app.services.recruiter import RecruiterService, SearchService, JobInvitationService, JobRequirementService
from app.services.file_upload import FileUploadService
from app.repositories.recruiter import CompanyRepository
from app.schemas.recruiter import (
    CompanyRegister, CompanyUpdate, CompanyResponse, JobInvitationCreate,
    JobInvitationResponse, CandidateSearchResult, JobRequirementCreate, 
    JobRequirementUpdate, JobRequirementResponse
)

router = APIRouter(prefix="/api/recruiter", tags=["recruiter"])


def get_current_recruiter_id(request: Request, db: Session = Depends(get_db)):
    """Extract recruiter user_id from token"""
    auth_header = request.headers.get("Authorization")
    print(f"DEBUG: Authorization header: {auth_header}")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        print("DEBUG: No auth header or invalid format")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    token = auth_header.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        print(f"DEBUG: User found - ID: {user.id}, Email: {user.email}, Role: {user.role.value}")
        if user.role.value != "recruiter":
            print(f"DEBUG: User role is '{user.role.value}', not 'recruiter' - rejecting")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter only")
        return user.id
    except ValueError as e:
        print(f"DEBUG: ValueError - {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


# Company Profile
@router.get("/company/profile", response_model=CompanyResponse)
async def get_company_profile(
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Get company profile"""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


@router.put("/company/profile", response_model=CompanyResponse)
async def update_company_profile(
    company_data: CompanyUpdate,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Update company profile"""
    print(f"DEBUG: PUT /company/profile - user_id={user_id}")
    print(f"DEBUG: company_data={company_data}")
    
    company = RecruiterService.get_profile(db, user_id)
    print(f"DEBUG: Found company - id={company.id if company else None}")
    
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    
    updated = RecruiterService.update_profile(db, company.id, company_data)
    print(f"DEBUG: Updated company - {updated.company_name}")
    return updated


@router.post("/company/logo", response_model=CompanyResponse)
async def upload_company_logo(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db),
):
    """Upload / replace company logo image. Saves file to disk, updates companies.logo_url."""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    try:
        logo_url = await FileUploadService.save_logo_file(file, company.id)
        updated = CompanyRepository.update(db, company.id, logo_url=logo_url)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Search Candidates (Public - No Auth Required)
@router.get("/candidates/search", response_model=List[CandidateSearchResult])
async def search_candidates(
    keyword: Optional[str] = None,
    skill: Optional[str] = None,
    experience_level: Optional[str] = None,
    location: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Search candidates with filters"""
    candidates = SearchService.search(
        db,
        keyword=keyword,
        skill=skill,
        experience_level=experience_level,
        location=location,
        limit=limit
    )
    return [SearchService.format_result(c) for c in candidates]


# Job Invitations
@router.post("/invitations/send", response_model=JobInvitationResponse)
async def send_invitation(
    invite_data: JobInvitationCreate,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Send job invitation"""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    try:
        invitation = JobInvitationService.send(
            db,
            company_id=company.id,
            candidate_id=invite_data.candidate_id,
            job_title=invite_data.job_title,
            message=invite_data.message
        )

        # ── Email notification to candidate ─────────────────────
        try:
            from app.services.email import EmailService
            from app.models.user import User as UserModel
            from app.models.candidate import CandidateProfile

            cand_profile = db.query(CandidateProfile).filter(
                CandidateProfile.id == invite_data.candidate_id
            ).first()
            if cand_profile and cand_profile.user_id:
                cand_user = db.query(UserModel).filter(
                    UserModel.id == cand_profile.user_id
                ).first()
                if cand_user and cand_user.email:
                    EmailService.notify_invitation_sent(
                        candidate_email=cand_user.email,
                        candidate_name=cand_profile.full_name or "Ứng viên",
                        company_name=company.company_name,
                        job_title=invite_data.job_title,
                        message=invite_data.message,
                    )
        except Exception as email_err:
            import logging
            logging.getLogger(__name__).warning("Invitation email failed: %s", email_err)
        # ────────────────────────────────────────────────────────

        return invitation
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.get("/invitations", response_model=List[JobInvitationResponse])
async def get_invitations(
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Get company invitations"""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    return JobInvitationService.get_company_invitations(db, company.id)


@router.get("/invitations/detailed")
async def get_invitations_detailed(
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Get invitations with full candidate info (name, slug, avatar, headline) for recruiter dashboard (UC10)."""
    from app.models.candidate import CandidateProfile

    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    invitations = JobInvitationService.get_company_invitations(db, company.id)

    result = []
    for inv in invitations:
        candidate = db.query(CandidateProfile).filter(
            CandidateProfile.id == inv.candidate_id
        ).first()

        result.append({
            "id": inv.id,
            "job_title": inv.job_title,
            "message": inv.message,
            "status": inv.status.value if hasattr(inv.status, "value") else inv.status,
            "created_at": inv.created_at.isoformat() if inv.created_at else None,
            "updated_at": inv.updated_at.isoformat() if inv.updated_at else None,
            "candidate": {
                "id": candidate.id if candidate else inv.candidate_id,
                "full_name": candidate.full_name if candidate else "Ứng viên",
                "headline": candidate.headline if candidate else None,
                "avatar_url": candidate.avatar_url if candidate else None,
                "public_slug": candidate.public_slug if candidate else None,
                "is_public": candidate.is_public if candidate else False,
            } if candidate else None,
        })
    return result


@router.put("/invitations/{invitation_id}", response_model=JobInvitationResponse)
async def update_invitation(
    invitation_id: int,
    status: str,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Update invitation status"""
    updated = JobInvitationService.update_status(db, invitation_id, status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    return updated


@router.delete("/invitations/{invitation_id}")
async def delete_invitation(
    invitation_id: int,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Delete invitation"""
    success = JobInvitationService.delete(db, invitation_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    return {"message": "Deleted"}


# Job Requirements (Phase 2 - Hiring Criteria)

@router.post("/job-requirements", response_model=JobRequirementResponse)
async def create_job_requirement(
    job_req_data: JobRequirementCreate,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Create new job requirement/hiring criteria"""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    
    try:
        # Convert schema skills to list of dicts for JSONB storage
        required_skills = [skill.dict() for skill in job_req_data.required_skills]
        
        job_req = JobRequirementService.create_requirement(
            db,
            company_id=company.id,
            title=job_req_data.title,
            required_skills=required_skills,
            years_experience=job_req_data.years_experience,
            required_role=job_req_data.required_role,
            customer_facing=job_req_data.customer_facing,
            tech_stack=job_req_data.tech_stack,
            is_management_role=job_req_data.is_management_role,
            weights_config=job_req_data.weights_config,
            is_active=job_req_data.is_active,
        )
        return job_req
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/job-requirements/{job_requirement_id}", response_model=JobRequirementResponse)
async def get_job_requirement(
    job_requirement_id: int,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Get specific job requirement"""
    try:
        job_req = JobRequirementService.get_requirement(db, job_requirement_id)
        return job_req
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/job-requirements", response_model=List[JobRequirementResponse])
async def list_job_requirements(
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db),
    active_only: bool = False
):
    """List all job requirements for recruiter's company"""
    company = RecruiterService.get_profile(db, user_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    
    try:
        requirements = JobRequirementService.get_company_requirements(
            db, company.id, active_only=active_only
        )
        return requirements
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/job-requirements/{job_requirement_id}", response_model=JobRequirementResponse)
async def update_job_requirement(
    job_requirement_id: int,
    job_req_data: JobRequirementUpdate,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Update job requirement"""
    try:
        # Only update non-None fields
        update_dict = {}
        if job_req_data.title is not None:
            update_dict["title"] = job_req_data.title
        if job_req_data.required_skills is not None:
            update_dict["required_skills"] = [skill.dict() for skill in job_req_data.required_skills]
        if job_req_data.years_experience is not None:
            update_dict["years_experience"] = job_req_data.years_experience
        if job_req_data.required_role is not None:
            update_dict["required_role"] = job_req_data.required_role
        if job_req_data.customer_facing is not None:
            update_dict["customer_facing"] = job_req_data.customer_facing
        if job_req_data.tech_stack is not None:
            update_dict["tech_stack"] = job_req_data.tech_stack
        if job_req_data.is_management_role is not None:
            update_dict["is_management_role"] = job_req_data.is_management_role
        if job_req_data.weights_config is not None:
            update_dict["weights_config"] = job_req_data.weights_config
        if job_req_data.is_active is not None:
            update_dict["is_active"] = job_req_data.is_active
        
        job_req = JobRequirementService.update_requirement(db, job_requirement_id, **update_dict)
        return job_req
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/job-requirements/{job_requirement_id}")
async def delete_job_requirement(
    job_requirement_id: int,
    user_id: int = Depends(get_current_recruiter_id),
    db: Session = Depends(get_db)
):
    """Delete job requirement"""
    try:
        JobRequirementService.delete_requirement(db, job_requirement_id)
        return {"message": "Job requirement deleted"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

