"""Authentication service"""
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.security import verify_password, create_access_token
from app.repositories.user import UserRepository
from app.models.user import UserRole, User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
import uuid


class AuthService:
    """Authentication business logic"""

    @staticmethod
    def register(db: Session, user_data: UserRegister) -> User:
        """Register new user"""
        # Check if user already exists
        existing_user = UserRepository.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError(f"Email {user_data.email} already registered")

        # Convert role string to enum
        role = UserRole.CANDIDATE
        if user_data.role:
            try:
                role = UserRole(user_data.role)
            except (ValueError, KeyError):
                role = UserRole.CANDIDATE

        # Create new user
        user = UserRepository.create_user(
            db,
            email=user_data.email,
            password=user_data.password,
            role=role
        )
        return user

    @staticmethod
    def login(db: Session, user_data: UserLogin) -> TokenResponse:
        """Login user and return token"""
        user = UserRepository.get_user_by_email(db, user_data.email)
        
        if not user:
            raise ValueError("Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.")

        if not verify_password(user_data.password, user.hashed_password):
            raise ValueError("Mật khẩu không chính xác.")

        if not user.is_active:
            if user.role == UserRole.RECRUITER and user.company_profile:
                from app.models.recruiter import CompanyStatus
                if user.company_profile.status == CompanyStatus.REJECTED:
                    raise ValueError("Yêu cầu đăng ký doanh nghiệp của bạn đã bị từ chối. Vui lòng liên hệ Admin (admin@portfoliocvhub.com) để biết thêm chi tiết.")
            raise ValueError("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Admin (admin@portfoliocvhub.com) để được hỗ trợ.")

        # Create access token
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.value}
        )

        from app.schemas.user import UserResponse
        user_response = UserResponse.model_validate(user)
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )

    @staticmethod
    def verify_token(token: str) -> dict | None:
        """Verify JWT token and return payload"""
        from app.core.security import decode_access_token
        return decode_access_token(token)

    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
        """Get current user from token"""
        payload = AuthService.verify_token(token)
        if not payload:
            raise ValueError("Invalid token")

        user_id = payload.get("user_id")
        if not user_id:
            raise ValueError("Invalid token payload")

        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")

        return user
