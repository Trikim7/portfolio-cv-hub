"""User repository (Phase 2)."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserStatus
from app.core.security import get_password_hash


class UserRepository:
    """User data-access layer."""

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        password: Optional[str] = None,
        role: UserRole = UserRole.CANDIDATE,
        full_name: Optional[str] = None,
        status: UserStatus = UserStatus.ACTIVE,
    ) -> User:
        """Create a user. Password may be None for social-only accounts."""
        password_hash = get_password_hash(password) if password else None
        user = User(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role=role,
            status=status,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def set_status(db: Session, user_id: int, status: UserStatus) -> Optional[User]:
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            return None
        user.status = status
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> Optional[User]:
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True
