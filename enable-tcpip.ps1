# Run this script as Administrator to enable TCP/IP for SQL Server Express
# SaveAs: enable-tcpip.ps1
# Then run: powershell -ExecutionPolicy Bypass -File enable-tcpip.ps1

param(
    [switch]$Elevate
)

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    if (-not $Elevate) {
        # Re-run as admin
        Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`" -Elevate"
        exit
    }
}

Write-Host "================================"
Write-Host "Enabling TCP/IP for SQL Server Express"
Write-Host "================================"
Write-Host ""

# Stop the service
Write-Host "[1/4] Stopping SQL Server service..."
try {
    Stop-Service -Name "MSSQL`$SQLEXPRESS" -Force -ErrorAction Stop
    Start-Sleep -Seconds 2
    Write-Host "  ✓ Service stopped"
} catch {
    Write-Host "  ! Service stop failed or already stopped: $_"
}

# Enable TCP/IP in registry
Write-Host "[2/4] Enabling TCP/IP in registry..."
try {
    $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"
    $tcpEnabledPath = $regPath
    Set-ItemProperty -Path $tcpEnabledPath -Name "Enabled" -Value 1 -Type DWord -Force -ErrorAction Stop
    
    # Also set the port
    $tcpPortPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IpAll"
    Set-ItemProperty -Path $tcpPortPath -Name "TcpPort" -Value "1433" -Type String -Force -ErrorAction Stop
    
    Write-Host "  ✓ TCP/IP enabled in registry"
    Write-Host "  ✓ TCP port set to 1433"
} catch {
    Write-Host "  ✗ Registry modification failed: $_"
    Write-Host "  Try running this script as Administrator"
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the service
Write-Host "[3/4] Starting SQL Server service..."
try {
    Start-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "  ✓ Service started"
} catch {
    Write-Host "  ✗ Service start failed: $_"
    Read-Host "Press Enter to exit"
    exit 1
}

# Verify TCP/IP is enabled
Write-Host "[4/4] Verifying TCP/IP is enabled..."
try {
    $tcpEnabled = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp" -Name "Enabled" -ErrorAction Stop | Select-Object -ExpandProperty Enabled
    $tcpPort = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp\IpAll" -Name "TcpPort" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty TcpPort
    
    if ($tcpEnabled -eq 1) {
        Write-Host "  ✓ TCP/IP is ENABLED"
        Write-Host "  ✓ TCP port: $tcpPort"
    } else {
        Write-Host "  ✗ TCP/IP is still disabled!"
    }
} catch {
    Write-Host "  ! Could not verify: $_"
}

Write-Host ""
Write-Host "================================"
Write-Host "Done! TCP/IP should now be enabled"
Write-Host "================================"
Write-Host ""
Write-Host "You can now restart your backend server."
Write-Host ""

Read-Host "Press Enter to exit"
