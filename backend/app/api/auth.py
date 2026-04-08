"""Authentication API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.schemas.recruiter import CompanyRegister, RecruiterRegisterRequest
from app.services.auth import AuthService
from app.services.recruiter import RecruiterService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user (Candidate)"""
    try:
        user = AuthService.register(db, user_data)
        # Automatically create candidate profile after registration
        from app.services.candidate import CandidateService
        from app.schemas.candidate import CandidateProfileCreate
        
        profile = CandidateService.create_profile(db, user.id, CandidateProfileCreate())

        # Generate token
        from app.core.security import create_access_token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.value}
        )

        user_response = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )
    except ValueError as e:
        import logging
        logging.error(f"Registration validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        import logging
        logging.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        token_response = AuthService.login(db, user_data)
        return token_response
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/register-recruiter", response_model=TokenResponse)
async def register_recruiter(
    request_data: RecruiterRegisterRequest,
    db: Session = Depends(get_db)
):
    """Register recruiter company (pending admin approval)"""
    try:
        # Create user with recruiter role
        user_data = UserRegister(
            email=request_data.email,
            password=request_data.password,
            role="recruiter"
        )
        user = AuthService.register(db, user_data)
        
        # Create company profile
        company_data = CompanyRegister(
            company_name=request_data.company_name,
            website=request_data.website,
            description=request_data.description,
            location=request_data.location,
            email=request_data.company_email,
            phone=request_data.phone
        )
        company = RecruiterService.register_company(db, user.id, company_data)

        from app.core.security import create_access_token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.value}
        )

        user_response = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


from fastapi import Request

@router.get("/me", response_model=UserResponse)
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Get current user info"""
    authorization = request.headers.get("Authorization")
    print(f"DEBUG: /me endpoint - Authorization: {authorization}")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    token = authorization.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        print(f"DEBUG: /me endpoint - User: ID={user.id}, Email={user.email}, Role={user.role.value}")
        return UserResponse.model_validate(user)
    except ValueError as e:
        print(f"DEBUG: /me endpoint - ValueError: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/test-role-check")
async def test_role_check(request: Request, db: Session = Depends(get_db)):
    """Test endpoint to check user role and permission"""
    authorization = request.headers.get("Authorization")
    print(f"DEBUG: /test-role-check - Authorization: {authorization}")
    if not authorization or not authorization.startswith("Bearer "):
        return {"status": "no_token", "detail": "No authorization header"}

    token = authorization.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        print(f"DEBUG: User from token - ID={user.id}, Email={user.email}, Role={user.role}, Role.value={user.role.value}")
        
        # Check if recruiter
        is_recruiter = user.role.value == "recruiter"
        print(f"DEBUG: is_recruiter = {is_recruiter}")
        
        return {
            "status": "success",
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value,
            "role_enum": str(user.role),
            "is_recruiter": is_recruiter
        }
    except ValueError as e:
        print(f"DEBUG: /test-role-check - ValueError: {str(e)}")
        return {"status": "error", "detail": str(e)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
