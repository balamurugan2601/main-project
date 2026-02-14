# Test Script - HQ Group Management Verification
# Creates a group and adds a member via API

$baseUrl = "http://localhost:5000/api"
$hqUser = "hqadmin"
$hqPass = "Test@1234"
$targetUser = "" # Will be populated dynamically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HQ Group Management API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login as HQ
Write-Host "`n--- 1. Logging in as HQ ($hqUser) ---" -ForegroundColor Yellow
$loginBody = @{ username = $hqUser; password = $hqPass } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session
Write-Host "✅ Login Successful. Role: $($loginRes.role)" -ForegroundColor Green

# 2. Find target user (first non-hq)
Write-Host "`n--- 2. Finding Target User ---" -ForegroundColor Yellow
$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -WebSession $session
$target = $users | Where-Object { $_.role -eq "user" } | Select-Object -First 1
if (!$target) {
    Write-Host "❌ No non-HQ user found in database." -ForegroundColor Red
    exit 1
}
$targetUserId = $target._id
$targetUsername = $target.username
Write-Host "✅ Found Target User '$targetUsername' ID: $targetUserId" -ForegroundColor Green

# 3. Create Group
Write-Host "`n--- 3. Creating New Group ---" -ForegroundColor Yellow
$groupName = "Alpha Squad $(Get-Random)"
$createGroupBody = @{ name = $groupName; members = @() } | ConvertTo-Json
$groupRes = Invoke-RestMethod -Uri "$baseUrl/groups" -Method POST -Body $createGroupBody -ContentType "application/json" -WebSession $session
$groupId = $groupRes._id
Write-Host "✅ Group Created: $groupName (ID: $groupId)" -ForegroundColor Green

# 4. Add Member
Write-Host "`n--- 4. Adding Member to Group ---" -ForegroundColor Yellow
$addMemberBody = @{ userId = $targetUserId } | ConvertTo-Json
$addRes = Invoke-RestMethod -Uri "$baseUrl/groups/$groupId/members" -Method PUT -Body $addMemberBody -ContentType "application/json" -WebSession $session

# Check if member is in group
if ($addRes.members | Where-Object { $_._id -eq $targetUserId }) {
    Write-Host "✅ Member '$targetUser' successfully added to group." -ForegroundColor Green
}
else {
    Write-Host "❌ Member addition failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESULT: ALL Group Management API tests PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
