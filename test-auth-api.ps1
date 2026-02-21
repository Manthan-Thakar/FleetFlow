# API Testing Script for FleetFlow Authentication
# Run this in PowerShell: .\test-auth-api.ps1

Write-Host "=== FleetFlow Authentication API Tests ===" -ForegroundColor Cyan
Write-Host "Note: Signup happens client-side. Use lib/hooks/use-auth.ts for frontend." -ForegroundColor Gray
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3000"

# Test 1: Sign Up Validation
Write-Host "1. Testing Sign Up Validation..." -ForegroundColor Yellow
try {
    $signupBody = @{
        email = "testuser@company.com"
        password = "SecurePass123"
        displayName = "Test User"
        role = "manager"
        companyId = "company_001"
        phoneNumber = "+1234567890"
    } | ConvertTo-Json

    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" `
        -Method POST `
        -Body $signupBody `
        -ContentType "application/json"
    
    Write-Host "✅ Sign Up Validation Passed!" -ForegroundColor Green
    Write-Host "Note: Actual signup happens client-side via Firebase Auth" -ForegroundColor Gray
    Write-Host "Message: $($signupResponse.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Sign Up Validation Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Sign In (requires user created via Firebase Console or client signup)
Write-Host "2. Testing Sign In..." -ForegroundColor Yellow
Write-Host "Note: User must exist in Firebase Auth. Create via client signup or Firebase Console." -ForegroundColor Gray
try {
    $signinBody = @{
        email = "testuser@company.com"
        password = "SecurePass123"
    } | ConvertTo-Json

    $signinResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signin" `
        -Method POST `
        -Body $signinBody `
        -ContentType "application/json"
    
    Write-Host "✅ Sign In Success!" -ForegroundColor Green
    Write-Host "User: $($signinResponse.data.user.displayName)" -ForegroundColor Gray
    Write-Host "Role: $($signinResponse.data.user.role)" -ForegroundColor Gray
    Write-Host "Status: $($signinResponse.data.user.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Sign In Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Verify User
Write-Host "3. Testing Verify User..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method GET
    
    Write-Host "✅ Verify Success!" -ForegroundColor Green
    Write-Host "User: $($verifyResponse.data.user.displayName)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Verify Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Reset Password
Write-Host "4. Testing Reset Password..." -ForegroundColor Yellow
try {
    $resetBody = @{
        email = "testuser@company.com"
    } | ConvertTo-Json

    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/reset-password" `
        -Method POST `
        -Body $resetBody `
        -ContentType "application/json"
    
    Write-Host "✅ Reset Password Success!" -ForegroundColor Green
    Write-Host "Message: $($resetResponse.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Reset Password Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Sign Out
Write-Host "5. Testing Sign Out..." -ForegroundColor Yellow
try {
    $signoutResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signout" -Method POST
    
    Write-Host "✅ Sign Out Success!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Sign Out Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== Testing Notes ===" -ForegroundColor Cyan
Write-Host "Architecture: Simplified (Client-side Authentication)" -ForegroundColor Gray
Write-Host "1. Signup validation: ✅ Server validates input" -ForegroundColor Gray
Write-Host "2. User creation: Client-side (Firebase Auth + Firestore)" -ForegroundColor Gray
Write-Host "3. To test Sign In:" -ForegroundColor Gray
Write-Host "   - Use http://localhost:3000/signup to create a user via frontend" -ForegroundColor Gray
Write-Host "   - OR create user manually in Firebase Console" -ForegroundColor Gray
Write-Host "   - Then run this test again" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: See SIMPLIFIED_AUTH_SETUP.md" -ForegroundColor Gray
Write-Host ""
