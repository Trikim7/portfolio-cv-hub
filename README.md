# Portfolio CV Hub

<p align="center">
  <b>Nền tảng kết nối ứng viên và nhà tuyển dụng</b><br/>
  Quản lý Portfolio + CV + Tuyển dụng trong một hệ thống thống nhất.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/ORM-SQLAlchemy-red?style=for-the-badge" alt="SQLAlchemy"/>
  <img src="https://img.shields.io/badge/Infra-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## 1) Tinh gon ve du an

`Portfolio CV Hub` la he thong web full-stack ho tro 3 nhom nguoi dung:

- **Ung vien**: tao profile, cap nhat skills/experience/projects, upload CV, bat/tat portfolio public
- **Nha tuyen dung**: dang ky doanh nghiep, tim kiem ung vien, gui loi moi, AI Ranking
- **Admin**: dashboard quan tri, phe duyet/tu choi doanh nghiep, quan ly users

Muc tieu: bien ho so ung vien thanh mot portfolio co cau truc, de doanh nghiep tim nhanh va danh gia chinh xac hon.

---

## 2) Tinh nang noi bat

### Ung vien
- Quan ly day du thong tin ho so (ca nhan, ky nang, kinh nghiem, du an)
- Upload CV va xem/tai CV
- Tao portfolio public theo slug de chia se

### Nha tuyen dung
- Dang ky tai khoan doanh nghiep (qua quy trinh duyet)
- Tim kiem ung vien theo keyword + ky nang
- So sanh ung vien va gui loi moi tuyen dung
- AI Ranking theo tieu chi cong viec

### Admin
- Xem thong ke tong quan he thong
- Duyet doanh nghiep cho truy cap dashboard recruiter
- Khoa/mo khoa tai khoan khi can

### Public pages
- Trang chu co so lieu tong hop
- Trang tim kiem ung vien cong khai
- Trang portfolio cong khai cua tung ung vien

---

## 3) Kien truc tong quan

```text
Frontend (Next.js 14 + TypeScript + Tailwind)
        |
        v
Backend API (FastAPI + SQLAlchemy + Alembic)
        |
        v
PostgreSQL
        |
        +--> Cloudinary (luu avatar/logo/CV neu duoc cau hinh)
```

---

## 4) Cong nghe su dung

| Thanh phan | Cong nghe |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Migration | Alembic |
| Database | PostgreSQL |
| File storage | Cloudinary (fallback local) |
| Auth | JWT + OAuth (Google/GitHub) |
| DevOps | Docker, Docker Compose |

---

## 5) Chay local bang Docker (khuyen dung)

### Buoc 1: Tao file env

```bash
cp .env.example .env
```

Cap nhat gia tri can thiet trong `.env` (DB, JWT, OAuth, Cloudinary).

### Buoc 2: Build va chay

```bash
docker compose up --build
```

### Dia chi truy cap

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

### Dung he thong

```bash
docker compose down
```

### Reset toan bo DB (xoa volume)

```bash
docker compose down -v
```

---

## 6) Chay thu cong (development)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux
# .venv\Scripts\Activate.ps1  # Windows PowerShell

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend (terminal khac)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 7) Bien moi truong quan trong

| Bien | Vi du | Mo ta |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://user:pass@db:5432/dbname` | Ket noi PostgreSQL |
| `SECRET_KEY` | `change-me` | Ky JWT |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS cho frontend |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL backend phia frontend |
| `GOOGLE_CLIENT_ID` | `...` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | `...` | OAuth Google |
| `GITHUB_CLIENT_ID` | `...` | OAuth GitHub |
| `GITHUB_CLIENT_SECRET` | `...` | OAuth GitHub |
| `CLOUDINARY_CLOUD_NAME` | `...` | Cloudinary |
| `CLOUDINARY_API_KEY` | `...` | Cloudinary |
| `CLOUDINARY_API_SECRET` | `...` | Cloudinary |

---

## 8) API modules

| Module | Prefix | Chuc nang |
|---|---|---|
| Auth | `/api/auth` | Dang ky, dang nhap, OAuth |
| Candidate | `/api/candidate` | CRUD profile, skills, experiences, projects, CV |
| Recruiter | `/api/recruiter` | Company profile, search, invitations, ranking |
| Admin | `/api/admin` | Dashboard stats, quan ly users/companies |
| Public | `/api/public` | Stats trang chu, featured candidates |

Chi tiet API: `http://localhost:8000/docs`

---

## 9) Alembic migration

```bash
cd backend

# Tao migration moi
python3 -m alembic revision --autogenerate -m "describe changes"

# Apply migration
python3 -m alembic upgrade head
```

Lenh hay dung:

```bash
python3 -m alembic current
python3 -m alembic history
python3 -m alembic downgrade -1
python3 -m alembic check
```

---

## 10) Cau truc thu muc

```text
portfolio-cv-hub/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   └── types/
    └── package.json
```

---

## 11) Demo flow de bao cao

1. Dang nhap Admin -> mo Dashboard tong quan
2. Dang ky doanh nghiep -> cho Admin duyet
3. Dang ky ung vien -> cap nhat profile + upload CV + bat public
4. Recruiter tim kiem -> so sanh -> gui loi moi
5. Ung vien nhan loi moi trong dashboard

---

## 12) Ghi chu bao mat

- Khong commit `.env` that len repo cong khai
- Rotate secrets neu da lo thong tin OAuth/Cloudinary
- Production nen dung DB backup + monitoring

---

## 13) License

Noi bo do an/bao cao hoc tap. Dieu chinh theo quy dinh nhom/mon hoc.
