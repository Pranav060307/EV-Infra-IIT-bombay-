@echo off
setlocal enabledelayedexpansion
title ChargeAtlas India - Service Launcher & Verifier

echo =================================================================
echo   CHARGEATLAS INDIA - EV INFRASTRUCTURE DECISION PLATFORM
echo   IIT Bombay Techfest 2026-27 ^| Team SuperNova
echo =================================================================
echo.

set "PROJ_DIR=D:\EV Infra"
cd /d "%PROJ_DIR%"

:: 1. Verify Prerequisites
if not exist "%PROJ_DIR%\.venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found at %PROJ_DIR%\.venv\Scripts\python.exe
    echo Please ensure the project virtual environment is created.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in system PATH.
    pause
    exit /b 1
)

:: 2. Check and Launch Backend (Port 8000)
echo [1/4] Checking FastAPI Backend status on port 8000...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/health' -TimeoutSec 2 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo       FastAPI Backend is already running and healthy on port 8000.
) else (
    echo       Starting FastAPI Backend in dedicated window...
    start "ChargeAtlas Backend (FastAPI)" cmd /k "cd /d D:\EV Infra\backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
)

:: 3. Check and Launch Frontend (Port 5173)
echo [2/4] Checking Vite Frontend status on port 5173...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 2 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo       Vite Frontend is already running and healthy on port 5173.
) else (
    echo       Starting Vite Frontend in dedicated window...
    start "ChargeAtlas Frontend (Vite)" cmd /k "cd /d D:\EV Infra\frontend && npm run dev -- --port 5173"
)

:: 4. Verify HTTP Readiness with Polling
echo.
echo [3/4] Probing HTTP endpoints for live readiness (up to 15s)...

set "BACKEND_READY=0"
set "FRONTEND_READY=0"

for /l %%i in (1,1,15) do (
    if "!BACKEND_READY!"=="0" (
        powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/health' -TimeoutSec 1 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
        if !errorlevel! equ 0 set "BACKEND_READY=1"
    )
    if "!FRONTEND_READY!"=="0" (
        powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 1 -UseBasicParsing; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
        if !errorlevel! equ 0 set "FRONTEND_READY=1"
    )
    if "!BACKEND_READY!"=="1" if "!FRONTEND_READY!"=="1" goto :both_ready
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 800"
)

:both_ready
echo.
echo [4/4] Verification Summary:
if "%BACKEND_READY%"=="1" (
    echo   [OK] FastAPI Backend: http://localhost:8000/api/v1/health (HTTP 200)
    echo        API Documentation: http://localhost:8000/docs
) else (
    echo   [WARNING] FastAPI Backend on port 8000 did not respond within 15 seconds.
    echo             Check the "ChargeAtlas Backend (FastAPI)" console window for errors.
)

if "%FRONTEND_READY%"=="1" (
    echo   [OK] Vite React Frontend: http://localhost:5173/ (HTTP 200)
) else (
    echo   [WARNING] Vite Frontend on port 5173 did not respond within 15 seconds.
    echo             Check the "ChargeAtlas Frontend (Vite)" console window for errors.
)

echo.
echo =================================================================
if "%BACKEND_READY%"=="1" if "%FRONTEND_READY%"=="1" (
    echo   CHARGEATLAS INDIA PLATFORM IS LIVE AND READY!
    echo   Opening dashboard in your default browser...
    start http://localhost:5173/
) else (
    echo   One or more services could not be verified automatically.
    echo   Please inspect the service windows for startup logs.
)
echo =================================================================
echo To stop services cleanly, run stop_chargeatlas.bat
echo.
pause
