"""CV Generator API routes (Phase 2 — Auto-generate CV)."""
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import Response, JSONResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.auth import AuthService
from app.services.cv_generator import CVGeneratorService, SUPPORTED_TEMPLATES, SUPPORTED_FORMATS

router = APIRouter(prefix="/api/cv", tags=["cv-generator"])


def _get_current_user_id(request: Request, db: Session = Depends(get_db)) -> int:
    """Extract user_id from Bearer token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    token = auth_header.replace("Bearer ", "")
    try:
        user = AuthService.get_current_user(db, token)
        return user.id
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/preview")
async def preview_cv(
    template: str = Query(default="modern", description="Template: traditional|modern|creative|minimal"),
    locale: str = Query(default="vi", description="Locale: vi|en"),
    user_id: int = Depends(_get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Trả về HTML preview của CV — dùng cho live preview trên frontend.

    Response: { html: string, template: string, locale: string }
    """
    try:
        html = CVGeneratorService.preview_html(db, user_id, template=template, locale=locale)
        return JSONResponse(content={"html": html, "template": template, "locale": locale})
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate")
async def generate_cv(
    template: str = Query(default="modern", description="Template: traditional|modern|creative|minimal"),
    locale: str = Query(default="vi", description="Locale: vi|en"),
    fmt: str = Query(default="pdf", alias="format", description="Output format: pdf|html"),
    user_id: int = Depends(_get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Sinh và tải xuống file CV từ dữ liệu portfolio.

    - **template**: `traditional` | `modern` | `creative` | `minimal`
    - **locale**: `vi` | `en`
    - **format**: `pdf` | `html`

    Response: file stream (application/pdf hoặc text/html)
    """
    if fmt not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Định dạng không hợp lệ. Hỗ trợ: {SUPPORTED_FORMATS}",
        )
    if template not in SUPPORTED_TEMPLATES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Template không hợp lệ. Hỗ trợ: {SUPPORTED_TEMPLATES}",
        )

    try:
        file_bytes = CVGeneratorService.generate(
            db, user_id, template=template, locale=locale, fmt=fmt
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    if fmt == "pdf":
        filename = f"cv_{template}_{locale}.pdf"
        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    else:
        filename = f"cv_{template}_{locale}.html"
        return Response(
            content=file_bytes,
            media_type="text/html; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )


@router.get("/templates")
async def list_templates():
    """Liệt kê các template CV có sẵn."""
    return {
        "templates": [
            {"id": "traditional", "name": "Traditional", "description": "Classic professional layout"},
            {"id": "modern", "name": "Modern", "description": "Clean blue modern design"},
            {"id": "creative", "name": "Creative", "description": "Purple creative style"},
            {"id": "minimal", "name": "Minimal", "description": "Simple minimal layout"},
        ],
        "formats": SUPPORTED_FORMATS,
        "locales": ["vi", "en"],
    }
