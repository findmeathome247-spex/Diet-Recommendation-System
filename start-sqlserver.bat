@echo off
REM Start SQL Server Express with admin check

net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process '%~0' -Verb RunAs" >nul
    exit /b
)

echo Starting SQL Server (SQLEXPRESS)...
net start "MSSQL$SQLEXPRESS"
timeout /t 5 /nobreak

echo SQL Server Status:
sc query "MSSQL$SQLEXPRESS" | find /i "RUNNING"

echo.
echo Listening ports check:
netstat -ano | findstr :1433

echo.
echo Done. You can close this window.
pause
