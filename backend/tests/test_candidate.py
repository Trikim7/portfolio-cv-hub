"""Sample tests for candidate portfolio"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_register():
    """Test user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "testpass123",
            "role": "candidate"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"


def test_login():
    """Test user login"""
    # First register
    client.post(
        "/api/auth/register",
        json={
            "email": "logintest@example.com",
            "password": "testpass123",
            "role": "candidate"
        }
    )

    # Then login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "logintest@example.com",
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_get_profile():
    """Test get candidate profile"""
    # Register
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": "profile@example.com",
            "password": "testpass123",
            "role": "candidate"
        }
    )
    token = reg_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/api/candidate/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] is not None
