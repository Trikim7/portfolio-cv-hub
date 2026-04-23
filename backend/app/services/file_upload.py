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
        Upload CV file (PDF).
        Returns: (file_path_or_url, original_file_name, file_size_bytes)

        • Cloudinary configured → uploads to Cloudinary (resource_type=raw),
          returns the CDN URL as file_path. PDF is publicly accessible via the URL.
        • No credentials      → saves to local disk (dev fallback).
        """
        if not file.content_type or "pdf" not in file.content_type.lower():
            raise ValueError("Only PDF files are allowed")

        original_filename = file.filename or f"cv_{user_id}.pdf"
        content = await file.read()

        if len(content) > settings.max_file_size_mb * 1024 * 1024:
            raise ValueError(f"File size exceeds {settings.max_file_size_mb}MB")

        # ── Cloudinary path ──────────────────────────────────────────────────
        if FileUploadService._cloudinary_configured():
            import asyncio
            import cloudinary
            import cloudinary.uploader
            import io
            from app.core.config import settings as _s

            cloudinary.config(
                cloud_name=_s.cloudinary_cloud_name,
                api_key=_s.cloudinary_api_key,
                api_secret=_s.cloudinary_api_secret,
                secure=True,
            )

            # Use a stable public_id so re-uploads overwrite the old version
            public_id = f"cv_user_{user_id}_{int(os.urandom(4).hex(), 16)}"
            pdf_bytes = io.BytesIO(content)

            def _do_upload():
                return cloudinary.uploader.upload(
                    pdf_bytes,
                    public_id=public_id,
                    folder="portfolio_cv_hub/cvs",
                    resource_type="raw",   # raw = non-image files (PDF, DOCX, …)
                    overwrite=True,
                    invalidate=True,
                )

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, _do_upload)
            cdn_url: str = result["secure_url"]
            return cdn_url, original_filename, len(content)

        # ── Local disk fallback (dev without Cloudinary keys) ────────────────
        upload_dir = FileUploadService.get_upload_directory()
        user_dir = upload_dir / f"user_{user_id}"
        user_dir.mkdir(parents=True, exist_ok=True)

        file_extension = Path(original_filename).suffix or ".pdf"
        unique_filename = f"cv_{user_id}_{int(os.urandom(4).hex(), 16)}{file_extension}"
        file_path = user_dir / unique_filename
        try:
            with open(file_path, "wb") as f:
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

    # ─── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _cloudinary_configured() -> bool:
        """Return True when all three Cloudinary credentials are present."""
        from app.core.config import settings
        return bool(
            settings.cloudinary_cloud_name
            and settings.cloudinary_api_key
            and settings.cloudinary_api_secret
        )

    @staticmethod
    async def _upload_image_to_cloudinary(
        content: bytes,
        public_id: str,
        folder: str,
        content_type: str,
    ) -> str:
        """
        Upload raw image bytes to Cloudinary (runs in thread pool — non-blocking).
        Returns the secure HTTPS URL of the uploaded image.
        """
        import asyncio
        import cloudinary
        import cloudinary.uploader
        import io
        from app.core.config import settings

        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )

        image_bytes = io.BytesIO(content)

        def _do_upload():
            return cloudinary.uploader.upload(
                image_bytes,
                public_id=public_id,
                folder=folder,
                resource_type="image",
                overwrite=True,    # replace old image — filename stays stable
                invalidate=True,   # bust CDN cache on replace
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                    {"quality": "auto", "fetch_format": "auto"},
                ],
            )

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _do_upload)
        return result["secure_url"]

    # ─── Avatar upload ─────────────────────────────────────────────────────────

    @staticmethod
    async def save_avatar_file(file: UploadFile, user_id: int) -> str:
        """
        Upload a candidate avatar.
        • If Cloudinary credentials are set  → upload to Cloudinary, return CDN URL.
        • Otherwise (local dev)              → save to disk, return /uploads/... path.
        """
        ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
        ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

        if not file.content_type or file.content_type.lower() not in ALLOWED_TYPES:
            raise ValueError("Only image files are allowed (JPEG, PNG, GIF, WebP)")

        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise ValueError("Avatar file size exceeds 5 MB")

        # ── Cloudinary path ──────────────────────────────────────────────────
        if FileUploadService._cloudinary_configured():
            return await FileUploadService._upload_image_to_cloudinary(
                content=content,
                public_id=f"avatar_user_{user_id}",
                folder="portfolio_cv_hub/avatars",
                content_type=file.content_type,
            )

        # ── Local fallback (development without Cloudinary keys) ─────────────
        upload_dir = FileUploadService.get_upload_directory()
        avatar_dir = upload_dir / "avatars" / f"user_{user_id}"
        avatar_dir.mkdir(parents=True, exist_ok=True)

        original_ext = Path(file.filename or "avatar.jpg").suffix.lower()
        if original_ext not in ALLOWED_EXT:
            original_ext = ".jpg"
        unique_filename = f"avatar_{user_id}_{int(os.urandom(4).hex(), 16)}{original_ext}"
        file_path = avatar_dir / unique_filename
        with open(file_path, "wb") as f:
            f.write(content)
        return f"/uploads/avatars/user_{user_id}/{unique_filename}"

    # ─── Logo upload ───────────────────────────────────────────────────────────

    @staticmethod
    async def save_logo_file(file: UploadFile, company_id: int) -> str:
        """
        Upload a company logo.
        • If Cloudinary credentials are set  → upload to Cloudinary, return CDN URL.
        • Otherwise (local dev)              → save to disk, return /uploads/... path.
        """
        ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"}
        ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}

        if not file.content_type or file.content_type.lower() not in ALLOWED_TYPES:
            raise ValueError("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)")

        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise ValueError("Logo file size exceeds 5 MB")

        # ── Cloudinary path ──────────────────────────────────────────────────
        if FileUploadService._cloudinary_configured():
            return await FileUploadService._upload_image_to_cloudinary(
                content=content,
                public_id=f"logo_company_{company_id}",
                folder="portfolio_cv_hub/logos",
                content_type=file.content_type,
            )

        # ── Local fallback ───────────────────────────────────────────────────
        upload_dir = FileUploadService.get_upload_directory()
        logo_dir = upload_dir / "logos" / f"company_{company_id}"
        logo_dir.mkdir(parents=True, exist_ok=True)

        original_ext = Path(file.filename or "logo.png").suffix.lower()
        if original_ext not in ALLOWED_EXT:
            original_ext = ".png"
        unique_filename = f"logo_{company_id}_{int(os.urandom(4).hex(), 16)}{original_ext}"
        file_path = logo_dir / unique_filename
        with open(file_path, "wb") as f:
            f.write(content)
        return f"/uploads/logos/company_{company_id}/{unique_filename}"



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
