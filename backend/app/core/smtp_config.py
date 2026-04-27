"""SMTP settings: persisted in `system_settings` (key `smtp_config`), merged into `settings` at startup and on admin save.

Priority when applying JSON from DB: non-empty fields override current runtime values
(env-backed defaults on first load). Empty/missing password in JSON keeps the existing
password (so a partial record can still rely on env)."""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

SMTP_CONFIG_KEY = "smtp_config"


def _as_bool(v: Any) -> bool:
    if isinstance(v, bool):
        return v
    if v is None:
        return False
    s = str(v).strip().lower()
    return s in ("1", "true", "yes", "on")


def smtp_config_to_json(
    smtp_host: str,
    smtp_port: int,
    smtp_username: Optional[str],
    smtp_password: Optional[str],
    smtp_from_address: str,
    smtp_enabled: bool,
) -> str:
    payload = {
        "smtp_host": smtp_host,
        "smtp_port": int(smtp_port),
        "smtp_username": smtp_username or "",
        "smtp_password": smtp_password or "",
        "smtp_from_address": smtp_from_address or "",
        "smtp_enabled": bool(smtp_enabled),
    }
    return json.dumps(payload, ensure_ascii=False)


def apply_smtp_json_to_settings(data: dict) -> None:
    """Merge dict (from DB JSON) into the process-wide `settings` singleton."""
    from app.core.config import settings

    if data.get("smtp_host"):
        settings.smtp_host = str(data["smtp_host"]).strip()
    if data.get("smtp_port") is not None:
        try:
            settings.smtp_port = int(data["smtp_port"])
        except (TypeError, ValueError):
            pass
    if "smtp_username" in data and data["smtp_username"] is not None:
        settings.smtp_username = str(data["smtp_username"]).strip() or None
    if "smtp_password" in data and data["smtp_password"]:
        settings.smtp_password = str(data["smtp_password"])
    if data.get("smtp_from_address"):
        settings.smtp_from_address = str(data["smtp_from_address"]).strip()
    if "smtp_enabled" in data:
        settings.smtp_enabled = _as_bool(data.get("smtp_enabled"))


def load_smtp_from_db(session: Session) -> bool:
    """If a row `smtp_config` exists with valid JSON, apply it. Returns whether DB had config."""
    from app.models.admin_config import SystemSetting

    row = session.query(SystemSetting).filter(SystemSetting.key == SMTP_CONFIG_KEY).first()
    if not row or not (row.value or "").strip():
        return False
    try:
        data = json.loads(row.value)
        if not isinstance(data, dict):
            logger.warning("smtp_config in DB is not a JSON object")
            return False
        apply_smtp_json_to_settings(data)
        logger.info("SMTP config applied from database (%s)", SMTP_CONFIG_KEY)
        return True
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in smtp_config: %s", e)
        return False


def upsert_smtp_in_db(
    session: Session,
    smtp_host: str,
    smtp_port: int,
    smtp_username: str,
    smtp_password: str,
    smtp_from_address: str,
    smtp_enabled: bool,
) -> None:
    from app.models.admin_config import SystemSetting

    value = smtp_config_to_json(
        smtp_host, smtp_port, smtp_username, smtp_password, smtp_from_address, smtp_enabled
    )
    row = session.query(SystemSetting).filter(SystemSetting.key == SMTP_CONFIG_KEY).first()
    if row:
        row.value = value
    else:
        session.add(
            SystemSetting(
                key=SMTP_CONFIG_KEY,
                value=value,
                description="SMTP — JSON: host, port, username, password, from, enabled",
            )
        )
