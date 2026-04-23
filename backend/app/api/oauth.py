"""OAuth2 social-login routes (Phase 2 — Member 1).

Flow:
    GET /api/auth/oauth/{provider}/login        → 302 redirect to provider
    GET /api/auth/oauth/{provider}/callback     → handle provider redirect,
                                                  create/find user, issue app JWT,
                                                  then 302 redirect to the
                                                  configured frontend with the
                                                  token in the URL fragment.

Extra:
    GET /api/auth/oauth/accounts                → list linked accounts (auth)
    POST /api/auth/oauth/{provider}/link        → explicitly link a provider
                                                  to the currently signed-in user
    DELETE /api/auth/oauth/{provider}           → unlink a provider
"""
from __future__ import annotations

from datetime import timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token
from app.db.database import get_db
from app.models.user import SocialAccount, User
from app.schemas.user import UserResponse
from app.services.auth import AuthService
from app.services.oauth import SUPPORTED_PROVIDERS, OAuthService, _provider_config


router = APIRouter(prefix="/api/auth/oauth", tags=["oauth"])


class SocialAccountResponse(BaseModel):
    provider: str
    provider_account_id: str
    created_at: str

    @classmethod
    def from_orm(cls, row: SocialAccount) -> "SocialAccountResponse":
        return cls(
            provider=row.provider,
            provider_account_id=row.provider_account_id,
            created_at=row.created_at.isoformat() if row.created_at else "",
        )


def _require_provider(provider: str) -> None:
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}",
        )


def _current_user(request: Request, db: Session) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    token = auth_header.replace("Bearer ", "", 1)
    try:
        return AuthService.get_current_user(db, token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


# ---------------------------------------------------------------------------
# Login redirect
# ---------------------------------------------------------------------------


@router.get("/{provider}/login")
async def oauth_login(provider: str):
    """Kick off the OAuth dance — redirects the browser to the provider."""
    _require_provider(provider)
    try:
        url, _state = OAuthService.build_authorization_url(provider)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    # NOTE: for a production-grade CSRF defence, persist `_state` server-side
    # (session/redis) and verify in /callback. Frontend currently trusts the
    # backend callback, which runs server-to-server with Google anyway.
    return RedirectResponse(url, status_code=status.HTTP_302_FOUND)


@router.get("/{provider}/link-start")
async def oauth_link_start(
    provider: str, request: Request, db: Session = Depends(get_db)
):
    """Begin OAuth flow to *link* a provider to the signed-in user.

    Issues a short-lived signed `state` that carries the target user id so the
    subsequent `/callback` knows to attach the provider to this exact user
    instead of falling through to the find-or-create branch (which would spawn
    a stray Candidate account when emails differ — problematic for recruiters).
    """
    _require_provider(provider)
    user = _current_user(request, db)
    state = create_access_token(
        data={
            "oauth_mode": "link",
            "link_user_id": user.id,
            "link_provider": provider,
        },
        expires_delta=timedelta(minutes=10),
    )
    try:
        url, _ = OAuthService.build_authorization_url(provider, state=state)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return {"url": url}


# ---------------------------------------------------------------------------
# Callback — provider → backend → frontend
# ---------------------------------------------------------------------------


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str = Query(default=""),
    state: str = Query(default=""),
    error: str = Query(default=""),
    db: Session = Depends(get_db),
):
    """Handle the provider's redirect back to us."""
    _require_provider(provider)

    frontend = settings.frontend_base_url.rstrip("/")

    if error:
        params = urlencode({"error": error, "provider": provider})
        return RedirectResponse(
            f"{frontend}/login?{params}", status_code=status.HTTP_302_FOUND
        )
    if not code:
        params = urlencode({"error": "missing_code", "provider": provider})
        return RedirectResponse(
            f"{frontend}/login?{params}", status_code=status.HTTP_302_FOUND
        )

    link_payload = decode_access_token(state) if state else None
    is_link_mode = bool(
        link_payload
        and link_payload.get("oauth_mode") == "link"
        and link_payload.get("link_provider") == provider
        and link_payload.get("link_user_id")
    )

    try:
        if is_link_mode:
            user_id = int(link_payload["link_user_id"])
            target_user = db.query(User).filter(User.id == user_id).first()
            if not target_user:
                raise ValueError("Phiên liên kết không hợp lệ.")

            cfg = _provider_config(provider)
            token_data = await OAuthService._exchange_code_for_token(cfg, code)
            oauth_access_token = token_data.get("access_token")
            if not oauth_access_token:
                raise ValueError(f"{provider} returned no access_token")
            profile = await OAuthService._fetch_userinfo(cfg, oauth_access_token)
            OAuthService.link_existing_user(
                db, target_user, provider, profile, access_token=oauth_access_token
            )
            user = target_user
            app_token = create_access_token(
                data={
                    "sub": user.email,
                    "user_id": user.id,
                    "role": user.role.value,
                }
            )
            created = False
        else:
            user, app_token, created = await OAuthService.handle_callback(
                db, provider, code
            )
    except ValueError as exc:
        params = urlencode({"error": str(exc), "provider": provider})
        return RedirectResponse(
            f"{frontend}/login?{params}", status_code=status.HTTP_302_FOUND
        )

    # Fragment-encoded token keeps it out of server access logs.
    params = urlencode(
        {
            "token": app_token,
            "provider": provider,
            "new_account": "1" if created else "0",
            "role": user.role.value,
            "linked": "1" if is_link_mode else "0",
        }
    )
    return RedirectResponse(
        f"{frontend}/auth/oauth-callback#{params}",
        status_code=status.HTTP_302_FOUND,
    )


# ---------------------------------------------------------------------------
# Explicit link / unlink / list (requires existing session)
# ---------------------------------------------------------------------------


@router.get("/accounts")
async def list_linked_accounts(request: Request, db: Session = Depends(get_db)):
    """Return all social accounts linked to the current user."""
    user = _current_user(request, db)
    return [SocialAccountResponse.from_orm(a) for a in user.social_accounts]


@router.post("/{provider}/link-callback")
async def link_callback(
    provider: str,
    request: Request,
    code: str = Query(...),
    db: Session = Depends(get_db),
):
    """Link a provider to the *currently signed-in* user using an auth code.

    Alternative to full OAuth redirect loop when the frontend already has the
    code (e.g. popup window flow).
    """
    _require_provider(provider)
    user = _current_user(request, db)

    from app.services.oauth import _provider_config  # lazy import

    cfg = _provider_config(provider)
    try:
        token_data = await OAuthService._exchange_code_for_token(cfg, code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise ValueError(f"{provider} returned no access_token")
        profile = await OAuthService._fetch_userinfo(cfg, access_token)
        link = OAuthService.link_existing_user(
            db, user, provider, profile, access_token=access_token
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    return SocialAccountResponse.from_orm(link)


@router.delete("/{provider}")
async def unlink_provider(
    provider: str, request: Request, db: Session = Depends(get_db)
):
    """Unlink a social provider from the signed-in user."""
    _require_provider(provider)
    user = _current_user(request, db)
    try:
        removed = OAuthService.unlink(db, user, provider)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {provider} link on this account.",
        )
    return {"status": "unlinked", "provider": provider}


@router.get("/me", response_model=UserResponse)
async def oauth_me(request: Request, db: Session = Depends(get_db)):
    """Convenience alias to verify token issued via OAuth callback is valid."""
    user = _current_user(request, db)
    return UserResponse.model_validate(user)
