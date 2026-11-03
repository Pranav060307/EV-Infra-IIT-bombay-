@echo off
setlocal enabledelayedexpansion
title ChargeAtlas India - Safe Service Terminator

echo =================================================================
echo   CHARGEATLAS INDIA - SAFE SERVICE SHUTDOWN
echo =================================================================
echo.

powershell -NoProfile -Command "
$ports = @(8000, 5173);
$terminated = 0;
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue;
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess;
            try {
                $proc = Get-Process -Id $pidToKill -ErrorAction Stop;
                Write-Host ('Stopping {0} (PID {1}) on port {2}...' -f $proc.ProcessName, $pidToKill, $port) -ForegroundColor Yellow;
                Stop-Process -Id $pidToKill -Force -ErrorAction Stop;
                Write-Host ('  [OK] Terminated PID {0} on port {1}' -f $pidToKill, $port) -ForegroundColor Green;
                $terminated++;
            } catch {
                Write-Host ('  [WARN] Could not stop PID {0}: {1}' -f $pidToKill, $_) -ForegroundColor Red;
            }
        }
    } else {
        Write-Host ('No active process listening on port {0}.' -f $port) -ForegroundColor DarkGray;
    }
}
if ($terminated -gt 0) {
    Write-Host 'ChargeAtlas India services stopped successfully.' -ForegroundColor Green;
} else {
    Write-Host 'No running ChargeAtlas services were found.' -ForegroundColor Cyan;
}
"

echo.
echo =================================================================
pause

