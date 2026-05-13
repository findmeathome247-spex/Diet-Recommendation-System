#Requires -RunAsAdministrator
# This script enables TCP/IP for SQL Server Express and sets the port to 1433

Write-Host "Starting SQL Server TCP/IP configuration..." -ForegroundColor Cyan

# Stop the service
Write-Host "Stopping SQL Server service..." -ForegroundColor Yellow
$stopResult = net stop "MSSQL`$SQLEXPRESS" 2>&1
Write-Host $stopResult

Start-Sleep -Seconds 2

# Enable TCP/IP in registry
Write-Host "Enabling TCP/IP in registry..." -ForegroundColor Yellow
$regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQLServer\SuperSocketNetLib\Tcp"

# Set Enabled = 1
Set-ItemProperty -Path $regPath -Name "Enabled" -Value 1 -Force
Write-Host "✓ TCP/IP Enabled = 1" -ForegroundColor Green

# Set port to 1433 for IpAll (default IP)
$ipAllPath = "$regPath\IpAll"
Set-ItemProperty -Path $ipAllPath -Name "TcpPort" -Value "1433" -Force
Write-Host "✓ TCP Port set to 1433" -ForegroundColor Green

# Also check and set default instances
$ipPath = "$regPath\IpAll"
if (Test-Path $ipPath) {
    Set-ItemProperty -Path $ipPath -Name "TcpPort" -Value "1433" -Force
    Set-ItemProperty -Path $ipPath -Name "Tcp DynamicPorts" -Value "" -Force
    Write-Host "✓ Configured default IP" -ForegroundColor Green
}

# Start the service
Write-Host "Starting SQL Server service..." -ForegroundColor Yellow
$startResult = net start "MSSQL`$SQLEXPRESS" 2>&1
Write-Host $startResult

Start-Sleep -Seconds 5

# Test connection
Write-Host "Testing TCP/IP connection..." -ForegroundColor Yellow
$connTest = Test-NetConnection -ComputerName localhost -Port 1433 -WarningAction SilentlyContinue
if ($connTest.TcpTestSucceeded) {
    Write-Host "✓ TCP/IP Connection Successful!" -ForegroundColor Green
} else {
    Write-Host "✗ TCP/IP Connection Failed" -ForegroundColor Red
    Write-Host "Status: $($connTest.TcpTestSucceeded)" -ForegroundColor Red
}

Write-Host "`nConfiguration complete!" -ForegroundColor Cyan
