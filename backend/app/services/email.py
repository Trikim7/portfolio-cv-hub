"""Email notification service (Resend API preferred, SMTP fallback)."""
import asyncio
import logging
import html
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import httpx

logger = logging.getLogger(__name__)


class EmailService:
    """Send transactional emails via SMTP.

    Config is read from `app.core.config.settings` at call-time so that
    Admin can update the settings at runtime (stored in the singleton).
    """

    @staticmethod
    def _get_settings():
        from app.core.config import settings
        return settings

    # ─── Low-level sender ─────────────────────────────────────────
    @classmethod
    def _is_resend_enabled(cls) -> bool:
        cfg = cls._get_settings()
        if cfg.resend_enabled:
            return True
        return bool(cfg.resend_api_key)

    @classmethod
    def _resolve_resend_from_address(cls) -> str:
        cfg = cls._get_settings()
        if cfg.resend_from_address:
            return cfg.resend_from_address.strip()
        return cls._resolve_from_address()

    @classmethod
    async def _send_via_resend(
        cls,
        to_email: str,
        subject: str,
        html_body: str,
        plain_body: Optional[str] = None,
    ) -> bool:
        cfg = cls._get_settings()
        if not cls._is_resend_enabled():
            return False
        if not cfg.resend_api_key:
            logger.warning("[Email] Resend enabled but missing API key.")
            return False

        payload = {
            "from": cls._resolve_resend_from_address(),
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        if plain_body:
            payload["text"] = plain_body

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {cfg.resend_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
            if 200 <= resp.status_code < 300:
                logger.info("[Email] Sent '%s' → %s via Resend API", subject, to_email)
                return True
            logger.error(
                "[Email] Resend API failed (%s): %s",
                resp.status_code,
                resp.text,
            )
            return False
        except Exception as exc:
            logger.error("[Email] Resend API exception: %s", exc)
            return False

    @classmethod
    def _is_enabled(cls) -> bool:
        """Resolve whether SMTP fallback should run.

        SMTP fallback requires explicit enable and valid credentials.
        """
        cfg = cls._get_settings()
        return bool(cfg.smtp_enabled and cfg.smtp_username and cfg.smtp_password)

    @classmethod
    def _resolve_from_address(cls) -> str:
        """Pick a sender address accepted by common SMTP providers."""
        cfg = cls._get_settings()
        configured = (cfg.smtp_from_address or "").strip()
        # Use authenticated address when default placeholder is still present.
        if configured and configured != "noreply@portfoliocvhub.com":
            return configured
        if cfg.smtp_username:
            return cfg.smtp_username
        return configured or "noreply@localhost"

    @classmethod
    def _smtp_ports_to_try(cls, preferred_port: int) -> list[int]:
        """Try preferred SMTP port first, then common fallback."""
        if preferred_port == 587:
            return [587, 465]
        if preferred_port == 465:
            return [465, 587]
        return [preferred_port, 587, 465]

    @classmethod
    async def _send(
        cls,
        to_email: str,
        subject: str,
        html_body: str,
        plain_body: Optional[str] = None,
    ) -> bool:
        """Internal: Build MIME message and send via aiosmtplib."""
        cfg = cls._get_settings()

        # Prefer Resend API on cloud deployments; fallback to SMTP.
        if await cls._send_via_resend(to_email, subject, html_body, plain_body):
            return True

        if not cls._is_enabled():
            logger.info("[Email] SMTP disabled — skipping email to %s", to_email)
            return False
        if not cfg.smtp_username or not cfg.smtp_password:
            logger.warning("[Email] SMTP credentials not configured — skipping.")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        from_address = cls._resolve_from_address()
        msg["From"] = f"Portfolio CV Hub <{from_address}>"
        msg["To"] = to_email

        if plain_body:
            msg.attach(MIMEText(plain_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        import aiosmtplib
        last_exc = None
        for port in cls._smtp_ports_to_try(cfg.smtp_port):
            try:
                # Port 465 = SSL/TLS from start; port 587 = STARTTLS upgrade
                use_tls = port == 465
                start_tls = not use_tls  # True for 587, False for 465
                await aiosmtplib.send(
                    msg,
                    hostname=cfg.smtp_host,
                    port=port,
                    username=cfg.smtp_username,
                    password=cfg.smtp_password,
                    use_tls=use_tls,
                    start_tls=start_tls,
                    sender=from_address,
                    timeout=20,
                )
                logger.info("[Email] Sent '%s' → %s via %s:%s", subject, to_email, cfg.smtp_host, port)
                return True
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "[Email] SMTP send attempt failed via %s:%s (%s)",
                    cfg.smtp_host,
                    port,
                    exc,
                )

        logger.error("[Email] Failed to send to %s after all ports: %s", to_email, last_exc)
        return False

    @classmethod
    def send_background(cls, to_email: str, subject: str, html_body: str, plain_body: Optional[str] = None):
        """Fire-and-forget: schedule the send coroutine without blocking the request."""
        async def _task():
            await cls._send(to_email, subject, html_body, plain_body)

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_task())
        except RuntimeError:
            # No running loop in current context (e.g. sync path in worker thread).
            asyncio.run(_task())
        except Exception as exc:
            logger.error("[Email] Background task error: %s", exc)

    # ─── Template helpers ──────────────────────────────────────────
    @staticmethod
    def _base_html(title: str, body_html: str) -> str:
        return f"""
        <!DOCTYPE html>
        <html lang="vi">
        <head><meta charset="utf-8"><title>{title}</title></head>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:32px 16px;">
              <table width="600" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#3b5bdb,#6741d9);padding:24px 32px;">
                    <h1 style="margin:0;color:#fff;font-size:20px;">Portfolio CV Hub</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    {body_html}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;background:#f8f9fa;text-align:center;">
                    <p style="margin:0;color:#868e96;font-size:12px;">
                      © 2026 Portfolio CV Hub • Email này được gửi tự động, vui lòng không trả lời.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """

    # ─── Pre-built email templates ─────────────────────────────────

    @classmethod
    def notify_invitation_sent(
        cls,
        candidate_email: str,
        candidate_name: str,
        company_name: str,
        job_title: str,
        message: Optional[str],
    ):
        """Email to candidate when recruiter sends a job invitation."""
        safe_candidate_name = html.escape(candidate_name or "Ứng viên")
        safe_company_name = html.escape(company_name or "")
        safe_job_title = html.escape(job_title or "")
        safe_message = html.escape(message) if message else None
        msg_block = (
            "<blockquote style='border-left:4px solid #3b5bdb;margin:16px 0;padding:12px 16px;background:#eef2ff;color:#364fc7;border-radius:0 8px 8px 0;'>"
            f"{safe_message}</blockquote>"
            if safe_message
            else ""
        )
        body = f"""
        <h2 style="color:#1a1a2e;margin-top:0;">Bạn vừa nhận được lời mời tuyển dụng! 🎉</h2>
        <p style="color:#495057;">Xin chào <strong>{safe_candidate_name}</strong>,</p>
        <p style="color:#495057;">Công ty <strong>{safe_company_name}</strong> đã gửi lời mời làm việc cho vị trí:</p>
        <div style="background:#f1f3f5;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#3b5bdb;">{safe_job_title}</p>
        </div>
        {msg_block}
        <p style="color:#495057;">Hãy đăng nhập vào <strong>Portfolio CV Hub</strong> để xem và phản hồi lời mời này.</p>
        <p style="color:#868e96;font-size:13px;margin-top:24px;">
          Email này được gửi tự động, vui lòng không trả lời trực tiếp.
        </p>
        """
        html = cls._base_html("Lời mời tuyển dụng mới", body)
        plain = f"Xin chào {candidate_name},\n\n{company_name} mời bạn ứng tuyển vị trí: {job_title}\n\nTin nhắn: {message or 'Không có'}\n\nVui lòng đăng nhập vào Portfolio CV Hub để xem chi tiết."
        cls.send_background(candidate_email, f"[Portfolio CV Hub] Lời mời từ {company_name}", html, plain)

    @classmethod
    def notify_company_approved(
        cls,
        company_email: str,
        company_name: str,
    ):
        """Email to recruiter when Admin approves their company."""
        body = f"""
        <h2 style="color:#1a1a2e;margin-top:0;">Tài khoản doanh nghiệp đã được duyệt ✅</h2>
        <p style="color:#495057;">Xin chào đại diện của <strong>{company_name}</strong>,</p>
        <p style="color:#495057;">
          Admin của hệ thống <strong>Portfolio CV Hub</strong> đã xem xét và
          <span style="color:#2f9e44;font-weight:bold;">phê duyệt</span> tài khoản doanh nghiệp của bạn.
        </p>
        <p style="color:#495057;">Bạn có thể đăng nhập và bắt đầu tìm kiếm ứng viên ngay bây giờ.</p>
        <p style="color:#868e96;font-size:13px;margin-top:24px;">
          Email này được gửi tự động từ hệ thống Portfolio CV Hub.
        </p>
        """
        html = cls._base_html("Tài khoản được duyệt", body)
        plain = f"Xin chào {company_name},\n\nTài khoản doanh nghiệp của bạn đã được phê duyệt. Vui lòng đăng nhập vào Portfolio CV Hub."
        cls.send_background(company_email, "[Portfolio CV Hub] Tài khoản doanh nghiệp đã được duyệt", html, plain)

    @classmethod
    def notify_company_rejected(
        cls,
        company_email: str,
        company_name: str,
    ):
        """Email to recruiter when Admin rejects their company."""
        body = f"""
        <h2 style="color:#1a1a2e;margin-top:0;">Tài khoản doanh nghiệp chưa được duyệt ❌</h2>
        <p style="color:#495057;">Xin chào đại diện của <strong>{company_name}</strong>,</p>
        <p style="color:#495057;">
          Rất tiếc, Admin đã <span style="color:#e03131;font-weight:bold;">từ chối</span> đăng ký tài khoản doanh nghiệp của bạn.
        </p>
        <p style="color:#495057;">
          Vui lòng kiểm tra lại thông tin đăng ký và liên hệ quản trị viên để được hỗ trợ thêm.
        </p>
        """
        html = cls._base_html("Tài khoản không được duyệt", body)
        plain = f"Xin chào {company_name},\n\nTài khoản doanh nghiệp của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết."
        cls.send_background(company_email, "[Portfolio CV Hub] Thông báo về đăng ký tài khoản doanh nghiệp", html, plain)

    # ─── Test / SMTP verify ────────────────────────────────────────
    @classmethod
    async def test_connection(cls) -> dict:
        """Test email provider connection (Resend preferred, SMTP fallback)."""
        cfg = cls._get_settings()
        if cls._is_resend_enabled():
            if not cfg.resend_api_key:
                return {"success": False, "message": "Resend chưa cấu hình API key"}
            try:
                async with httpx.AsyncClient(timeout=20.0) as client:
                    resp = await client.get(
                        "https://api.resend.com/domains",
                        headers={"Authorization": f"Bearer {cfg.resend_api_key}"},
                    )
                if 200 <= resp.status_code < 300:
                    return {
                        "success": True,
                        "message": "Kết nối thành công đến Resend API",
                    }
                return {
                    "success": False,
                    "message": f"Resend API lỗi {resp.status_code}: {resp.text}",
                }
            except Exception as exc:
                return {"success": False, "message": f"Resend API exception: {exc}"}

        if not cfg.smtp_username or not cfg.smtp_password:
            return {"success": False, "message": "Chưa cấu hình SMTP username/password"}
        import aiosmtplib
        last_exc = None
        for port in cls._smtp_ports_to_try(cfg.smtp_port):
            try:
                use_tls = port == 465
                if use_tls:
                    smtp = aiosmtplib.SMTP(
                        hostname=cfg.smtp_host,
                        port=port,
                        use_tls=True,
                        timeout=20,
                    )
                    await smtp.connect()
                else:
                    smtp = aiosmtplib.SMTP(
                        hostname=cfg.smtp_host,
                        port=port,
                        timeout=20,
                    )
                    await smtp.connect()
                    await smtp.starttls()
                await smtp.login(cfg.smtp_username, cfg.smtp_password)
                await smtp.quit()
                mode = "SSL" if use_tls else "STARTTLS"
                return {"success": True, "message": f"Kết nối thành công [{mode}] đến {cfg.smtp_host}:{port}"}
            except Exception as exc:
                last_exc = exc
        return {"success": False, "message": str(last_exc)}
