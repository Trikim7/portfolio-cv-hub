"""File upload service"""
import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings


class FileUploadService:
    """File upload handling - local storage or S3/MinIO"""

    @staticmethod
    def get_upload_directory() -> Path:
        """Get upload directory and create if not exists"""
        upload_dir = Path(settings.upload_dir)
        upload_dir.mkdir(parents=True, exist_ok=True)
        return upload_dir

    @staticmethod
    async def save_cv_file(file: UploadFile, user_id: int) -> tuple[str, str, int]:
        """
        Save CV file to local storage
        Returns: (file_path, file_name, file_size)
        """
        # Validate file type
        if not file.content_type or "pdf" not in file.content_type.lower():
            raise ValueError("Only PDF files are allowed")

        # Create user directory
        upload_dir = FileUploadService.get_upload_directory()
        user_dir = upload_dir / f"user_{user_id}"
        user_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename
        original_filename = file.filename
        file_extension = Path(original_filename).suffix
        unique_filename = f"cv_{user_id}_{int(os.urandom(4).hex(), 16)}{file_extension}"
        file_path = user_dir / unique_filename

        # Save file
        try:
            with open(file_path, "wb") as f:
                content = await file.read()
                # Check file size
                if len(content) > settings.max_file_size_mb * 1024 * 1024:
                    raise ValueError(f"File size exceeds {settings.max_file_size_mb}MB")
                f.write(content)

            return str(file_path), original_filename, len(content)
        except Exception as e:
            if file_path.exists():
                file_path.unlink()
            raise e

    @staticmethod
    def delete_cv_file(file_path: str) -> bool:
        """Delete CV file from local storage"""
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception:
            return False

    @staticmethod
    def get_cv_file_path(file_path: str) -> Optional[Path]:
        """Get full path to CV file"""
        path = Path(file_path)
        if path.exists():
            return path
        return None


class S3FileUploadService:
    """S3/MinIO file upload service (optional)"""

    @staticmethod
    async def save_cv_file_to_s3(file: UploadFile, user_id: int) -> tuple[str, str, int]:
        """
        Save CV file to S3/MinIO
        Returns: (s3_url, file_name, file_size)
        Requires: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME
        """
        import boto3

        if not all([
            settings.aws_access_key_id,
            settings.aws_secret_access_key,
            settings.aws_storage_bucket_name
        ]):
            raise ValueError("S3 credentials not configured")

        # Validate file type
        if not file.content_type or "pdf" not in file.content_type.lower():
            raise ValueError("Only PDF files are allowed")

        try:
            # Create S3 client
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=settings.aws_region
            )

            # Read file content
            content = await file.read()
            if len(content) > settings.max_file_size_mb * 1024 * 1024:
                raise ValueError(f"File size exceeds {settings.max_file_size_mb}MB")

            # Generate S3 key
            original_filename = file.filename
            s3_key = f"cvs/user_{user_id}/{original_filename}"

            # Upload to S3
            s3_client.put_object(
                Bucket=settings.aws_storage_bucket_name,
                Key=s3_key,
                Body=content,
                ContentType="application/pdf"
            )

            # Generate S3 URL
            s3_url = f"s3://{settings.aws_storage_bucket_name}/{s3_key}"

            return s3_url, original_filename, len(content)
        except Exception as e:
            raise e
