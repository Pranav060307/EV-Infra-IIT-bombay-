import os
import sys
import time
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.config import settings
from app.core.database import init_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()
    yield

# ------------------------------------------------------------------------------
# 1. NIST PBKDF2 Password Hashing Unit Tests
# ------------------------------------------------------------------------------

def test_password_hashing_and_verification():
    raw_pass = "SuperSecurePass@2026!"
    hashed = hash_password(raw_pass)

    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(raw_pass, "") is False

    # Verify salt uniqueness (two hashes of same password must differ)
    hashed_2 = hash_password(raw_pass)
    assert hashed != hashed_2


# ------------------------------------------------------------------------------
# 2. RFC 7519 JWT Token Generation & Tampering Unit Tests
# ------------------------------------------------------------------------------

def test_jwt_token_creation_and_validation():
    payload = {"sub": "USR-12345", "username": "evaluator", "role": "analyst"}
    token = create_access_token(payload)

    decoded = decode_access_token(token)
    assert decoded["sub"] == "USR-12345"
    assert decoded["username"] == "evaluator"
    assert decoded["role"] == "analyst"
    assert "exp" in decoded

    # Test tampering signature
    parts = token.split(".")
    tampered_sig = parts[0] + "." + parts[1] + "." + "invalid_signature_bits"
    with pytest.raises(ValueError, match="Invalid token signature"):
        decode_access_token(tampered_sig)


# ------------------------------------------------------------------------------
# 3. Security HTTP Headers & Response Auditing
# ------------------------------------------------------------------------------

def test_security_headers_present():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-Processed-Time-Ms" in response.headers


# ------------------------------------------------------------------------------
# 4. Authentication Endpoints Integration Tests
# ------------------------------------------------------------------------------

def test_auth_registration_and_login_flow():
    test_user = f"eval_user_{int(time.time())}"
    test_email = f"{test_user}@techfest.org"
    test_pass = "EvaluationPass@2026"

    # 1. Register new user
    reg_res = client.post("/api/v1/auth/register", json={
        "username": test_user,
        "email": test_email,
        "password": test_pass,
        "full_name": "Techfest Evaluator",
        "role": "analyst"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["username"] == test_user
    assert user_data["role"] == "analyst"

    # 2. Login with valid credentials
    login_res = client.post("/api/v1/auth/login", json={
        "username": test_user,
        "password": test_pass
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    # 3. Access protected /me endpoint with Bearer token
    access_token = token_data["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {access_token}"
    })
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["username"] == test_user
    assert profile["email"] == test_email

    # 4. Access /me without token (must return 401 Unauthorized)
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

    # 5. Access /me with Admin API Key bypass
    key_res = client.get("/api/v1/auth/me", headers={
        "X-API-Key": settings.ADMIN_API_KEY
    })
    assert key_res.status_code == 200
    assert key_res.json()["role"] == "admin"


# ------------------------------------------------------------------------------
# 5. File Upload Restrictions & Security Tests
# ------------------------------------------------------------------------------

def test_file_upload_security_restrictions():
    # 1. Reject unsupported file extension (.exe)
    malicious_file = ("exploit.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/octet-stream")
    bad_ext_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": malicious_file},
        data={"dataset_category": "charging_stations"}
    )
    assert bad_ext_res.status_code == 400
    assert "Unsupported file format" in bad_ext_res.json()["detail"]

    # 2. Reject empty file (0 bytes)
    empty_file = ("empty.csv", b"", "text/csv")
    empty_res = client.post(
        "/api/v1/datasets/upload",
        files={"file": empty_file},
        data={"dataset_category": "charging_stations"}
    )
    assert empty_res.status_code == 400
    assert "empty" in empty_res.json()["detail"].lower()
