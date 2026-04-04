# Lệnh chạy dự án (macOS + Windows)

## Ưu tiên Docker Compose (mọi OS)

```bash
docker compose -f infra/docker-compose.yml up --build
```

Fallback:

```bash
docker-compose -f infra/docker-compose.yml up --build
```

## Backend local (FastAPI)

### macOS/Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Windows (PowerShell)

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend local

### macOS/Linux

```bash
cd frontend
npm install
npm run dev
```

### Windows (PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

