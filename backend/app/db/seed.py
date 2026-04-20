"""
Seed script — Phase 2 Portfolio CV Hub
=======================================
Tạo dữ liệu mẫu:
  • 2  templates
  • 5  system_settings
  • 1  admin user
  • 5  recruiter users  → 5 companies, job_requirements, invitations, comparisons
  • 95 candidate users → candidate_profiles, skills, experiences, projects, cvs, profile_views

Chạy:
    cd backend
    python -m app.db.seed
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.admin_config import Template, SystemSetting, TemplateStatus
from app.models.user import User, UserRole, UserStatus, SocialAccount
from app.models.candidate import (
    CandidateProfile,
    Skill,
    Experience,
    Project,
    CV,
    ExperienceLevel,
)
from app.models.recruiter import (
    Company,
    CompanyStatus,
    JobRequirement,
    JobInvitation,
    InvitationStatus,
)
from app.models.analytics import ProfileView, ViewerType, Comparison, ComparisonCandidate

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _hash(password: str) -> str:
    return get_password_hash(password)


def _dt(days_ago: int = 0) -> datetime:
    return datetime.utcnow() - timedelta(days=days_ago)


def _rand_date(start_year: int = 2018, end_year: int = 2024) -> datetime:
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


# ---------------------------------------------------------------------------
# Reference data pools (đa dạng, tránh lặp)
# ---------------------------------------------------------------------------

SKILL_POOLS = {
    "Backend": [
        "Python", "Java", "Go", "Node.js", "Django", "FastAPI", "Spring Boot",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "RabbitMQ", "Kafka",
        "REST API", "GraphQL", "gRPC", "Docker", "Kubernetes",
    ],
    "Frontend": [
        "React", "Vue.js", "Angular", "Next.js", "TypeScript", "JavaScript",
        "HTML5", "CSS3", "Tailwind CSS", "SCSS", "Webpack", "Vite",
        "Redux", "Zustand", "React Query", "Figma", "Responsive Design",
    ],
    "DevOps": [
        "AWS", "GCP", "Azure", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
        "GitLab CI", "Prometheus", "Grafana", "ELK Stack", "Nginx", "Linux",
        "Bash Scripting", "Helm", "ArgoCD",
    ],
    "Data": [
        "Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch",
        "SQL", "Spark", "Airflow", "dbt", "Tableau", "Power BI",
        "Machine Learning", "Deep Learning", "NLP", "Data Pipeline",
    ],
    "Mobile": [
        "Flutter", "React Native", "Swift", "Kotlin", "Android Studio",
        "Xcode", "Firebase", "SQLite", "REST API", "Push Notification",
    ],
}

EXPERIENCE_LEVELS = list(ExperienceLevel)

JOB_TITLES = [
    "Backend Developer", "Frontend Developer", "Full Stack Developer",
    "Software Engineer", "Senior Software Engineer", "DevOps Engineer",
    "Data Engineer", "Machine Learning Engineer", "Mobile Developer",
    "Tech Lead", "Solution Architect", "QA Engineer", "Product Manager",
    "Scrum Master", "UI/UX Designer",
]

COMPANIES_DATA = [
    {
        "full_name": "Nguyễn Văn Đức",
        "email": "duc.nguyen@techviet.vn",
        "company_name": "TechViet Solutions",
        "company_slug": "techviet-solutions",
        "industry": "Phần mềm & Công nghệ",
        "website": "https://techviet.vn",
        "description": "Công ty phát triển phần mềm hàng đầu Việt Nam, chuyên cung cấp giải pháp ERP và CRM cho doanh nghiệp vừa và nhỏ.",
        "logo_url": "https://logo.clearbit.com/techviet.vn",
        "location": "Hà Nội, Việt Nam",
        "email_company": "hr@techviet.vn",
        "phone": "024-3938-1234",
        "status": CompanyStatus.APPROVED,
    },
    {
        "full_name": "Trần Thị Hương",
        "email": "huong.tran@fptsoft.com.vn",
        "company_name": "FPT Software HCM",
        "company_slug": "fpt-software-hcm",
        "industry": "Outsourcing & IT Services",
        "website": "https://fsoft.com.vn",
        "description": "Chi nhánh TP.HCM của FPT Software, cung cấp dịch vụ outsourcing phần mềm cho thị trường Nhật Bản, Mỹ và châu Âu. Quy mô hơn 2000 nhân sự.",
        "logo_url": "https://logo.clearbit.com/fsoft.com.vn",
        "location": "TP. Hồ Chí Minh, Việt Nam",
        "email_company": "recruit.hcm@fsoft.com.vn",
        "phone": "028-7300-5678",
        "status": CompanyStatus.APPROVED,
    },
    {
        "full_name": "Lê Minh Khoa",
        "email": "khoa.le@vingroup-tech.vn",
        "company_name": "Vingroup Technology",
        "company_slug": "vingroup-technology",
        "industry": "Tập đoàn công nghệ",
        "website": "https://vingroup.net/technology",
        "description": "Bộ phận công nghệ của Tập đoàn Vingroup, phát triển hệ sinh thái số bao gồm VinID, VinBus, VinAI và các sản phẩm smart city.",
        "logo_url": "https://logo.clearbit.com/vingroup.net",
        "location": "Hà Nội, Việt Nam",
        "email_company": "talent@vingroup.net",
        "phone": "024-3974-9999",
        "status": CompanyStatus.APPROVED,
    },
    {
        "full_name": "Phạm Quốc Bảo",
        "email": "bao.pham@momo.vn",
        "company_name": "MoMo Fintech",
        "company_slug": "momo-fintech",
        "industry": "Fintech & Payment",
        "website": "https://momo.vn",
        "description": "Ví điện tử MoMo — nền tảng thanh toán số lớn nhất Việt Nam với hơn 30 triệu người dùng, đang mở rộng sang các dịch vụ cho vay và đầu tư.",
        "logo_url": "https://logo.clearbit.com/momo.vn",
        "location": "TP. Hồ Chí Minh, Việt Nam",
        "email_company": "careers@momo.vn",
        "phone": "028-6666-9090",
        "status": CompanyStatus.APPROVED,
    },
    {
        "full_name": "Hoàng Thị Thu",
        "email": "thu.hoang@startupai.io",
        "company_name": "StartupAI Vietnam",
        "company_slug": "startupai-vietnam",
        "industry": "AI & Machine Learning Startup",
        "website": "https://startupai.io",
        "description": "Startup công nghệ AI giai đoạn Series A, tập trung xây dựng các sản phẩm AI ứng dụng trong y tế, giáo dục và nông nghiệp tại Đông Nam Á.",
        "logo_url": "https://logo.clearbit.com/startupai.io",
        "location": "Đà Nẵng, Việt Nam",
        "email_company": "join@startupai.io",
        "phone": "0236-388-7777",
        "status": CompanyStatus.PENDING,
    },
]

# 95 candidates pool data
CANDIDATE_FIRST_NAMES = [
    "Anh", "Bảo", "Chi", "Dũng", "Em", "Phúc", "Giang", "Hùng", "Ích", "Khánh",
    "Linh", "Minh", "Nam", "Oanh", "Phương", "Quang", "Rin", "Sơn", "Tâm", "Uyên",
    "Vân", "Xuân", "Yến", "Zung", "Ánh", "Bình", "Cúc", "Điền", "Evy", "Phụng",
    "Giao", "Hiền", "Ích", "Kỳ", "Lam", "My", "Ngân", "Oanh", "Phúc", "Quỳnh",
    "Rin", "Sen", "Thảo", "Uyên", "Vinh",
]

CANDIDATE_LAST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đặng",
    "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Trịnh", "Cao", "Tô",
]

MIDDLE_NAMES = ["Văn", "Thị", "Minh", "Đức", "Quốc", "Hữu", "Trọng", "Ngọc", "Thành", "Gia"]

CITIES = [
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng",
    "Huế", "Nha Trang", "Đà Lạt", "Vũng Tàu", "Bình Dương",
]

UNIVERSITIES = [
    "Đại học Bách Khoa Hà Nội", "Đại học Công nghệ - ĐHQGHN",
    "Đại học Bách Khoa TP.HCM", "Đại học Khoa học Tự nhiên TP.HCM",
    "Đại học FPT", "Đại học Tôn Đức Thắng", "Đại học Duy Tân",
    "Đại học Kinh tế Quốc dân", "Học viện Kỹ thuật Mật mã",
    "Đại học Đà Nẵng — CNTT",
]

TECH_COMPANIES = [
    "FPT Software", "VNG Corporation", "TMA Solutions", "KMS Technology",
    "Nashtech", "Axon Active", "Bosch Global Software Technologies",
    "Harvey Nash Vietnam", "Rikkeisoft", "Tiki", "Shopee Vietnam",
    "VinAI Research", "GotIt! Vietnam", "Zalo", "FIMO",
]

GRADUATION_YEARS = list(range(2015, 2026))

HEADLINE_POOL = [
    "Backend Engineer chuyên Python & FastAPI",
    "Full-Stack Developer | React · Node.js · PostgreSQL",
    "DevOps Engineer — Cloud-Native & Kubernetes",
    "Machine Learning Engineer | PyTorch · Transformers",
    "Frontend Developer đam mê UI/UX và hiệu năng web",
    "Senior Java Developer · Spring Boot · Microservices",
    "Data Engineer | Apache Spark · dbt · Airflow",
    "Mobile Developer — Flutter & React Native",
    "Solution Architect với 6+ năm kinh nghiệm doanh nghiệp",
    "QA Automation Engineer | Selenium · Playwright · CI",
    "Tech Lead — Mentor, Agile Coach, Architect",
    "Go Developer | gRPC · Kafka · High-Performance Systems",
    "AI/NLP Researcher chuyên mô hình ngôn ngữ lớn",
    "Product Engineer — từ ý tưởng đến production",
    "Embedded Systems Developer | C/C++ · RTOS · IoT",
]

JOB_REQ_TEMPLATES = [
    {
        "title": "Senior Backend Engineer (Python)",
        "required_skills": [
            {"name": "Python", "level": "senior"},
            {"name": "FastAPI", "level": "mid"},
            {"name": "PostgreSQL", "level": "mid"},
        ],
        "years_experience": 4,
        "required_role": "Backend",
        "customer_facing": False,
        "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        "is_management_role": False,
        "weights_config": {"technical": 0.35, "experience": 0.3, "project": 0.2, "communication": 0.05, "management": 0.0, "education": 0.1},
    },
    {
        "title": "Frontend Developer (React/Next.js)",
        "required_skills": [
            {"name": "React", "level": "mid"},
            {"name": "TypeScript", "level": "junior"},
            {"name": "Next.js", "level": "junior"},
        ],
        "years_experience": 2,
        "required_role": "Frontend",
        "customer_facing": True,
        "tech_stack": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        "is_management_role": False,
        "weights_config": None,
    },
    {
        "title": "DevOps / Cloud Engineer",
        "required_skills": [
            {"name": "Kubernetes", "level": "mid"},
            {"name": "AWS", "level": "mid"},
            {"name": "Terraform", "level": "junior"},
        ],
        "years_experience": 3,
        "required_role": "DevOps",
        "customer_facing": False,
        "tech_stack": ["AWS", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus"],
        "is_management_role": False,
        "weights_config": {"technical": 0.4, "experience": 0.3, "project": 0.15, "communication": 0.05, "management": 0.0, "education": 0.1},
    },
    {
        "title": "Data Engineer / ML Ops",
        "required_skills": [
            {"name": "Python", "level": "mid"},
            {"name": "Apache Spark", "level": "junior"},
            {"name": "Airflow", "level": "junior"},
        ],
        "years_experience": 3,
        "required_role": "Data",
        "customer_facing": False,
        "tech_stack": ["Python", "Spark", "Airflow", "dbt", "GCP"],
        "is_management_role": False,
        "weights_config": None,
    },
    {
        "title": "Tech Lead — Full Stack",
        "required_skills": [
            {"name": "Node.js", "level": "senior"},
            {"name": "React", "level": "senior"},
            {"name": "System Design", "level": "lead"},
        ],
        "years_experience": 6,
        "required_role": "Full Stack",
        "customer_facing": True,
        "tech_stack": ["Node.js", "React", "PostgreSQL", "Redis", "AWS"],
        "is_management_role": True,
        "weights_config": {"technical": 0.25, "experience": 0.25, "project": 0.1, "communication": 0.15, "management": 0.2, "education": 0.05},
    },
    {
        "title": "Mobile Developer (Flutter)",
        "required_skills": [
            {"name": "Flutter", "level": "mid"},
            {"name": "Dart", "level": "mid"},
            {"name": "Firebase", "level": "junior"},
        ],
        "years_experience": 2,
        "required_role": "Mobile",
        "customer_facing": True,
        "tech_stack": ["Flutter", "Dart", "Firebase", "REST API"],
        "is_management_role": False,
        "weights_config": None,
    },
    {
        "title": "AI / Machine Learning Engineer",
        "required_skills": [
            {"name": "Python", "level": "senior"},
            {"name": "PyTorch", "level": "mid"},
            {"name": "MLOps", "level": "junior"},
        ],
        "years_experience": 3,
        "required_role": "Data",
        "customer_facing": False,
        "tech_stack": ["Python", "PyTorch", "MLflow", "Docker", "GCP"],
        "is_management_role": False,
        "weights_config": {"technical": 0.4, "experience": 0.25, "project": 0.2, "communication": 0.05, "management": 0.0, "education": 0.1},
    },
]

PROJECT_POOL = [
    {
        "project_name": "E-Commerce Platform",
        "role": "Backend Developer",
        "technologies": "Python, FastAPI, PostgreSQL, Redis, Docker",
        "description_vi": "Xây dựng hệ thống e-commerce với API RESTful, hỗ trợ 10.000 đơn hàng/ngày.",
        "description_en": "Built a scalable e-commerce platform with RESTful API supporting 10,000 orders/day.",
        "github_url": "https://github.com/example/ecommerce-platform",
    },
    {
        "project_name": "AI Chatbot for Customer Service",
        "role": "ML Engineer",
        "technologies": "Python, PyTorch, Transformers, FastAPI, Redis",
        "description_vi": "Phát triển chatbot tư vấn khách hàng dùng mô hình ngôn ngữ PhoBERT tinh chỉnh.",
        "description_en": "Developed a customer service chatbot using fine-tuned PhoBERT language model.",
        "github_url": "https://github.com/example/ai-chatbot",
    },
    {
        "project_name": "Portfolio CV Hub",
        "role": "Full Stack Developer",
        "technologies": "Next.js, FastAPI, PostgreSQL, Docker",
        "description_vi": "Nền tảng tạo hồ sơ portfolio trực tuyến cho sinh viên và lập trình viên Việt Nam.",
        "description_en": "Online portfolio platform for Vietnamese students and developers.",
        "github_url": "https://github.com/example/portfolio-cv-hub",
    },
    {
        "project_name": "Real-time Analytics Dashboard",
        "role": "Data Engineer",
        "technologies": "Apache Kafka, Spark Streaming, Elasticsearch, Kibana",
        "description_vi": "Dashboard phân tích dữ liệu real-time cho hệ thống thương mại điện tử lớn.",
        "description_en": "Real-time analytics dashboard for a major e-commerce system.",
        "github_url": "https://github.com/example/realtime-dashboard",
    },
    {
        "project_name": "Mobile Banking App",
        "role": "Mobile Developer",
        "technologies": "Flutter, Dart, Firebase, REST API",
        "description_vi": "Ứng dụng ngân hàng di động với tính năng chuyển tiền, thanh toán QR và xem lịch sử giao dịch.",
        "description_en": "Mobile banking app with money transfer, QR payment, and transaction history.",
        "github_url": "https://github.com/example/mobile-banking",
    },
    {
        "project_name": "DevOps Infrastructure Migration",
        "role": "DevOps Engineer",
        "technologies": "Kubernetes, Terraform, AWS, Helm, ArgoCD",
        "description_vi": "Di chuyển hạ tầng on-premise sang Kubernetes trên AWS, giảm 40% chi phí vận hành.",
        "description_en": "Migrated on-premise infrastructure to Kubernetes on AWS, reducing ops cost by 40%.",
        "github_url": "https://github.com/example/k8s-migration",
    },
    {
        "project_name": "Social Network Platform",
        "role": "Full Stack Developer",
        "technologies": "React, Node.js, MongoDB, Socket.io, Redis",
        "description_vi": "Mạng xã hội mini với tính năng bài đăng, bình luận, tin nhắn thời gian thực.",
        "description_en": "Mini social network with posts, comments, and real-time messaging.",
        "github_url": "https://github.com/example/social-network",
    },
    {
        "project_name": "Fake News Detection System",
        "role": "ML Researcher",
        "technologies": "Python, PyTorch, GNN, BERT, scikit-learn",
        "description_vi": "Hệ thống phát hiện tin giả sử dụng Graph Neural Network kết hợp mô hình ngôn ngữ BERT.",
        "description_en": "Fake news detection using Graph Neural Network combined with BERT language model.",
        "github_url": "https://github.com/example/fake-news-detection",
    },
    {
        "project_name": "Supply Chain Management System",
        "role": "Backend Developer",
        "technologies": "Java, Spring Boot, MySQL, Kafka, Docker",
        "description_vi": "Hệ thống quản lý chuỗi cung ứng cho doanh nghiệp sản xuất, tích hợp IoT tracking.",
        "description_en": "Supply chain management system for manufacturing enterprises with IoT tracking.",
        "github_url": "https://github.com/example/supply-chain",
    },
    {
        "project_name": "LMS — Learning Management System",
        "role": "Full Stack Developer",
        "technologies": "Vue.js, Django, PostgreSQL, Celery, AWS S3",
        "description_vi": "Hệ thống quản lý học tập trực tuyến hỗ trợ video streaming và bài kiểm tra trắc nghiệm.",
        "description_en": "LMS supporting video streaming and interactive quizzes for online education.",
        "github_url": "https://github.com/example/lms-system",
    },
]

INVITATION_MESSAGES = [
    "Chúng tôi rất ấn tượng với profile của bạn và muốn mời bạn tham gia phỏng vấn cho vị trí {job_title}.",
    "Hồ sơ của bạn phù hợp với yêu cầu tuyển dụng của chúng tôi. Bạn có quan tâm đến cơ hội tại {company} không?",
    "Xin chào! Chúng tôi đang tìm kiếm nhân tài cho vị trí {job_title}. Portfolio của bạn rất nổi bật!",
    "Chúng tôi tin rằng kỹ năng của bạn sẽ là bổ sung tuyệt vời cho team {company}. Hãy cùng nói chuyện nhé!",
    "Sau khi xem qua portfolio của bạn, chúng tôi muốn khám phá cơ hội hợp tác cho vị trí {job_title}.",
]


# ---------------------------------------------------------------------------
# Seed functions
# ---------------------------------------------------------------------------

def seed_templates(db: Session) -> list[Template]:
    templates = [
        Template(
            name="Modern Dark",
            description="Template hiện đại với nền tối, phù hợp cho developer và designer.",
            config_json={
                "theme": "dark",
                "primaryColor": "#6366f1",
                "accentColor": "#a5b4fc",
                "fontFamily": "Inter",
                "layout": "sidebar",
                "sections": ["bio", "skills", "experience", "projects", "cv"],
            },
            status=TemplateStatus.ACTIVE,
            created_at=_dt(60),
        ),
        Template(
            name="Clean Light",
            description="Template sáng, tối giản, chuyên nghiệp — phù hợp cho mọi ngành.",
            config_json={
                "theme": "light",
                "primaryColor": "#0ea5e9",
                "accentColor": "#38bdf8",
                "fontFamily": "Outfit",
                "layout": "single-column",
                "sections": ["bio", "experience", "skills", "projects"],
            },
            status=TemplateStatus.ACTIVE,
            created_at=_dt(55),
        ),
        Template(
            name="Graduate Portfolio",
            description="Template dành cho sinh viên mới tốt nghiệp, nhấn mạnh dự án và học vấn.",
            config_json={
                "theme": "light",
                "primaryColor": "#10b981",
                "accentColor": "#6ee7b7",
                "fontFamily": "Roboto",
                "layout": "grid",
                "sections": ["bio", "projects", "skills", "education"],
            },
            status=TemplateStatus.ACTIVE,
            created_at=_dt(50),
        ),
    ]
    db.add_all(templates)
    db.flush()
    return templates


def seed_system_settings(db: Session) -> None:
    settings = [
        SystemSetting(key="site_name", value="Portfolio CV Hub", description="Tên trang web hiển thị trên tiêu đề."),
        SystemSetting(key="max_cv_size_mb", value="10", description="Kích thước tối đa file CV (MB)."),
        SystemSetting(key="allow_social_login", value="true", description="Cho phép đăng nhập qua Google/GitHub."),
        SystemSetting(key="default_language", value="vi", description="Ngôn ngữ mặc định: vi | en."),
        SystemSetting(key="max_skills_per_profile", value="30", description="Số kỹ năng tối đa mỗi hồ sơ."),
        SystemSetting(key="scoring_version", value="2.0", description="Phiên bản thuật toán chấm điểm."),
    ]
    db.add_all(settings)
    db.flush()


def _make_full_name(idx: int) -> str:
    last = CANDIDATE_LAST_NAMES[idx % len(CANDIDATE_LAST_NAMES)]
    middle = MIDDLE_NAMES[idx % len(MIDDLE_NAMES)]
    first = CANDIDATE_FIRST_NAMES[idx % len(CANDIDATE_FIRST_NAMES)]
    return f"{last} {middle} {first}"


def seed_recruiters(db: Session) -> list[tuple[User, Company]]:
    """Seed 5 recruiter users + company profiles."""
    pairs: list[tuple[User, Company]] = []
    for i, cdata in enumerate(COMPANIES_DATA):
        user = User(
            email=cdata["email"],
            password_hash=_hash("Recruiter@123"),
            full_name=cdata["full_name"],
            role=UserRole.RECRUITER,
            status=UserStatus.ACTIVE,
            created_at=_dt(random.randint(60, 120)),
            updated_at=_dt(random.randint(1, 30)),
        )
        db.add(user)
        db.flush()

        company = Company(
            user_id=user.id,
            company_name=cdata["company_name"],
            company_slug=cdata["company_slug"],
            industry=cdata["industry"],
            website=cdata["website"],
            description=cdata["description"],
            logo_url=cdata["logo_url"],
            location=cdata["location"],
            email=cdata["email_company"],
            phone=cdata["phone"],
            status=cdata["status"],
            created_at=user.created_at,
            updated_at=_dt(random.randint(1, 15)),
        )
        db.add(company)
        db.flush()
        pairs.append((user, company))

    return pairs


def _pick_skills_for_candidate(idx: int) -> list[dict]:
    """Chọn kỹ năng đa dạng dựa trên idx."""
    categories = list(SKILL_POOLS.keys())
    # Mỗi candidate tập trung 1-2 category chính
    primary_cat = categories[idx % len(categories)]
    secondary_cat = categories[(idx + 2) % len(categories)]

    skills_data = []
    primary_skills = random.sample(SKILL_POOLS[primary_cat], k=min(5, len(SKILL_POOLS[primary_cat])))
    for s in primary_skills:
        skills_data.append({
            "name": s,
            "category": primary_cat,
            "level": random.choice(EXPERIENCE_LEVELS),
            "endorsements": random.randint(0, 50),
        })

    secondary_skills = random.sample(SKILL_POOLS[secondary_cat], k=min(3, len(SKILL_POOLS[secondary_cat])))
    for s in secondary_skills:
        skills_data.append({
            "name": s,
            "category": secondary_cat,
            "level": random.choice([ExperienceLevel.ENTRY, ExperienceLevel.JUNIOR, ExperienceLevel.MID]),
            "endorsements": random.randint(0, 20),
        })

    return skills_data


def _pick_experiences(idx: int, candidate_id: int) -> list[Experience]:
    """Tạo 1-3 kinh nghiệm làm việc khác nhau theo idx."""
    count = (idx % 3) + 1  # 1, 2, hoặc 3 kinh nghiệm
    exps = []
    current_date = datetime.utcnow()

    for j in range(count):
        years_back = (j + 1) * random.randint(1, 2)
        start = _rand_date(2018 + j, 2022 + j)
        if j == 0:
            # Công việc hiện tại
            is_current = random.choice([True, False])
            end = None if is_current else current_date - timedelta(days=random.randint(30, 180))
        else:
            is_current = False
            end = start + timedelta(days=random.randint(180, 730))

        job_title = JOB_TITLES[(idx + j * 3) % len(JOB_TITLES)]
        company = TECH_COMPANIES[(idx + j * 7) % len(TECH_COMPANIES)]
        proj_type_vi = "san pham" if j == 0 else "outsourcing"
        proj_type_en = "product" if j == 0 else "outsourcing"
        team_size_vi = random.randint(3, 15)
        team_size_en = random.randint(3, 15)
        perf_gain_vi = random.randint(10, 50)
        perf_gain_en = random.randint(10, 50)

        exp = Experience(
            candidate_id=candidate_id,
            job_title=job_title,
            company_name=company,
            description={
                "vi": f"Phu trach {job_title} tai {company}. Lam viec voi team {team_size_vi} nguoi, dong gop vao cac du an {proj_type_vi} lon. Cai thien hieu suat he thong {perf_gain_vi}%.",
                "en": f"Worked as {job_title} at {company} in a team of {team_size_en}. Contributed to {proj_type_en} projects. Improved system performance by {perf_gain_en}%.",
            },
            start_date=start,
            end_date=end,
            is_current=(j == 0 and is_current),
            created_at=_dt(random.randint(10, 60)),
            updated_at=_dt(random.randint(1, 10)),
        )
        exps.append(exp)

    return exps


def _pick_projects(idx: int, candidate_id: int) -> list[Project]:
    """Chọn 1-3 dự án không trùng nhau."""
    count = (idx % 3) + 1
    selected = []
    pool_indices = list(range(len(PROJECT_POOL)))
    random.shuffle(pool_indices)

    for k in pool_indices[:count]:
        pdata = PROJECT_POOL[k]
        proj = Project(
            candidate_id=candidate_id,
            project_name=pdata["project_name"],
            role=pdata["role"],
            technologies=pdata["technologies"],
            description={
                "vi": pdata["description_vi"],
                "en": pdata["description_en"],
            },
            project_url=f"https://portfolio-demo.io/project-{idx}-{k}",
            github_url=pdata["github_url"],
            created_at=_dt(random.randint(15, 90)),
            updated_at=_dt(random.randint(1, 15)),
        )
        selected.append(proj)

    return selected


def seed_candidates(
    db: Session,
    templates: list[Template],
    companies: list[Company],
    count: int = 95,
) -> list[CandidateProfile]:
    """Seed 95 candidate users với đầy đủ profile."""
    profiles: list[CandidateProfile] = []

    for i in range(count):
        full_name = _make_full_name(i)
        first_name_slug = full_name.split()[-1].lower()
        last_name_slug = full_name.split()[0].lower()
        email_domain = random.choice(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "mail.com"])
        email = f"{first_name_slug}.{last_name_slug}{i:02d}@{email_domain}"
        public_slug = f"{first_name_slug}-{last_name_slug}-{i:03d}"

        city = CITIES[i % len(CITIES)]
        university = UNIVERSITIES[i % len(UNIVERSITIES)]
        grad_year = GRADUATION_YEARS[i % len(GRADUATION_YEARS)]
        headline = HEADLINE_POOL[i % len(HEADLINE_POOL)]
        template = templates[i % len(templates)]

        # 70% is_public
        is_public = i % 10 != 0  # 9/10 public

        created_days_ago = random.randint(5, 200)

        # --- User ---
        user = User(
            email=email,
            password_hash=_hash(f"Candidate@{i:03d}"),
            full_name=full_name,
            role=UserRole.CANDIDATE,
            status=UserStatus.ACTIVE if i % 15 != 0 else UserStatus.PENDING,
            created_at=_dt(created_days_ago),
            updated_at=_dt(random.randint(1, created_days_ago)),
        )

        # 10% có social account
        if i % 10 == 1:
            provider = random.choice(["google", "github"])
            user.social_accounts = [
                SocialAccount(
                    provider=provider,
                    provider_account_id=f"{provider}_uid_{i:06d}",
                    access_token=None,
                    created_at=_dt(created_days_ago),
                )
            ]

        db.add(user)
        db.flush()

        # --- CandidateProfile ---
        bio_text_vi = (
            f"Tôi là {full_name}, sinh viên/kỹ sư tốt nghiệp từ {university} năm {grad_year}, "
            f"hiện đang sinh sống và làm việc tại {city}. "
            f"Tôi có niềm đam mê với lập trình và giải quyết các bài toán phức tạp. "
            f"Luôn tìm kiếm cơ hội học hỏi và phát triển bản thân trong môi trường năng động."
        )
        bio_text_en = (
            f"I am {full_name}, a software engineer graduated from {university} in {grad_year}, "
            f"currently based in {city}. "
            f"Passionate about programming and solving complex problems. "
            f"Always seeking opportunities to learn and grow in a dynamic environment."
        )

        profile = CandidateProfile(
            user_id=user.id,
            full_name=full_name,
            headline=headline,
            bio={"vi": bio_text_vi, "en": bio_text_en},
            avatar_url=f"https://api.dicebear.com/8.x/avataaars/svg?seed={email}",
            is_public=is_public,
            views=random.randint(0, 500),
            public_slug=public_slug,
            template_id=template.id,
            created_at=_dt(created_days_ago),
            updated_at=_dt(random.randint(1, created_days_ago)),
        )
        db.add(profile)
        db.flush()

        # --- Skills ---
        skills_data = _pick_skills_for_candidate(i)
        for sk in skills_data:
            skill = Skill(
                candidate_id=profile.id,
                name=sk["name"],
                level=sk["level"],
                category=sk["category"],
                endorsements=sk["endorsements"],
                created_at=_dt(random.randint(5, 50)),
                updated_at=_dt(random.randint(1, 5)),
            )
            db.add(skill)

        # --- Experiences ---
        for exp in _pick_experiences(i, profile.id):
            db.add(exp)

        # --- Projects ---
        for proj in _pick_projects(i, profile.id):
            db.add(proj)

        # --- CV ---
        cv_idx = (i % 5) + 1
        cv = CV(
            candidate_id=profile.id,
            file_name=f"CV_{full_name.replace(' ', '_')}_{grad_year}.pdf",
            file_path=f"/uploads/cvs/user_{user.id}/cv_{cv_idx}.pdf",
            file_size=random.randint(100_000, 3_000_000),
            is_primary=True,
            created_at=_dt(random.randint(10, 60)),
            updated_at=_dt(random.randint(1, 10)),
        )
        db.add(cv)
        db.flush()

        # --- ProfileViews ---
        view_count = random.randint(1, 8)
        for _ in range(view_count):
            viewer_type = random.choice([ViewerType.ANONYMOUS, ViewerType.COMPANY])
            company_id = random.choice(companies).id if viewer_type == ViewerType.COMPANY else None
            pv = ProfileView(
                candidate_id=profile.id,
                viewer_type=viewer_type,
                company_id=company_id,
                viewed_at=_dt(random.randint(0, 60)),
            )
            db.add(pv)

        profiles.append(profile)

    db.flush()
    return profiles


def seed_job_requirements(db: Session, companies: list[Company]) -> list[JobRequirement]:
    """Mỗi company có 1-2 job requirements."""
    jrs: list[JobRequirement] = []
    template_pool = JOB_REQ_TEMPLATES.copy()
    random.shuffle(template_pool)

    template_idx = 0
    for comp in companies:
        req_count = random.randint(1, 2)
        for _ in range(req_count):
            tmpl = template_pool[template_idx % len(template_pool)]
            template_idx += 1

            jr = JobRequirement(
                company_id=comp.id,
                title=tmpl["title"],
                required_skills=tmpl["required_skills"],
                years_experience=tmpl["years_experience"],
                required_role=tmpl["required_role"],
                customer_facing=tmpl["customer_facing"],
                tech_stack=tmpl["tech_stack"],
                is_management_role=tmpl["is_management_role"],
                weights_config=tmpl["weights_config"],
                is_active=True,
                created_at=_dt(random.randint(10, 60)),
                updated_at=_dt(random.randint(1, 10)),
            )
            db.add(jr)
            jrs.append(jr)

    db.flush()
    return jrs


def seed_invitations(
    db: Session,
    companies: list[Company],
    profiles: list[CandidateProfile],
) -> None:
    """Mỗi company mời 5-10 ứng viên."""
    statuses = list(InvitationStatus)

    for comp in companies:
        selected_profiles = random.sample(profiles, k=random.randint(5, 10))
        company_name = comp.company_name
        job_title = JOB_TITLES[random.randint(0, len(JOB_TITLES) - 1)]

        for prof in selected_profiles:
            msg_template = random.choice(INVITATION_MESSAGES)
            msg = msg_template.format(job_title=job_title, company=company_name)

            inv = JobInvitation(
                company_id=comp.id,
                candidate_id=prof.id,
                job_title=job_title,
                message=msg,
                status=random.choice(statuses),
                created_at=_dt(random.randint(1, 30)),
                updated_at=_dt(random.randint(0, 5)),
            )
            db.add(inv)

    db.flush()


def seed_comparisons(
    db: Session,
    companies: list[Company],
    profiles: list[CandidateProfile],
    job_requirements: list[JobRequirement],
) -> None:
    """Mỗi company tạo 1-2 phiên so sánh ứng viên."""
    for comp in companies:
        comp_jrs = [jr for jr in job_requirements if jr.company_id == comp.id]
        if not comp_jrs:
            continue

        for _ in range(random.randint(1, 2)):
            jr = random.choice(comp_jrs)
            criteria = {
                "job_requirement_id": jr.id,
                "title": jr.title,
                "required_skills": jr.required_skills,
                "years_experience": jr.years_experience,
                "weights": jr.weights_config or {"technical": 0.3, "experience": 0.3, "project": 0.2, "communication": 0.1, "management": 0.05, "education": 0.05},
                "snapshot_at": datetime.utcnow().isoformat(),
            }

            comp_session = Comparison(
                company_id=comp.id,
                criteria_json=criteria,
                created_at=_dt(random.randint(1, 20)),
            )
            db.add(comp_session)
            db.flush()

            # Thêm 3-5 ứng viên vào phiên so sánh
            selected = random.sample(profiles, k=random.randint(3, 5))
            seen_candidate_ids = set()
            for prof in selected:
                if prof.id in seen_candidate_ids:
                    continue
                seen_candidate_ids.add(prof.id)
                cc = ComparisonCandidate(
                    comparison_id=comp_session.id,
                    candidate_id=prof.id,
                )
                db.add(cc)

    db.flush()


def seed_admin(db: Session) -> User:
    """Seed 1 admin user."""
    admin = User(
        email="admin@portfoliocvhub.vn",
        password_hash=_hash("Admin@SuperSecret2026"),
        full_name="Super Admin",
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
        created_at=_dt(200),
        updated_at=_dt(1),
    )
    db.add(admin)
    db.flush()
    return admin


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def run_seed() -> None:
    print("🌱  Starting seed — Phase 2 Portfolio CV Hub...")

    # Tạo tất cả bảng nếu chưa tồn tại (dev only)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Kiểm tra nếu DB đã có dữ liệu
        if db.query(User).count() > 0:
            print("⚠️   Database already has data. Skipping seed to avoid duplicates.")
            print("    Nếu muốn seed lại, hãy xoá dữ liệu cũ: TRUNCATE ... CASCADE;")
            return

        # 1. Templates & System Settings
        templates = seed_templates(db)
        print(f"  ✓ {len(templates)} templates created")

        seed_system_settings(db)
        print("  ✓ System settings created")

        # 2. Admin
        seed_admin(db)
        print("  ✓ Admin user created (admin@portfoliocvhub.vn / Admin@SuperSecret2026)")

        # 3. Recruiters & Companies
        recruiter_pairs = seed_recruiters(db)
        companies = [pair[1] for pair in recruiter_pairs]
        print(f"  ✓ {len(recruiter_pairs)} recruiter users + companies created")

        # 4. Job Requirements
        job_requirements = seed_job_requirements(db, companies)
        print(f"  ✓ {len(job_requirements)} job requirements created")

        # 5. Candidates (95)
        profiles = seed_candidates(db, templates, companies, count=95)
        print(f"  ✓ {len(profiles)} candidate profiles created (with skills, experiences, projects, CVs, profile views)")

        # 6. Invitations
        seed_invitations(db, companies, profiles)
        print("  ✓ Job invitations created")

        # 7. Comparisons
        seed_comparisons(db, companies, profiles, job_requirements)
        print("  ✓ Comparison sessions created")

        db.commit()
        print("\n✅  Seed completed successfully!")
        print(f"   Total users: {db.query(User).count()} (1 admin + 5 recruiters + 95 candidates)")
        print(f"   Companies: {db.query(Company).count()}")
        print(f"   Candidate profiles: {db.query(CandidateProfile).count()}")
        print(f"   Skills: {db.query(Skill).count()}")
        print(f"   Experiences: {db.query(Experience).count()}")
        print(f"   Projects: {db.query(Project).count()}")
        print(f"   CVs: {db.query(CV).count()}")
        print(f"   Job requirements: {db.query(JobRequirement).count()}")
        print(f"   Job invitations: {db.query(JobInvitation).count()}")
        print(f"   Profile views: {db.query(ProfileView).count()}")
        print(f"   Comparison sessions: {db.query(Comparison).count()}")

    except Exception as exc:
        db.rollback()
        print(f"\n❌  Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
