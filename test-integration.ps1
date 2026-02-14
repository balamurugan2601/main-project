# DefComm Integration Test Script
# PowerShell script to test all API endpoints and integration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DefComm Integration Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$frontendUrl = "http://localhost:5173"

# Test results tracking
$testResults = @()

function Test-Endpoint {
    param(
        [string]$TestName,
        [scriptblock]$TestBlock
    )
    
    Write-Host "Testing: $TestName" -ForegroundColor Yellow
    try {
        $result = & $TestBlock
        Write-Host "✅ PASSED: $TestName" -ForegroundColor Green
        $testResults += @{Name = $TestName; Status = "PASSED"; Result = $result}
        return $result
    } catch {
        Write-Host "❌ FAILED: $TestName" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        $testResults += @{Name = $TestName; Status = "FAILED"; Error = $_.Exception.Message}
        return $null
    }
    Write-Host ""
}

# Test 1: Server Health Check
Write-Host "`n--- 1. Server Health Check ---" -ForegroundColor Cyan
Test-Endpoint "Backend Server Health" {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    if ($response.status -ne "OK") {
        throw "Server not healthy"
    }
    return $response
}

# Test 2: User Registration
Write-Host "`n--- 2. User Registration & Authentication ---" -ForegroundColor Cyan

$testUser1 = Test-Endpoint "Register Test User 1" {
    $body = @{
        username = "testuser1"
        email = "testuser1@test.com"
        password = "Test@1234"
        role = "user"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    return $response
}

$testUser2 = Test-Endpoint "Register Test User 2" {
    $body = @{
        username = "testuser2"
        email = "testuser2@test.com"
        password = "Test@1234"
        role = "user"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    return $response
}

$hqUser = Test-Endpoint "Register HQ Admin User" {
    $body = @{
        username = "hqadmin"
        email = "hq@defcomm.com"
        password = "HQ@Admin123"
        role = "hq"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    return $response
}

# Extract tokens
$userToken = $testUser1.token
$hqToken = $hqUser.token

Write-Host "User Token: $($userToken.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "HQ Token: $($hqToken.Substring(0, 20))..." -ForegroundColor Gray

# Test 3: JWT Token Validation
Write-Host "`n--- 3. JWT Token Validation ---" -ForegroundColor Cyan

Test-Endpoint "Validate User JWT Token" {
    $headers = @{
        "Authorization" = "Bearer $userToken"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/check" -Method GET -Headers $headers
    if ($response.user.role -ne "user") {
        throw "Invalid user role"
    }
    return $response
}

Test-Endpoint "Validate HQ JWT Token" {
    $headers = @{
        "Authorization" = "Bearer $hqToken"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/check" -Method GET -Headers $headers
    if ($response.user.role -ne "hq") {
        throw "Invalid HQ role"
    }
    return $response
}

# Test 4: User Login
Write-Host "`n--- 4. User Login ---" -ForegroundColor Cyan

Test-Endpoint "Login Test User 1" {
    $body = @{
        email = "testuser1@test.com"
        password = "Test@1234"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    if (-not $response.token) {
        throw "No token received"
    }
    return $response
}

# Test 5: User Approval System
Write-Host "`n--- 5. User Approval System ---" -ForegroundColor Cyan

$hqHeaders = @{
    "Authorization" = "Bearer $hqToken"
}

$pendingUsers = Test-Endpoint "Get Pending Users (HQ)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/pending" -Method GET -Headers $hqHeaders
    return $response
}

$allUsers = Test-Endpoint "Get All Users (HQ)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method GET -Headers $hqHeaders
    return $response
}

if ($allUsers -and $allUsers.Count -gt 0) {
    $userId = $allUsers[0]._id
    
    Test-Endpoint "Approve User" {
        $body = @{
            approved = $true
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users/$userId/approve" -Method PUT -Body $body -ContentType "application/json" -Headers $hqHeaders
        return $response
    }
}

# Test 6: Group Creation
Write-Host "`n--- 6. Group Creation & Management ---" -ForegroundColor Cyan

$group1 = Test-Endpoint "Create Group 'Alpha Team' (HQ)" {
    $body = @{
        name = "Alpha Team"
        description = "Primary operations team"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups" -Method POST -Body $body -ContentType "application/json" -Headers $hqHeaders
    return $response
}

$group2 = Test-Endpoint "Create Group 'Command Center' (HQ)" {
    $body = @{
        name = "Command Center"
        description = "Central command operations"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups" -Method POST -Body $body -ContentType "application/json" -Headers $hqHeaders
    return $response
}

$groupId = $group1._id

Test-Endpoint "Get All Groups" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups" -Method GET -Headers $hqHeaders
    if ($response.Count -lt 2) {
        throw "Expected at least 2 groups"
    }
    return $response
}

Test-Endpoint "Get Group By ID" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId" -Method GET -Headers $hqHeaders
    if ($response.name -ne "Alpha Team") {
        throw "Group name mismatch"
    }
    return $response
}

# Test 7: Add Members to Group
Write-Host "`n--- 7. Add Members to Group ---" -ForegroundColor Cyan

if ($allUsers -and $allUsers.Count -gt 0) {
    $userId = $allUsers[0]._id
    
    Test-Endpoint "Add User to Group" {
        $body = @{
            userId = $userId
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId/members" -Method PUT -Body $body -ContentType "application/json" -Headers $hqHeaders
        return $response
    }
}

# Test 8: Send Messages
Write-Host "`n--- 8. Send & Receive Messages ---" -ForegroundColor Cyan

$userHeaders = @{
    "Authorization" = "Bearer $userToken"
}

# Note: In real implementation, messages should be encrypted
# For testing, we'll use plain text or mock encrypted text
Test-Endpoint "Send Regular Message" {
    $body = @{
        encryptedText = "U2FsdGVkX1+test_encrypted_message_hello_team"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId/messages" -Method POST -Body $body -ContentType "application/json" -Headers $userHeaders
    return $response
}

Test-Endpoint "Send Alert Message (URGENT)" {
    $body = @{
        encryptedText = "U2FsdGVkX1+urgent_security_breach_detected"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId/messages" -Method POST -Body $body -ContentType "application/json" -Headers $userHeaders
    return $response
}

Test-Endpoint "Send Alert Message (CRITICAL)" {
    $body = @{
        encryptedText = "U2FsdGVkX1+critical_system_failure"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId/messages" -Method POST -Body $body -ContentType "application/json" -Headers $userHeaders
    return $response
}

Test-Endpoint "Get Messages from Group" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/groups/$groupId/messages" -Method GET -Headers $userHeaders
    if ($response.Count -lt 3) {
        throw "Expected at least 3 messages"
    }
    return $response
}

# Test 9: HQ Dashboard Stats
Write-Host "`n--- 9. HQ Dashboard Statistics ---" -ForegroundColor Cyan

$stats = Test-Endpoint "Get Dashboard Stats (HQ)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/stats" -Method GET -Headers $hqHeaders
    return $response
}

if ($stats) {
    Write-Host "Dashboard Statistics:" -ForegroundColor Cyan
    Write-Host "  Total Users: $($stats.totalUsers)" -ForegroundColor White
    Write-Host "  Approved Users: $($stats.approvedUsers)" -ForegroundColor White
    Write-Host "  Pending Users: $($stats.pendingUsers)" -ForegroundColor White
    Write-Host "  Total Groups: $($stats.totalGroups)" -ForegroundColor White
    Write-Host "  Total Messages: $($stats.totalMessages)" -ForegroundColor White
}

Test-Endpoint "Get Recent Messages (HQ)" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/admin/recent-messages?limit=10" -Method GET -Headers $hqHeaders
    return $response
}

# Test 10: Logout
Write-Host "`n--- 10. User Logout ---" -ForegroundColor Cyan

Test-Endpoint "Logout User" {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method POST
    return $response
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Frontend Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Open your browser to: $frontendUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to $frontendUrl" -ForegroundColor White
Write-Host "2. Login with:" -ForegroundColor White
Write-Host "   - Email: testuser1@test.com" -ForegroundColor Gray
Write-Host "   - Password: Test@1234" -ForegroundColor Gray
Write-Host "3. Check JWT token in DevTools (Application > Local Storage)" -ForegroundColor White
Write-Host "4. Navigate to /chat and send messages" -ForegroundColor White
Write-Host "5. Send alert keywords: URGENT, CRITICAL, ATTACK" -ForegroundColor White
Write-Host "6. Login as HQ (hq@defcomm.com / HQ@Admin123)" -ForegroundColor White
Write-Host "7. Check /dashboard for stats and alerts" -ForegroundColor White
Write-Host "8. Check /approvals for pending users" -ForegroundColor White
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ All API tests passed! Backend integration is working correctly." -ForegroundColor Green
    Write-Host "✅ Proceed with manual frontend testing in browser." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
