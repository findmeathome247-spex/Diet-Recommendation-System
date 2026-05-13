@echo off
REM Enable TCP/IP for SQL Server Express - Run as Administrator
REM This script modifies the registry to enable TCP/IP and restarts the service

REM Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting admin privileges...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

echo.
echo ============================================
echo Enabling TCP/IP for SQL Server Express
echo ============================================
echo.

REM Enable TCP/IP in registry
echo [1/3] Enabling TCP/IP in registry...
reg add "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled /t REG_DWORD /d 1 /f
if %errorLevel% equ 0 (
    echo [SUCCESS] TCP/IP registry setting updated!
) else (
    echo [ERROR] Failed to update registry. Make sure you run this as Administrator.
    pause
    exit /b 1
)

echo.
echo [2/3] Restarting SQL Server (SQLEXPRESS) service...
net stop "MSSQL$SQLEXPRESS" /y
timeout /t 2 /nobreak
net start "MSSQL$SQLEXPRESS"
timeout /t 3 /nobreak

echo.
echo [3/3] Verifying TCP/IP is enabled...
reg query "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled
if %errorLevel% equ 0 (
    echo.
    echo ============================================
    echo SUCCESS! TCP/IP is now ENABLED!
    echo ============================================
    echo.
    echo Your database connection should now work.
    echo You can close this window.
) else (
    echo.
    echo ERROR: Could not verify TCP/IP setting
)

pause
