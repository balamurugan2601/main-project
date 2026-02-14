# Approve All HQ Users Script
# Runs a MySQL command to set isApproved=1 for all users with role='hq'

$dbUser = "root"
$dbPass = "tiger123"
$dbName = "defcomm"

Write-Host "Approving all HQ users..." -ForegroundColor Cyan

try {
    mysql -u $dbUser -p$dbPass -D $dbName -e "UPDATE users SET isApproved=1 WHERE role='hq';"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully approved all HQ accounts." -ForegroundColor Green
        
        # Verify
        mysql -u $dbUser -p$dbPass -D $dbName -e "SELECT id, username, role, isApproved FROM users WHERE role='hq';"
    }
    else {
        Write-Host "❌ Failed to update database." -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
