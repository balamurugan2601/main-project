# Login & Registration Test Script (Cookie-based Auth)
# Tests the full authentication flow including registration, login, and token validation using Cookies

$baseUrl = "http://localhost:5000"
$uniqueId = Get-Random

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Authentication Flow Test (Cookie Support)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Session storage for cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Test Backend Connectivity
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
    exit 1
}

# 2. Test Registration
Write-Host "`n--- 2. Testing Registration ---" -ForegroundColor Yellow
$username = "test_cookie_$uniqueId"
$email = "cookie_$uniqueId@example.com"
$password = "Test@1234"

Write-Host "Registering: $username" -ForegroundColor Gray

$regBody = @{
    username = $username
    email    = $email
    password = $password
    role     = "user"
} | ConvertTo-Json

try {
    # -WebSession $session stores cookies (jwt) automatically
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -WebSession $session
    
    if ($regResponse._id) {
        Write-Host "✅ Registration Successful" -ForegroundColor Green
        Write-Host "   Cookies received: $($session.Cookies.Count)" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Registration Failed" -ForegroundColor Red
        Write-Host "Response: $($regResponse | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Test Login (if needed, registration usually logs in)
# But let's logout and login to be sure
Write-Host "`n--- 3. Testing Logout & Login ---" -ForegroundColor Yellow

# Logout
Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" -Method POST -WebSession $session
$session.Cookies = New-Object System.Net.CookieContainer # Clear cookies manually to be safe

# Login
$loginBody = @{
    username = $username # Backend uses username not email? Controller says: const { username, password } = req.body;
    password = $password
} | ConvertTo-Json

# Wait, Controller uses username for login?
# authController.js: const { username, password } = req.body;
# But Services/api.js login sends { username, password }.
# Let's verify if my previous script used email.
# Previous script used email. That might be another reason it failed!

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -WebSession $session
    
    if ($loginResponse._id) {
        Write-Host "✅ Login Successful" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.username)" -ForegroundColor Gray
        
        # Verify cookie exists
        $cookies = $session.Cookies.GetCookies($baseUrl)
        $jwtCookie = $cookies | Where-Object { $_.Name -eq "jwt" }
        if ($jwtCookie) {
            Write-Host "✅ JWT Cookie found" -ForegroundColor Green
        }
        else {
            Write-Host "❌ JWT Cookie NOT found" -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Login Failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Test Token Validation (Protected Route)
Write-Host "`n--- 4. Testing Protected Route ---" -ForegroundColor Yellow
try {
    # Browser automatically sends cookies. Invoke-RestMethod uses WebSession.
    $checkResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/check" -Method GET -WebSession $session
    
    if ($checkResponse.username -eq $username) {
        Write-Host "✅ Protected Route Access Successful" -ForegroundColor Green
        Write-Host "   Authenticated as: $($checkResponse.username)" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Protected Route Failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Protected Route Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
