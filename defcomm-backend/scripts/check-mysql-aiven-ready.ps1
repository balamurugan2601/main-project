# ============================================================================
# Aiven Migration: MySQL Configuration Check (PowerShell)
# ============================================================================
# This script checks if your local MySQL is ready for Aiven migration
# Run this before attempting migration to verify prerequisites
# ============================================================================

Write-Host "=== Aiven Migration: MySQL Configuration Checker ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL service is running
Write-Host "Checking MySQL service status..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name MySQL* -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -eq 'Running') {
        Write-Host "[OK] MySQL service is running" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] MySQL service is not running. Start it with: Start-Service $($mysqlService.Name)" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "[FAIL] MySQL service not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Find my.ini configuration file
Write-Host "Locating MySQL configuration file..." -ForegroundColor Yellow
$configPaths = @(
    "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini",
    "C:\Program Files\MySQL\MySQL Server 8.0\my.ini",
    "C:\ProgramData\MySQL\MySQL Server 5.7\my.ini"
)

$foundConfig = $null
foreach ($path in $configPaths) {
    if (Test-Path $path) {
        $foundConfig = $path
        Write-Host "[OK] Found config file: $path" -ForegroundColor Green
        break
    }
}

if (-not $foundConfig) {
    Write-Host "[WARN] Could not find my.ini file automatically" -ForegroundColor Yellow
    Write-Host "  Please locate it manually (common locations shown above)" -ForegroundColor Gray
}
else {
    # Check if GTID settings are present
    $configContent = Get-Content $foundConfig -Raw
    
    Write-Host ""
    Write-Host "Checking configuration settings..." -ForegroundColor Yellow
    
    if ($configContent -match "gtid_mode\s*=\s*ON") {
        Write-Host "[OK] gtid_mode=ON found in config" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] gtid_mode=ON not found - add it to my.ini" -ForegroundColor Red
    }
    
    if ($configContent -match "enforce_gtid_consistency\s*=\s*ON") {
        Write-Host "[OK] enforce_gtid_consistency=ON found" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] enforce_gtid_consistency=ON not found - add it to my.ini" -ForegroundColor Red
    }
    
    if ($configContent -match "log_bin") {
        Write-Host "[OK] log_bin found in config" -ForegroundColor Green
    }
    else {
        Write-Host "[FAIL] log_bin not found - add it to my.ini" -ForegroundColor Red
    }
}

Write-Host ""

# Test MySQL connection and run configuration checks
Write-Host "Testing MySQL connection..." -ForegroundColor Yellow
$env:MYSQL_PWD = "tiger123"  # From .env file

try {
    # Test basic connection first
    $connectionTest = & mysql -u root -e "SELECT 1;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] MySQL connection successful" -ForegroundColor Green
        Write-Host ""
        Write-Host "Current MySQL Configuration:" -ForegroundColor Cyan
        
        # Check GTID mode
        $gtidMode = & mysql -u root -e "SHOW VARIABLES LIKE 'gtid_mode';" 2>&1
        Write-Host $gtidMode
        
        if ($gtidMode -match "gtid_mode.*ON") {
            Write-Host "[OK] GTID is enabled" -ForegroundColor Green
        }
        else {
            Write-Host "[FAIL] GTID is NOT enabled - restart MySQL after updating my.ini" -ForegroundColor Red
        }
        
        # Check binary logging
        $logBin = & mysql -u root -e "SHOW VARIABLES LIKE 'log_bin';" 2>&1
        Write-Host $logBin
        
        if ($logBin -match "log_bin.*(ON|1)") {
            Write-Host "[OK] Binary logging is enabled" -ForegroundColor Green
        }
        else {
            Write-Host "[FAIL] Binary logging is NOT enabled - restart MySQL after updating my.ini" -ForegroundColor Red
        }
        
        # Check server_id
        $serverId = & mysql -u root -e "SHOW VARIABLES LIKE 'server_id';" 2>&1
        Write-Host $serverId
        
    }
    else {
        Write-Host "[FAIL] MySQL connection failed" -ForegroundColor Red
        Write-Host "Error: $connectionTest" -ForegroundColor Red
        Write-Host "Check your password in .env file (currently using: tiger123)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[FAIL] Could not execute MySQL command" -ForegroundColor Red
    Write-Host "Make sure mysql.exe is in your PATH" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
}

Write-Host ""

# Check firewall
Write-Host "Checking Windows Firewall for MySQL..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "MySQL*" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "[OK] MySQL firewall rule exists" -ForegroundColor Green
}
else {
    Write-Host "[WARN] No MySQL firewall rule found" -ForegroundColor Yellow
    Write-Host "  For Aiven migration, you may need to allow port 3306" -ForegroundColor Gray
    Write-Host "  Or use ngrok as alternative (see AIVEN_MIGRATION_GUIDE.md)" -ForegroundColor Gray
}

Write-Host ""

# Get public IP
Write-Host "Getting your public IP address..." -ForegroundColor Yellow
try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org?format=text" -TimeoutSec 5
    Write-Host "[OK] Your public IP: $publicIP" -ForegroundColor Green
    Write-Host "  (Use this as hostname in Aiven migration wizard)" -ForegroundColor Gray
}
catch {
    Write-Host "[WARN] Could not retrieve public IP" -ForegroundColor Yellow
    Write-Host "  Get it manually from: https://whatismyip.com" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Configuration Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If any checks failed, update my.ini and restart MySQL" -ForegroundColor White
Write-Host "2. Run: mysql -u root -p < scripts/prepare-mysql-for-aiven.sql" -ForegroundColor White
Write-Host "3. Follow AIVEN_MIGRATION_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host ""
