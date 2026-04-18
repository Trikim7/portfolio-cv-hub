"""OAuth2 social-login service (Phase 2 — Member 1).

Supports Google, GitHub and Facebook via the standard Authorization-Code flow
(no external OAuth SDK dependency; uses `httpx` for token + userinfo calls).

Responsibilities:
    * Build provider-specific authorization URLs (with CSRF-safe `state`).
    * Exchange `code` for a user's provider profile.
    * Find-or-create a `User` + link a `SocialAccount` row.
    * Issue the app's own JWT so the frontend can drop straight into session.
"""
from __future__ import annotations

import secrets
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
from urllib.parse import urlencode

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import SocialAccount, User, UserRole, UserStatus
from app.repositories.user import UserRepository


SUPPORTED_PROVIDERS = ("google", "github", "facebook")


@dataclass
class ProviderConfig:
    name: str
    client_id: Optional[str]
    client_secret: Optional[str]
    auth_url: str
    token_url: str
    userinfo_url: str
    scope: str
    extra_auth_params: Dict[str, str]


def _provider_config(name: str) -> ProviderConfig:
    if name == "google":
        return ProviderConfig(
            name="google",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            auth_url="https://accounts.google.com/o/oauth2/v2/auth",
            token_url="https://oauth2.googleapis.com/token",
            userinfo_url="https://openidconnect.googleapis.com/v1/userinfo",
            scope="openid email profile",
            extra_auth_params={
                "access_type": "offline",
                "prompt": "consent",
                "response_type": "code",
            },
        )
    if name == "github":
        return ProviderConfig(
            name="github",
            client_id=settings.github_client_id,
            client_secret=settings.github_client_secret,
            auth_url="https://github.com/login/oauth/authorize",
            token_url="https://github.com/login/oauth/access_token",
            userinfo_url="https://api.github.com/user",
            scope="read:user user:email",
            extra_auth_params={},
        )
    if name == "facebook":
        # Meta expects comma-separated scopes (not space-separated like Google/GitHub).
        # See: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
        return ProviderConfig(
            name="facebook",
            client_id=settings.facebook_client_id,
            client_secret=settings.facebook_client_secret,
            auth_url="https://www.facebook.com/v19.0/dialog/oauth",
            token_url="https://graph.facebook.com/v19.0/oauth/access_token",
            userinfo_url="https://graph.facebook.com/me?fields=id,name,email",
            scope="email,public_profile",
            extra_auth_params={},
        )
    raise ValueError(f"Unsupported provider: {name}")


def _redirect_uri(provider: str) -> str:
    base = settings.oauth_redirect_base_url.rstrip("/")
    return f"{base}/api/auth/oauth/{provider}/callback"


class OAuthService:
    """Provider-agnostic OAuth helper."""

    # ------------------------------------------------------------------
    # Step 1 — authorization URL
    # ------------------------------------------------------------------

    @staticmethod
    def build_authorization_url(
        provider: str, state: Optional[str] = None
    ) -> Tuple[str, str]:
        """Return (authorization_url, state). Raises if provider not configured."""
        if provider not in SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}")

        cfg = _provider_config(provider)
        if not cfg.client_id or not cfg.client_secret:
            raise ValueError(
                f"{provider} OAuth is not configured on the server. "
                "Set the provider's CLIENT_ID/CLIENT_SECRET env vars."
            )

        state = state or secrets.token_urlsafe(24)
        params = {
            "client_id": cfg.client_id,
            "redirect_uri": _redirect_uri(provider),
            "scope": cfg.scope,
            "state": state,
            **cfg.extra_auth_params,
        }
        # Google requires response_type=code already in extra_auth_params;
        # others default to it but we pass explicitly for GitHub/Facebook too.
        params.setdefault("response_type", "code")
        return f"{cfg.auth_url}?{urlencode(params)}", state

    # ------------------------------------------------------------------
    # Step 2 — exchange code → token → profile
    # ------------------------------------------------------------------

    @staticmethod
    async def _exchange_code_for_token(
        cfg: ProviderConfig, code: str
    ) -> Dict[str, str]:
        data = {
            "client_id": cfg.client_id,
            "client_secret": cfg.client_secret,
            "code": code,
            "redirect_uri": _redirect_uri(cfg.name),
            "grant_type": "authorization_code",
        }
        headers = {"Accept": "application/json"}
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(cfg.token_url, data=data, headers=headers)
        if resp.status_code >= 400:
            raise ValueError(
                f"{cfg.name} token exchange failed: {resp.status_code} {resp.text}"
            )
        payload = resp.json()
        if "error" in payload:
            raise ValueError(
                f"{cfg.name} token exchange error: {payload.get('error_description') or payload['error']}"
            )
        return payload

    @staticmethod
    async def _fetch_userinfo(
        cfg: ProviderConfig, access_token: str
    ) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(cfg.userinfo_url, headers=headers)
            if resp.status_code >= 400:
                raise ValueError(
                    f"{cfg.name} userinfo failed: {resp.status_code} {resp.text}"
                )
            data = resp.json()

            # GitHub omits email when user has it private. Fetch /user/emails as fallback.
            if cfg.name == "github" and not data.get("email"):
                email_resp = await client.get(
                    "https://api.github.com/user/emails", headers=headers
                )
                if email_resp.status_code < 400:
                    emails = email_resp.json()
                    primary = next(
                        (
                            e.get("email")
                            for e in emails
                            if e.get("primary") and e.get("verified")
                        ),
                        None,
                    )
                    if primary:
                        data["email"] = primary

        return OAuthService._normalize_profile(cfg.name, data)

    @staticmethod
    def _normalize_profile(provider: str, data: Dict[str, str]) -> Dict[str, str]:
        """Map provider-specific userinfo → common {provider_id, email, full_name}."""
        if provider == "google":
            return {
                "provider_account_id": str(data.get("sub") or data.get("id") or ""),
                "email": data.get("email"),
                "full_name": data.get("name") or data.get("given_name"),
            }
        if provider == "github":
            return {
                "provider_account_id": str(data.get("id") or ""),
                "email": data.get("email"),
                "full_name": data.get("name") or data.get("login"),
            }
        if provider == "facebook":
            return {
                "provider_account_id": str(data.get("id") or ""),
                "email": data.get("email"),
                "full_name": data.get("name"),
            }
        return {"provider_account_id": "", "email": None, "full_name": None}

    # ------------------------------------------------------------------
    # Step 3 — find-or-create user + link social account
    # ------------------------------------------------------------------

    @staticmethod
    def find_or_create_user(
        db: Session,
        provider: str,
        profile: Dict[str, str],
        access_token: Optional[str] = None,
    ) -> Tuple[User, bool]:
        """Find existing user by provider link or email; create if new.

        Returns (user, created) where `created=True` means a brand-new account was registered.
        """
        provider_account_id = profile.get("provider_account_id")
        email = profile.get("email")
        full_name = profile.get("full_name")

        if not provider_account_id:
            raise ValueError(f"{provider} did not return a user id")

        link = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.provider == provider,
                SocialAccount.provider_account_id == provider_account_id,
            )
            .first()
        )
        if link:
            user = link.user
            if access_token and link.access_token != access_token:
                link.access_token = access_token
                db.commit()
            return user, False

        user = None
        if email:
            user = UserRepository.get_user_by_email(db, email)

        created = False
        if not user:
            if not email:
                raise ValueError(
                    f"{provider} did not return an email; cannot auto-create account."
                )
            user = UserRepository.create_user(
                db,
                email=email,
                password=None,
                role=UserRole.CANDIDATE,
                full_name=full_name,
                status=UserStatus.ACTIVE,
            )
            created = True

            # Auto-create candidate profile to mirror the /register flow.
            try:
                from app.services.candidate import CandidateService
                from app.schemas.candidate import CandidateProfileCreate

                CandidateService.create_profile(
                    db, user.id, CandidateProfileCreate()
                )
            except Exception:
                # Profile creation is best-effort; do not break auth on failure.
                pass

        link = SocialAccount(
            user_id=user.id,
            provider=provider,
            provider_account_id=provider_account_id,
            access_token=access_token,
        )
        db.add(link)
        db.commit()
        db.refresh(user)
        return user, created

    @staticmethod
    def link_existing_user(
        db: Session, user: User, provider: str, profile: Dict[str, str],
        access_token: Optional[str] = None,
    ) -> SocialAccount:
        """Attach a social account to an already-authenticated user."""
        provider_account_id = profile.get("provider_account_id")
        if not provider_account_id:
            raise ValueError(f"{provider} did not return a user id")

        existing = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.provider == provider,
                SocialAccount.provider_account_id == provider_account_id,
            )
            .first()
        )
        if existing and existing.user_id != user.id:
            raise ValueError(
                f"This {provider} account is already linked to another user."
            )
        if existing:
            if access_token:
                existing.access_token = access_token
                db.commit()
            return existing

        link = SocialAccount(
            user_id=user.id,
            provider=provider,
            provider_account_id=provider_account_id,
            access_token=access_token,
        )
        db.add(link)
        db.commit()
        db.refresh(link)
        return link

    @staticmethod
    def unlink(db: Session, user: User, provider: str) -> bool:
        """Remove a provider link. Returns True if a row was deleted."""
        link = (
            db.query(SocialAccount)
            .filter(
                SocialAccount.user_id == user.id,
                SocialAccount.provider == provider,
            )
            .first()
        )
        if not link:
            return False
        # Block unlink if the user has no password AND no other social links
        # (would orphan the account).
        if not user.password_hash:
            others = (
                db.query(SocialAccount)
                .filter(
                    SocialAccount.user_id == user.id,
                    SocialAccount.provider != provider,
                )
                .count()
            )
            if others == 0:
                raise ValueError(
                    "Không thể hủy liên kết: đây là phương thức đăng nhập duy nhất."
                    " Vui lòng đặt mật khẩu trước khi hủy liên kết."
                )
        db.delete(link)
        db.commit()
        return True

    # ------------------------------------------------------------------
    # Step 4 — full handle_callback helper (used by the router)
    # ------------------------------------------------------------------

    @staticmethod
    async def handle_callback(
        db: Session, provider: str, code: str
    ) -> Tuple[User, str, bool]:
        """Complete the OAuth flow and return (user, app_jwt, created)."""
        if provider not in SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}")

        cfg = _provider_config(provider)
        if not cfg.client_id or not cfg.client_secret:
            raise ValueError(f"{provider} OAuth is not configured on the server.")

        token_data = await OAuthService._exchange_code_for_token(cfg, code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise ValueError(f"{provider} returned no access_token")

        profile = await OAuthService._fetch_userinfo(cfg, access_token)
        user, created = OAuthService.find_or_create_user(
            db, provider, profile, access_token=access_token
        )

        if user.status != UserStatus.ACTIVE:
            raise ValueError(
                "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Admin."
            )

        app_token = create_access_token(
            data={"sub": user.email, "user_id": user.id, "role": user.role.value}
        )
        return user, app_token, created
