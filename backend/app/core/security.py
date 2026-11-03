import os
import hmac
import hashlib
import json
import base64
import secrets
import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db

security_scheme = HTTPBearer(auto_error=False)

# ------------------------------------------------------------------------------
# 1. NIST-COMPLIANT PASSWORD HASHING (PBKDF2-HMAC-SHA256)
# ------------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a random 16-byte salt.
    Format: pbkdf2_sha256$iterations$salt$hash
    """
    if not password:
        raise ValueError("Password cannot be empty.")
    salt = secrets.token_hex(16)
    iterations = 100_000
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    ).hex()
    return f"pbkdf2_sha256${iterations}${salt}${derived}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a stored hash using constant-time comparison.
    """
    if not plain_password or not hashed_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_hash = parts[3]
        test_hash = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        ).hex()
        return hmac.compare_digest(test_hash, expected_hash)
    except Exception:
        return False


# ------------------------------------------------------------------------------
# 2. RFC 7519 JWT IMPLEMENTATION (HMAC-SHA256)
# ------------------------------------------------------------------------------

def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding < 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """
    Creates a cryptographically signed RFC 7519 JSON Web Token with HMAC-SHA256.
    """
    to_encode = data.copy()
    now = datetime.datetime.now(datetime.timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    })

    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(to_encode, separators=(",", ":")).encode("utf-8")

    header_b64 = _base64url_encode(header_bytes)
    payload_b64 = _base64url_encode(payload_bytes)

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        signing_input,
        hashlib.sha256
    ).digest()
    sig_b64 = _base64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token signature and expiration.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Malformed JWT token.")
        
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            signing_input,
            hashlib.sha256
        ).digest()
        actual_sig = _base64url_decode(sig_b64)

        if not hmac.compare_digest(actual_sig, expected_sig):
            raise ValueError("Invalid token signature.")

        payload_bytes = _base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        now_ts = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        if "exp" in payload and payload["exp"] < now_ts:
            raise ValueError("Token has expired.")

        return payload
    except Exception as e:
        raise ValueError(f"Token validation failed: {e}") from e


# ------------------------------------------------------------------------------
# 3. FASTAPI AUTHENTICATION & AUTHORIZATION DEPENDENCIES
# ------------------------------------------------------------------------------

def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> Dict[str, Any]:
    """
    Extracts and authenticates user claims from Bearer token or Admin API Key.
    """
    # 1. Check Admin API Key bypass if configured
    if x_api_key and settings.ADMIN_API_KEY and hmac.compare_digest(x_api_key, settings.ADMIN_API_KEY):
        return {
            "sub": "admin_service_account",
            "username": "sysadmin",
            "role": "admin",
            "is_service_account": True
        }

    # 2. Check Bearer token
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        claims = decode_access_token(credentials.credentials)
        return claims
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"}
        )


def require_role(allowed_roles: list):
    """
    Role-based authorization dependency.
    """
    def role_checker(claims: Dict[str, Any] = Depends(get_current_user_claims)):
        user_role = claims.get("role", "viewer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in {allowed_roles}, your role is '{user_role}'."
            )
        return claims
    return role_checker

