"""Application configuration"""
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application settings from environment variables"""

    # Database
    database_url: str = "sqlite:///./portfolio_cv_hub.db"

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

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="allow"
    )


settings = Settings()
