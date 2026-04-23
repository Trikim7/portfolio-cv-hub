"""CV Generator Service (Phase 2 — Auto-generate CV).

Architecture (theo phase2-execution.md §4 CV Generator Playbook):
  CVDataAssembler    — gom & chuẩn hóa dữ liệu từ DB
  CVTemplateRenderer — render HTML (dùng cho preview + HTML export)
  CVExportAdapter    — generate PDF qua reportlab (pure Python, no system deps)
  CVGeneratorService — orchestration layer
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Optional

from jinja2 import Environment, BaseLoader
from sqlalchemy.orm import Session

from app.models.candidate import CandidateProfile
from app.repositories.candidate import CandidateProfileRepository

# ---------------------------------------------------------------------------
# Template color palette
# ---------------------------------------------------------------------------

_TEMPLATE_STYLES: dict[str, dict] = {
    "traditional": {
        "primary": "#1a1a2e",
        "accent": "#16213e",
        "text": "#333333",
        "bg": "#ffffff",
        "font": "Georgia, 'Times New Roman', serif",
        "header_bg": "#1a1a2e",
        "header_text": "#ffffff",
        "section_border": "#1a1a2e",
        # reportlab colors (RGB 0-1)
        "rl_primary": (0.10, 0.10, 0.18),
        "rl_header_bg": (0.10, 0.10, 0.18),
        "rl_header_text": (1.0, 1.0, 1.0),
        "rl_text": (0.20, 0.20, 0.20),
        "rl_accent": (0.40, 0.40, 0.55),
    },
    "modern": {
        "primary": "#2563eb",
        "accent": "#1d4ed8",
        "text": "#1f2937",
        "bg": "#f8fafc",
        "font": "Arial, Helvetica, sans-serif",
        "header_bg": "#2563eb",
        "header_text": "#ffffff",
        "section_border": "#2563eb",
        "rl_primary": (0.145, 0.388, 0.922),
        "rl_header_bg": (0.145, 0.388, 0.922),
        "rl_header_text": (1.0, 1.0, 1.0),
        "rl_text": (0.122, 0.161, 0.216),
        "rl_accent": (0.40, 0.55, 0.85),
    },
    "creative": {
        "primary": "#7c3aed",
        "accent": "#6d28d9",
        "text": "#1f2937",
        "bg": "#faf5ff",
        "font": "Trebuchet MS, Arial, sans-serif",
        "header_bg": "#7c3aed",
        "header_text": "#ffffff",
        "section_border": "#7c3aed",
        "rl_primary": (0.486, 0.227, 0.929),
        "rl_header_bg": (0.486, 0.227, 0.929),
        "rl_header_text": (1.0, 1.0, 1.0),
        "rl_text": (0.122, 0.161, 0.216),
        "rl_accent": (0.65, 0.45, 0.90),
    },
    "minimal": {
        "primary": "#374151",
        "accent": "#111827",
        "text": "#374151",
        "bg": "#ffffff",
        "font": "Helvetica Neue, Helvetica, Arial, sans-serif",
        "header_bg": "#ffffff",
        "header_text": "#111827",
        "section_border": "#d1d5db",
        "rl_primary": (0.216, 0.255, 0.318),
        "rl_header_bg": (0.95, 0.95, 0.95),
        "rl_header_text": (0.067, 0.094, 0.153),
        "rl_text": (0.216, 0.255, 0.318),
        "rl_accent": (0.40, 0.45, 0.50),
    },
}

# ---------------------------------------------------------------------------
# HTML template (Jinja2 inline) — used for preview & HTML export
# ---------------------------------------------------------------------------

_HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="{{ locale }}">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: {{ style.font }};
    background: {{ style.bg }};
    color: {{ style.text }};
    font-size: 11pt;
    line-height: 1.5;
  }
  .cv-header {
    background: {{ style.header_bg }};
    color: {{ style.header_text }};
    padding: 28px 36px 22px;
  }
  .cv-header h1 { font-size: 22pt; font-weight: bold; margin-bottom: 4px; }
  .cv-header .headline { font-size: 12pt; opacity: 0.85; margin-bottom: 10px; }
  .cv-header .contacts { font-size: 9.5pt; }
  .cv-header .contacts span { margin-right: 18px; }
  .cv-body { padding: 28px 36px; }
  .section { margin-bottom: 22px; }
  .section-title {
    font-size: 12pt;
    font-weight: bold;
    color: {{ style.primary }};
    border-bottom: 2px solid {{ style.section_border }};
    padding-bottom: 4px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .bio { font-size: 10.5pt; color: {{ style.text }}; margin-bottom: 8px; }
  .exp-item { margin-bottom: 14px; }
  .exp-title { font-weight: bold; font-size: 11pt; }
  .exp-company { color: {{ style.primary }}; font-size: 10.5pt; }
  .exp-period { font-size: 9pt; color: #888; margin-bottom: 4px; }
  .exp-desc { font-size: 10pt; color: {{ style.text }}; }
  .proj-item { margin-bottom: 14px; }
  .proj-name { font-weight: bold; font-size: 11pt; }
  .proj-tech { font-size: 9pt; color: {{ style.primary }}; margin: 2px 0 4px; }
  .proj-desc { font-size: 10pt; color: {{ style.text }}; }
  .proj-url { font-size: 9pt; color: #555; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag {
    background: {{ style.primary }}18;
    color: {{ style.primary }};
    border: 1px solid {{ style.primary }}55;
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 9.5pt;
    font-weight: 500;
  }
  .skill-tag .level { font-size: 8pt; color: #666; margin-left: 4px; }
  {% if template == "minimal" %}
  .cv-header { border-bottom: 3px solid {{ style.primary }}; }
  {% endif %}
</style>
</head>
<body>
<div class="cv-header">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:20px;">
    <div style="flex:1;">
      <h1>{{ cv.personal_info.full_name or "—" }}</h1>
      {% if cv.personal_info.headline %}<div class="headline">{{ cv.personal_info.headline }}</div>{% endif %}
      <div class="contacts">
        {% if cv.personal_info.email %}<span>✉ {{ cv.personal_info.email }}</span>{% endif %}
        {% if cv.personal_info.phone %}<span>📞 {{ cv.personal_info.phone }}</span>{% endif %}
        {% if cv.personal_info.location %}<span>📍 {{ cv.personal_info.location }}</span>{% endif %}
      </div>
    </div>
    {% if cv.personal_info.avatar_url %}
    <div style="flex-shrink:0;">
      <img src="{{ cv.personal_info.avatar_url }}"
           style="width:90px; height:90px; border-radius:50%; object-fit:cover;
                  border:3px solid rgba(255,255,255,0.5); display:block;"
           alt="avatar" />
    </div>
    {% endif %}
  </div>
</div>
<div class="cv-body">
  {% if cv.personal_info.summary %}
  <div class="section">
    <div class="section-title">{% if locale == 'vi' %}Giới thiệu{% else %}Summary{% endif %}</div>
    <div class="bio">{{ cv.personal_info.summary }}</div>
  </div>
  {% endif %}
  {% if cv.skills %}
  <div class="section">
    <div class="section-title">{% if locale == 'vi' %}Kỹ năng{% else %}Skills{% endif %}</div>
    <div class="skills-grid">
      {% for skill in cv.skills %}
      <span class="skill-tag">{{ skill.name }}{% if skill.level %}<span class="level">({{ skill.level }})</span>{% endif %}</span>
      {% endfor %}
    </div>
  </div>
  {% endif %}
  {% if cv.experiences %}
  <div class="section">
    <div class="section-title">{% if locale == 'vi' %}Kinh nghiệm{% else %}Experience{% endif %}</div>
    {% for exp in cv.experiences %}
    <div class="exp-item">
      <div class="exp-title">{{ exp.job_title }}</div>
      <div class="exp-company">{{ exp.company_name }}</div>
      <div class="exp-period">{{ exp.period }}</div>
      {% if exp.description %}<div class="exp-desc">{{ exp.description }}</div>{% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}
  {% if cv.projects %}
  <div class="section">
    <div class="section-title">{% if locale == 'vi' %}Dự án{% else %}Projects{% endif %}</div>
    {% for proj in cv.projects %}
    <div class="proj-item">
      <div class="proj-name">{{ proj.name }}</div>
      {% if proj.technologies %}<div class="proj-tech">{{ proj.technologies }}</div>{% endif %}
      {% if proj.description %}<div class="proj-desc">{{ proj.description }}</div>{% endif %}
      {% if proj.url %}<div class="proj-url">🔗 {{ proj.url }}</div>{% endif %}
    </div>
    {% endfor %}
  </div>
  {% endif %}
</div>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Layer 1: CVDataAssembler
# ---------------------------------------------------------------------------

class CVDataAssembler:
    """Gom và chuẩn hóa dữ liệu portfolio từ DB thành dict CV chuẩn."""

    @staticmethod
    def _resolve_i18n(value, locale: str) -> str:
        if value is None:
            return ""
        if isinstance(value, dict):
            return value.get(locale) or value.get("vi") or value.get("en") or ""
        return str(value)

    @staticmethod
    def _format_period(
        start: Optional[datetime], end: Optional[datetime], is_current: bool, locale: str
    ) -> str:
        fmt = "%m/%Y"
        start_str = start.strftime(fmt) if start else "?"
        if is_current:
            return f"{start_str} – {'Hiện tại' if locale == 'vi' else 'Present'}"
        return f"{start_str} – {end.strftime(fmt) if end else '?'}"

    @classmethod
    def assemble(cls, profile: CandidateProfile, locale: str = "vi") -> dict:
        bio_text = cls._resolve_i18n(profile.bio, locale)
        personal = {
            "full_name": profile.full_name or "",
            "headline": profile.headline or "",
            "email": profile.user.email if profile.user else "",
            "phone": "",
            "location": "",
            "summary": bio_text,
            "avatar_url": profile.avatar_url or "",
        }
        skills = [
            {
                "name": s.name,
                "level": s.level.value if s.level else None,
                "category": s.category,
            }
            for s in (profile.skills or [])
        ]
        experiences = [
            {
                "job_title": e.job_title,
                "company_name": e.company_name,
                "period": cls._format_period(e.start_date, e.end_date, e.is_current, locale),
                "description": cls._resolve_i18n(e.description, locale),
            }
            for e in sorted(
                profile.experiences or [],
                key=lambda x: x.start_date or datetime.min,
                reverse=True,
            )
        ]
        projects = [
            {
                "name": p.project_name,
                "technologies": p.technologies or "",
                "description": cls._resolve_i18n(p.description, locale),
                "url": p.project_url or p.github_url or "",
            }
            for p in (profile.projects or [])
        ]
        return {
            "personal_info": personal,
            "skills": skills,
            "experiences": experiences,
            "projects": projects,
        }


# ---------------------------------------------------------------------------
# Layer 2: CVTemplateRenderer
# ---------------------------------------------------------------------------

class CVTemplateRenderer:
    """Render HTML string từ cv_data + template id (Jinja2)."""

    _env = Environment(loader=BaseLoader())
    _tmpl = _env.from_string(_HTML_TEMPLATE)

    @classmethod
    def render(cls, cv_data: dict, template: str = "modern", locale: str = "vi") -> str:
        if template not in _TEMPLATE_STYLES:
            template = "modern"

        # Build a simple namespace object for the template
        raw = _TEMPLATE_STYLES[template]

        class _Style:
            pass

        style = _Style()
        for k, v in raw.items():
            setattr(style, k, v)

        return cls._tmpl.render(cv=cv_data, style=style, template=template, locale=locale)


# ---------------------------------------------------------------------------
# Layer 3: CVExportAdapter  (pure Python — reportlab for PDF)
# ---------------------------------------------------------------------------

class CVExportAdapter:
    """Convert assembled cv_data → bytes using reportlab (PDF) or Jinja2 (HTML).

    Uses reportlab directly so there are NO system-level dependencies
    (no cairo, no pango, no GTK — works in any Python Docker container).
    """

    @staticmethod
    def to_pdf(cv_data: dict, template: str = "modern", locale: str = "vi") -> bytes:
        """Generate PDF from cv_data using reportlab Platypus + DejaVu (Unicode/Vietnamese)."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import cm
            from reportlab.lib import colors
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle,
            )
            from reportlab.pdfbase import pdfmetrics
            from reportlab.pdfbase.ttfonts import TTFont
        except ImportError as exc:
            raise RuntimeError("reportlab not installed. Run: pip install reportlab") from exc

        # ── Register DejaVu fonts (installed via fonts-dejavu-core in Dockerfile)
        # DejaVu Sans supports full Unicode including Vietnamese diacritics.
        _DEJAVU_PATHS = [
            # Debian/Ubuntu (fonts-dejavu-core)
            ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
            # Fallback paths
            ("/usr/share/fonts/dejavu/DejaVuSans.ttf",
             "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"),
        ]
        _font_registered = False
        for regular_path, bold_path in _DEJAVU_PATHS:
            import os
            if os.path.exists(regular_path) and os.path.exists(bold_path):
                try:
                    pdfmetrics.registerFont(TTFont("DejaVuSans", regular_path))
                    pdfmetrics.registerFont(TTFont("DejaVuSans-Bold", bold_path))
                    _font_registered = True
                except Exception:
                    pass
                break

        # Font names to use — fall back to Helvetica only if DejaVu unavailable
        FONT_NORMAL = "DejaVuSans" if _font_registered else "Helvetica"
        FONT_BOLD   = "DejaVuSans-Bold" if _font_registered else "Helvetica-Bold"

        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            topMargin=0,
            bottomMargin=1.5 * cm,
            leftMargin=2 * cm,
            rightMargin=2 * cm,
        )

        palette = _TEMPLATE_STYLES.get(template, _TEMPLATE_STYLES["modern"])
        p_color  = colors.Color(*palette["rl_primary"])
        h_bg     = colors.Color(*palette["rl_header_bg"])
        h_fg     = colors.Color(*palette["rl_header_text"])
        txt_color = colors.Color(*palette["rl_text"])
        acc_color = colors.Color(*palette["rl_accent"])

        base = getSampleStyleSheet()

        def _style(name, **kwargs) -> ParagraphStyle:
            s = ParagraphStyle(name, parent=base["Normal"])
            for k, v in kwargs.items():
                setattr(s, k, v)
            return s

        # ── Style definitions (all using DejaVu → full Vietnamese support)
        s_name     = _style("CvName",     fontSize=22, fontName=FONT_BOLD,   textColor=h_fg,       leading=28)
        s_headline = _style("CvHeadline", fontSize=12, fontName=FONT_NORMAL, textColor=h_fg,       leading=16)
        s_contact  = _style("CvContact",  fontSize=9,  fontName=FONT_NORMAL, textColor=h_fg,       leading=12)
        s_sec_title= _style("CvSecTitle", fontSize=10, fontName=FONT_BOLD,   textColor=p_color,    spaceAfter=2)
        s_body     = _style("CvBody",     fontSize=10, fontName=FONT_NORMAL, textColor=txt_color,  leading=14)
        s_bold     = _style("CvBold",     fontSize=10, fontName=FONT_BOLD,   textColor=txt_color)
        s_sub      = _style("CvSub",      fontSize=9.5,fontName=FONT_NORMAL, textColor=acc_color)
        s_small    = _style("CvSmall",    fontSize=8.5,fontName=FONT_NORMAL, textColor=colors.grey)

        pi = cv_data["personal_info"]
        story = []

        # ── HEADER block: 2-col table [text | avatar]
        text_content = [
            Paragraph(pi.get("full_name") or "—", s_name),
        ]
        if pi.get("headline"):
            text_content.append(Paragraph(pi["headline"], s_headline))

        # Build contact line (no emoji for reportlab compatibility)
        contact_parts = []
        if pi.get("email"):
            contact_parts.append(f"Email: {pi['email']}")
        if pi.get("phone"):
            contact_parts.append(f"Tel: {pi['phone']}")
        if pi.get("location"):
            contact_parts.append(f"Dia chi: {pi['location']}")
        if contact_parts:
            text_content.append(Spacer(1, 4))
            text_content.append(Paragraph("   |   ".join(contact_parts), s_contact))

        # ── Fetch avatar image (from URL or local path, fallback gracefully)
        avatar_img = None
        avatar_url = pi.get("avatar_url", "")
        if avatar_url:
            import os
            try:
                import urllib.request as _urlreq
                from PIL import Image as PILImage

                if avatar_url.startswith("http://") or avatar_url.startswith("https://"):
                    with _urlreq.urlopen(avatar_url, timeout=5) as resp:
                        img_bytes = io.BytesIO(resp.read())
                else:
                    if os.path.exists(avatar_url):
                        with open(avatar_url, "rb") as f:
                            img_bytes = io.BytesIO(f.read())
                    else:
                        img_bytes = None

                if img_bytes:
                    # ── Crop to square
                    pil_img = PILImage.open(img_bytes)
                    pil_img = pil_img.convert("RGBA")
                    w, h = pil_img.size
                    side = min(w, h)
                    left = (w - side) // 2
                    top  = (h - side) // 2
                    pil_img = pil_img.crop((left, top, left + side, top + side))
                    pil_img = pil_img.resize((160, 160), PILImage.LANCZOS)

                    # ── Create circular mask (white ellipse on black background)
                    from PIL import ImageDraw
                    mask = PILImage.new("L", (160, 160), 0)
                    draw_mask = ImageDraw.Draw(mask)
                    draw_mask.ellipse((0, 0, 160, 160), fill=255)

                    # ── Composite: paste avatar onto header-colored background
                    # so the "transparent" area around the circle blends with header
                    bg_palette = palette["rl_header_bg"]
                    bg_rgb = (
                        int(bg_palette[0] * 255),
                        int(bg_palette[1] * 255),
                        int(bg_palette[2] * 255),
                        255,
                    )
                    bg_layer = PILImage.new("RGBA", (160, 160), bg_rgb)
                    bg_layer.paste(pil_img, mask=mask)

                    # Convert to RGB for JPEG (no transparency needed — bg already filled)
                    final_img = bg_layer.convert("RGB")
                    out_buf = io.BytesIO()
                    final_img.save(out_buf, format="JPEG", quality=90)
                    out_buf.seek(0)

                    from reportlab.platypus import Image as RLImage
                    avatar_img = RLImage(out_buf, width=2.2 * cm, height=2.2 * cm)
            except Exception:
                avatar_img = None  # Graceful fallback — never crash on avatar


        # Assemble header table
        inner_w = A4[0] - 4 * cm
        if avatar_img:
            avatar_col_w = 2.8 * cm
            text_col_w   = inner_w - avatar_col_w
            header_table = Table(
                [[text_content, avatar_img]],
                colWidths=[text_col_w, avatar_col_w],
            )
            header_table.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), h_bg),
                ("TOPPADDING",    (0, 0), (-1, -1), 20),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
                ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
                ("VALIGN",        (0, 0), (0, 0), "TOP"),
                ("VALIGN",        (1, 0), (1, 0), "MIDDLE"),
                ("ALIGN",         (1, 0), (1, 0), "RIGHT"),
            ]))
        else:
            header_table = Table([[text_content]], colWidths=[inner_w])
            header_table.setStyle(TableStyle([
                ("BACKGROUND",    (0, 0), (-1, -1), h_bg),
                ("TOPPADDING",    (0, 0), (-1, -1), 20),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
                ("LEFTPADDING",   (0, 0), (-1, -1), 0),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
                ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ]))
        story.append(header_table)
        story.append(Spacer(1, 14))

        def section_title(label: str):
            story.append(Paragraph(label.upper(), s_sec_title))
            story.append(HRFlowable(width="100%", thickness=1.5, color=p_color, spaceAfter=6))

        # ── SUMMARY
        summary = pi.get("summary", "")
        if summary:
            section_title("Giới thiệu" if locale == "vi" else "Summary")
            story.append(Paragraph(summary, s_body))
            story.append(Spacer(1, 12))

        # ── SKILLS
        skills = cv_data.get("skills", [])
        if skills:
            section_title("Kỹ năng" if locale == "vi" else "Skills")
            skill_text = "   -   ".join(
                f"{s['name']}" + (f" ({s['level']})" if s.get("level") else "")
                for s in skills
            )
            story.append(Paragraph(skill_text, s_body))
            story.append(Spacer(1, 12))

        # ── EXPERIENCE
        experiences = cv_data.get("experiences", [])
        if experiences:
            section_title("Kinh nghiệm" if locale == "vi" else "Experience")
            for exp in experiences:
                story.append(Paragraph(exp["job_title"], s_bold))
                story.append(Paragraph(exp["company_name"], s_sub))
                story.append(Paragraph(exp["period"], s_small))
                if exp.get("description"):
                    story.append(Spacer(1, 3))
                    story.append(Paragraph(exp["description"], s_body))
                story.append(Spacer(1, 8))

        # ── PROJECTS
        projects = cv_data.get("projects", [])
        if projects:
            section_title("Dự án" if locale == "vi" else "Projects")
            for proj in projects:
                story.append(Paragraph(proj["name"], s_bold))
                if proj.get("technologies"):
                    story.append(Paragraph(proj["technologies"], s_sub))
                if proj.get("description"):
                    story.append(Spacer(1, 3))
                    story.append(Paragraph(proj["description"], s_body))
                if proj.get("url"):
                    story.append(Paragraph(proj["url"], s_small))
                story.append(Spacer(1, 8))

        doc.build(story)
        return buf.getvalue()


    @staticmethod
    def to_html(html: str) -> bytes:
        """Return HTML as UTF-8 bytes."""
        return html.encode("utf-8")


# ---------------------------------------------------------------------------
# Layer 4: CVGeneratorService  (Orchestration)
# ---------------------------------------------------------------------------

SUPPORTED_TEMPLATES = list(_TEMPLATE_STYLES.keys())
SUPPORTED_FORMATS = ["pdf", "html"]
SUPPORTED_LOCALES = ["vi", "en"]


class CVGeneratorService:
    """Orchestration: Assembler → Renderer → Adapter."""

    @staticmethod
    def generate(
        db: Session,
        user_id: int,
        template: str = "modern",
        locale: str = "vi",
        fmt: str = "pdf",
    ) -> bytes:
        """Sinh CV bytes từ portfolio data của user."""
        if template not in SUPPORTED_TEMPLATES:
            template = "modern"
        if locale not in SUPPORTED_LOCALES:
            locale = "vi"
        if fmt not in SUPPORTED_FORMATS:
            fmt = "pdf"

        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv_data = CVDataAssembler.assemble(profile, locale)

        if fmt == "pdf":
            return CVExportAdapter.to_pdf(cv_data, template=template, locale=locale)

        # HTML export: render then encode
        html = CVTemplateRenderer.render(cv_data, template=template, locale=locale)
        return CVExportAdapter.to_html(html)

    @staticmethod
    def preview_html(
        db: Session,
        user_id: int,
        template: str = "modern",
        locale: str = "vi",
    ) -> str:
        """Trả về HTML string để FE preview (không sinh PDF)."""
        if template not in SUPPORTED_TEMPLATES:
            template = "modern"
        if locale not in SUPPORTED_LOCALES:
            locale = "vi"

        profile = CandidateProfileRepository.get_profile_by_user_id(db, user_id)
        if not profile:
            raise ValueError(f"Profile not found for user {user_id}")

        cv_data = CVDataAssembler.assemble(profile, locale)
        return CVTemplateRenderer.render(cv_data, template=template, locale=locale)
