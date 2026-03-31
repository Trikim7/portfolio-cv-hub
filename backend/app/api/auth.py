"""Authentication API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth import AuthService

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


@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: str = None, db: Session = Depends(get_db)):
    """Get current user info"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    token = authorization.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
