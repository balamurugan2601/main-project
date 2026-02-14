# Test Script - Role Selection Verification
# Registers a user with 'hq' role and verifies it

$baseUrl = "http://localhost:5000"
$uniqueId = Get-Random
$username = "test_hq_$uniqueId"
$email = "hq_$uniqueId@example.com"
$password = "Test@1234"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Role Selection Verification Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Session storage
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Register as HQ
Write-Host "`n--- 1. Registering as HQ ---" -ForegroundColor Yellow
$regBody = @{
    username = $username
    email    = $email
    password = $password
    role     = "hq" # Explicitly requesting HQ role
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -WebSession $session
    
    if ($regResponse.role -eq "hq") {
        Write-Host "✅ Registration Successful with Role: HQ" -ForegroundColor Green
        Write-Host "   User: $($regResponse.username)" -ForegroundColor Gray
        Write-Host "   Role: $($regResponse.role)" -ForegroundColor Gray
        Write-Host "   Approved: $($regResponse.isApproved)" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Registration Failed to set HQ role" -ForegroundColor Red
        Write-Host "   Received Role: $($regResponse.role)" -ForegroundColor Red
    }

}
catch {
    Write-Host "❌ Registration Request Failed: $($_.Exception.Message)" -ForegroundColor Red
    # Print response body if available
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "   Response Body: $body" -ForegroundColor Red
    }
    catch {}
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
