"""Recruiter API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.services.auth import AuthService
from app.services.recruiter import RecruiterService, SearchService, JobInvitationService
from app.services.file_upload import FileUploadService
from app.repositories.recruiter import CompanyRepository
from app.schemas.recruiter import (
    CompanyRegister, CompanyUpdate, CompanyResponse, JobInvitationCreate,
    JobInvitationResponse, CandidateSearchResult
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
