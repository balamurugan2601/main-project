# Login & Registration Test Script
# Tests the full authentication flow including registration, login, and token validation

$baseUrl = "http://localhost:5000"
$uniqueId = Get-Random

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Authentication Flow Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Test Database Connection
Write-Host "`n--- 1. Testing Backend Status ---" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    if ($health.status -eq "OK") {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    }
    else {
        throw "Backend reported unhealthy status"
    }
}
catch {
    Write-Host "❌ Failed to connect to backend: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Ensure backend is running on port 5000 with correct DB credentials" -ForegroundColor Gray
    exit 1
}

# 2. Test Registration
Write-Host "`n--- 2. Testing Registration ---" -ForegroundColor Yellow
$username = "test_user_$uniqueId"
$email = "test_$uniqueId@example.com"
$password = "Test@1234"

Write-Host "Attempting to register: $username / $email" -ForegroundColor Gray

$regBody = @{
    username = $username
    email    = $email
    password = $password
    role     = "user"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $regBody -ContentType "application/json"
    
    if ($regResponse.success -or $regResponse.token) {
        Write-Host "✅ Registration Successful" -ForegroundColor Green
        Write-Host "   User ID: $($regResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Token received: Yes" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Registration Failed: Unexpected response format" -ForegroundColor Red
        Write-Host ($regResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray 
    }
}
catch {
    Write-Host "❌ Registration Failed" -ForegroundColor Red
    $errorDetails = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorDetails)
    Write-Host "   Error: $($reader.ReadToEnd())" -ForegroundColor Red
}

# 3. Test Login
Write-Host "`n--- 3. Testing Login ---" -ForegroundColor Yellow
$loginBody = @{
    email    = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        Write-Host "✅ Login Successful" -ForegroundColor Green
        $token = $loginResponse.token
        Write-Host "   JWT Token received (starts with): $($token.Substring(0, 15))..." -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Login Failed: No token received" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Login Failed" -ForegroundColor Red
    $errorDetails = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorDetails)
    Write-Host "   Error: $($reader.ReadToEnd())" -ForegroundColor Red
    exit 1
}

# 4. Test Token Validation
Write-Host "`n--- 4. Testing Token Validation ---" -ForegroundColor Yellow
if ($token) {
    try {
        $headers = @{ "Authorization" = "Bearer $token" }
        $checkResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/check" -Method GET -Headers $headers
        
        if ($checkResponse.user.email -eq $email) {
            Write-Host "✅ Token Validation Successful" -ForegroundColor Green
            Write-Host "   Authenticated as: $($checkResponse.user.username)" -ForegroundColor Gray
            Write-Host "   Role: $($checkResponse.user.role)" -ForegroundColor Gray
        }
        else {
            Write-Host "❌ Token Validation Failed: User details mismatch" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Token Validation Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Test Invalid Login
Write-Host "`n--- 5. Testing Invalid Credentials ---" -ForegroundColor Yellow
$invalidBody = @{
    email    = $email
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $invalidBody -ContentType "application/json"
    Write-Host "❌ Security Flaw: Allowed login with wrong password" -ForegroundColor Red
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 400) {
        Write-Host "✅ Security Check Passed: Rejected wrong password (Status: $statusCode)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Unexpected Error: Status $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
