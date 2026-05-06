"""Application configuration"""
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Database — mặc định PostgreSQL, override bằng biến môi trường DATABASE_URL
    database_url: str = "postgresql://cvhub:cvhub_secret@db:5432/portfolio_cv_hub"

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # JWT
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # File Upload
    upload_dir: str = "./uploads"
    max_file_size_mb: int = 10

    # AWS S3 (optional)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_storage_bucket_name: Optional[str] = None
    aws_region: Optional[str] = "us-east-1"

    # MinIO (optional)
    minio_url: Optional[str] = None
    minio_access_key: Optional[str] = None
    minio_secret_key: Optional[str] = None
    minio_bucket_name: Optional[str] = "portfolio-files"

    # Cloudinary (image uploads for avatars & logos)
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # OAuth2 providers (social auth)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    oauth_redirect_base_url: str = "http://localhost:8000"
    frontend_base_url: str = "http://localhost:3000"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # SMTP Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_address: str = "noreply@portfoliocvhub.com"
    smtp_enabled: bool = False

    # Resend (preferred in production cloud where SMTP ports can be blocked)
    resend_api_key: Optional[str] = None
    resend_from_address: Optional[str] = None
    resend_enabled: bool = False

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="allow"
    )


settings = Settings()
