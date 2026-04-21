FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads /app/data

# Cấp quyền thực thi cho entrypoint
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# entrypoint.sh sẽ: migrate → seed → uvicorn
ENTRYPOINT ["/app/entrypoint.sh"]
