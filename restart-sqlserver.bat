@echo off
REM Restart SQL Server Express - Run as Administrator
REM This batch file restarts the SQL Server service and verifies TCP/IP

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges.
    echo Requesting elevation...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

cls
echo.
echo ========================================
echo Restarting SQL Server (SQLEXPRESS)
echo ========================================
echo.

REM Stop the service
echo [1/3] Stopping SQL Server service...
net stop "MSSQL$SQLEXPRESS" /y >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start the service
echo [2/3] Starting SQL Server service...
net start "MSSQL$SQLEXPRESS"
timeout /t 5 /nobreak >nul

REM Verify connection
echo.
echo [3/3] Verifying TCP/IP connection...
powershell -Command "Test-NetConnection -ComputerName 127.0.0.1 -Port 1433 -WarningAction SilentlyContinue | Select-Object ComputerName, RemotePort, TcpTestSucceeded"

echo.
echo ========================================
echo Done! SQL Server should now be listening on port 1433
echo ========================================
echo.
pause
