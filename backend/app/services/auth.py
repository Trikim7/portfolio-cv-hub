"""Authentication service (Phase 2)."""
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.repositories.user import UserRepository
from app.models.user import UserRole, UserStatus, User
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse


class AuthService:
    """Authentication business logic."""

    @staticmethod
    def register(db: Session, user_data: UserRegister) -> User:
        """Register a new local (email + password) user."""
        existing = UserRepository.get_user_by_email(db, user_data.email)
        if existing:
            raise ValueError(f"Email {user_data.email} already registered")

        role = UserRole.CANDIDATE
        if user_data.role:
            try:
                role = UserRole(user_data.role)
            except (ValueError, KeyError):
                role = UserRole.CANDIDATE

        return UserRepository.create_user(
            db,
            email=user_data.email,
            password=user_data.password,
            role=role,
            full_name=user_data.full_name,
        )

    @staticmethod
    def login(db: Session, user_data: UserLogin) -> TokenResponse:
        """Login with email + password."""
        user = UserRepository.get_user_by_email(db, user_data.email)

        if not user:
            raise ValueError(
                "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại."
            )

        if not user.password_hash:
            raise ValueError(
                "Tài khoản này đăng ký qua mạng xã hội. Vui lòng đăng nhập bằng Google/GitHub."
            )

        if not verify_password(user_data.password, user.password_hash):
            raise ValueError("Mật khẩu không chính xác.")

        if user.status != UserStatus.ACTIVE:
            # Recruiter rejected companies keep their user row but flip to LOCKED.
            if user.role == UserRole.RECRUITER and user.company_profile:
                from app.models.recruiter import CompanyStatus
                if user.company_profile.status == CompanyStatus.REJECTED:
                    raise ValueError(
                        "Yêu cầu đăng ký doanh nghiệp của bạn đã bị từ chối. "
                        "Vui lòng liên hệ Admin (admin@portfoliocvhub.com) để biết thêm chi tiết."
                    )
            raise ValueError(
                "Tài khoản của bạn đã bị tạm khóa. "
                "Vui lòng liên hệ Admin (admin@portfoliocvhub.com) để được hỗ trợ."
            )

        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.value}
        )
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def verify_token(token: str):
        from app.core.security import decode_access_token
        return decode_access_token(token)

    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
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
