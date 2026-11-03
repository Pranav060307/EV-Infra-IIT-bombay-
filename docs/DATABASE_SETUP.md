# ChargeAtlas India — PostgreSQL 18 Database Setup & Connection Architecture
**Phase 4:** Database Foundation & PostGIS Integration  
**Competition:** IIT Bombay Techfest 2026–27 | EV Infrastructure Map India Challenge  
**Team:** SuperNova (Sanjivani University) | **Lead:** Pranav Jadhav  

---

## 1. Environment Audit & Service Status

| Parameter | Observed System Value | Verification Result |
| :--- | :--- | :---: |
| **PostgreSQL Version** | PostgreSQL 18 (EnterpriseDB x64 build) | **VERIFIED** |
| **Installation Path** | `C:\Program Files\PostgreSQL\18` | **VERIFIED** |
| **Data Directory** | `C:\Program Files\PostgreSQL\18\data` | **VERIFIED** |
| **Windows Service Name** | `postgresql-x64-18` | **VERIFIED** |
| **Service Status** | Accepting TCP connections on port 5432 | **VERIFIED** |
| **Host / Interface** | `127.0.0.1:5432` / `localhost:5432` | **VERIFIED** |
| **Default Superuser** | `postgres` | **VERIFIED** |
| **Target Database** | `chargeatlas_db` | **PENDING CREATION** |
| **Active Python Env** | Python 3.15.1 (`d:\EV Infra\.venv`) | **VERIFIED** |
| **Installed Drivers** | `psycopg2-binary 2.9.13`, `SQLAlchemy 2.1.6` | **VERIFIED** |
| **Installed Extensions** | `GeoAlchemy2 0.20.0`, `Alembic 1.20.1` | **VERIFIED (FIXED)** |

---

## 2. Authentication Diagnosis & Blocker Resolution

### The Issue
During application startup and connection probes, the backend logs recorded:
```text
psycopg2.OperationalError: connection to server at "localhost" (::1), port 5432 failed: 
FATAL: password authentication failed for user "postgres"
```

### Root Cause
1. In `C:\Program Files\PostgreSQL\18\data\pg_hba.conf`, local connections over IPv4 (`127.0.0.1/32`) and IPv6 (`::1/128`) enforce `scram-sha-256` password authentication.
2. The developer environment file (`d:\EV Infra\backend\.env`) was initially configured with placeholder credentials:
   ```env
   DB_HOST="localhost"
   DB_PORT=5432
   DB_NAME="chargeatlas_db"
   DB_USER="postgres"
   DB_PASSWORD="password"
   ```
3. During the initial installation of PostgreSQL 18 on 31 May 2026, an administrative master password was set for the `postgres` superuser by the developer. The default dummy string `"password"` was rejected by the server.

### Safe Password Configuration Procedure
To establish the connection without destructive commands or automated credential overwrites:

**Option A (If Developer Knows Existing Password):**
Update `d:\EV Infra\backend\.env` with the actual password:
```env
DB_PASSWORD="<your_postgres_password>"
```
Then create the application database and user:
```sql
CREATE DATABASE chargeatlas_db;
CREATE USER chargeatlas_user WITH ENCRYPTED PASSWORD '<secure_password>';
GRANT ALL PRIVILEGES ON DATABASE chargeatlas_db TO chargeatlas_user;
```

**Option B (Safe Local Password Reset Procedure via pg_hba.conf):**
If the superuser password is unknown:
1. Open `C:\Program Files\PostgreSQL\18\data\pg_hba.conf` in an administrative editor.
2. Temporarily modify the IPv4 line from:
   ```text
   host    all             all             127.0.0.1/32             scram-sha-256
   ```
   to:
   ```text
   host    all             all             127.0.0.1/32             trust
   ```
3. Reload PostgreSQL configuration:
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" reload -D "C:\Program Files\PostgreSQL\18\data"
   ```
4. Connect and set a known password:
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h 127.0.0.1 -c "ALTER USER postgres WITH PASSWORD '<new_password>';"
   ```
5. Restore `pg_hba.conf` back to `scram-sha-256` and reload `pg_ctl`.
6. Update `backend/.env` with the new password.

---

## 3. Database Resilience Architecture

To ensure the ChargeAtlas platform remains fully operational throughout development, `backend/app/core/database.py` implements an explicit three-mode connection strategy:
1. **`DB_ENGINE_MODE="postgres"`**: Enforces strict PostgreSQL connection; raises immediate error if unreachable.
2. **`DB_ENGINE_MODE="sqlite"`**: Directly connects to local development SQLite (`chargeatlas_dev.db`).
3. **`DB_ENGINE_MODE="auto"` (Active Default)**: Attempts PostgreSQL first; if password authentication fails or the server is unavailable, logs a transparent warning and falls back to SQLite so local developers and UI evaluations are never blocked.

