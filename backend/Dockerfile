FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/uploads /app/data

# Strip CRLF (Windows git autocrlf) rồi cấp quyền thực thi
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

# entrypoint.sh sẽ: migrate → seed → uvicorn
ENTRYPOINT ["/app/entrypoint.sh"]
