"""User repository"""
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import get_password_hash


class UserRepository:
    """User data access layer"""

    @staticmethod
    def create_user(db: Session, email: str, password: str, role: UserRole = UserRole.CANDIDATE) -> User:
        """Create new user"""
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User | None:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100):
        """Get all users with pagination"""
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> User | None:
        """Update user"""
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
        """Delete user"""
        user = UserRepository.get_user_by_id(db, user_id)
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True
