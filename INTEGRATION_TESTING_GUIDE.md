# DefComm Integration Testing Guide

## Overview
This guide provides comprehensive testing procedures for the DefComm secure communication platform, covering frontend-backend integration, JWT authentication, alerts, approvals, group management, and user authentication.

## Server Status
- **Frontend**: http://localhost:5173 (Vite + React)
- **Backend**: http://localhost:5000 (Express + MongoDB)
- **Database**: MongoDB on localhost:27017

---

## Testing Checklist

### ✅ 1. User Authentication & JWT Token Validation

#### 1.1 User Registration
**Manual Test (Browser)**:
1. Navigate to http://localhost:5173
2. Click "Register" or navigate to `/register`
3. Fill in registration form:
   - Username: `testuser1`
   - Email: `testuser1@test.com`
   - Password: `Test@1234`
   - Role: `user`
4. Submit form
5. **Expected**: User created with `approved: false` status
6. **Check**: Browser DevTools → Application → Local Storage → JWT token stored

**API Test (PowerShell)**:
```powershell
$body = @{
    username = "testuser1"
    email = "testuser1@test.com"
    password = "Test@1234"
    role = "user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser1",
    "email": "testuser1@test.com",
    "role": "user",
    "approved": false
  }
}
```

#### 1.2 User Login & JWT Validation
**Manual Test**:
1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: `testuser1@test.com`
   - Password: `Test@1234`
3. Submit
4. **Check DevTools**:
   - Network tab → Check `/api/auth/login` response includes JWT token
   - Application tab → Local Storage → Verify token is stored
   - Console → No authentication errors

**API Test**:
```powershell
$body = @{
    email = "testuser1@test.com"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "JWT Token: $token"
```

#### 1.3 JWT Token Validation
**Test Protected Route**:
```powershell
# Use token from login
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/check" -Method GET -Headers $headers
```

**Expected Response**:
```json
{
  "user": {
    "id": "...",
    "username": "testuser1",
    "role": "user",
    "approved": false
  }
}
```

---

### ✅ 2. User Approval System (HQ Role)

#### 2.1 Create HQ User
**API Test**:
```powershell
$body = @{
    username = "hqadmin"
    email = "hq@defcomm.com"
    password = "HQ@Admin123"
    role = "hq"
} | ConvertTo-Json

$hqResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
$hqToken = $hqResponse.token
```

#### 2.2 View Pending Users
**Manual Test**:
1. Login as HQ user (hq@defcomm.com)
2. Navigate to `/approvals` page
3. **Expected**: See list of pending users (including testuser1)

**API Test**:
```powershell
$hqHeaders = @{
    "Authorization" = "Bearer $hqToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/users/pending" -Method GET -Headers $hqHeaders
```

#### 2.3 Approve User
**Manual Test**:
1. On `/approvals` page, click "Approve" button for testuser1
2. **Expected**: User status changes to approved
3. User can now access chat features

**API Test**:
```powershell
# Get user ID from pending users list
$pendingUsers = Invoke-RestMethod -Uri "http://localhost:5000/api/users/pending" -Method GET -Headers $hqHeaders
$userId = $pendingUsers[0]._id

$approveBody = @{
    approved = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/approve" -Method PUT -Body $approveBody -ContentType "application/json" -Headers $hqHeaders
```

#### 2.4 Reject User
**API Test**:
```powershell
$rejectBody = @{
    approved = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/approve" -Method PUT -Body $rejectBody -ContentType "application/json" -Headers $hqHeaders
```

---

### ✅ 3. Group Creation & Management

#### 3.1 Create Group (HQ Only)
**Manual Test**:
1. Login as HQ user
2. Navigate to `/groups` or dashboard
3. Click "Create Group"
4. Enter:
   - Name: `Alpha Team`
   - Description: `Primary operations team`
5. Submit
6. **Expected**: Group created successfully

**API Test**:
```powershell
$groupBody = @{
    name = "Alpha Team"
    description = "Primary operations team"
} | ConvertTo-Json

$group = Invoke-RestMethod -Uri "http://localhost:5000/api/groups" -Method POST -Body $groupBody -ContentType "application/json" -Headers $hqHeaders
$groupId = $group._id
```

#### 3.2 Add Members to Group
**API Test**:
```powershell
$memberBody = @{
    userId = $userId
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/groups/$groupId/members" -Method PUT -Body $memberBody -ContentType "application/json" -Headers $hqHeaders
```

#### 3.3 View Groups
**Manual Test**:
1. Login as approved user
2. Navigate to `/groups`
3. **Expected**: See list of groups user is member of

**API Test**:
```powershell
$userHeaders = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/groups" -Method GET -Headers $userHeaders
```

---

### ✅ 4. Alert System (Send & Receive)

#### 4.1 Send Regular Message
**Manual Test**:
1. Login as approved user
2. Navigate to `/chat`
3. Select group (Alpha Team)
4. Type message: `Hello team, this is a test message`
5. Send
6. **Expected**: Message appears in chat (encrypted in backend, decrypted in frontend)

**API Test**:
```powershell
$messageBody = @{
    encryptedText = "U2FsdGVkX1..." # Encrypted message
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/groups/$groupId/messages" -Method POST -Body $messageBody -ContentType "application/json" -Headers $userHeaders
```

#### 4.2 Send Alert-Triggering Message
**Manual Test**:
1. In chat, send message containing alert keywords:
   - `URGENT: Security breach detected`
   - `CRITICAL: System failure`
   - `ATTACK: Incoming threat`
2. **Expected**: Message sent successfully

**Check Alert Detection**:
1. Login as HQ user
2. Navigate to `/dashboard`
3. **Expected**: Alert appears in "Alert Detection" section
4. Alert should show:
   - Message content (decrypted)
   - Sender
   - Group
   - Timestamp
   - Red alert styling

#### 4.3 Receive Messages
**Manual Test**:
1. Open chat in one browser window as User A
2. Open chat in another browser/incognito as User B (same group)
3. Send message from User A
4. **Expected**: User B receives message in real-time (if WebSocket enabled) or on refresh

**API Test - Get Messages**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/groups/$groupId/messages" -Method GET -Headers $userHeaders
```

---

### ✅ 5. HQ Dashboard Statistics

**Manual Test**:
1. Login as HQ user
2. Navigate to `/dashboard`
3. **Verify Dashboard Shows**:
   - Total Users count
   - Approved Users count
   - Pending Users count
   - Total Groups count
   - Total Messages count
   - Recent Activity (metadata only)
   - Alert Detection (messages with keywords)

**API Test - Get Stats**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Method GET -Headers $hqHeaders
```

**Expected Response**:
```json
{
  "totalUsers": 2,
  "approvedUsers": 1,
  "pendingUsers": 1,
  "totalGroups": 1,
  "totalMessages": 5
}
```

**API Test - Get Recent Messages**:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/recent-messages?limit=10" -Method GET -Headers $hqHeaders
```

---

## Complete Integration Test Flow

### Scenario: End-to-End User Journey

1. **User Registration**
   - Register new user → JWT token received
   - User status: `approved: false`

2. **HQ Approval**
   - HQ logs in
   - Views pending users
   - Approves user
   - User status: `approved: true`

3. **Group Creation**
   - HQ creates group "Alpha Team"
   - HQ adds approved user to group

4. **User Authentication**
   - User logs in with JWT
   - Token validated on protected routes
   - User redirected to `/chat`

5. **Messaging**
   - User sends regular message
   - Message encrypted before storage
   - Message decrypted on display

6. **Alert Triggering**
   - User sends message with keyword "URGENT"
   - HQ dashboard detects alert
   - Alert displayed in red card

7. **HQ Monitoring**
   - HQ views dashboard stats
   - HQ sees recent activity
   - HQ monitors alerts

---

## Automated Test Script

See `test-integration.ps1` for automated PowerShell test script.

---

## Common Issues & Troubleshooting

### Issue: JWT Token Not Stored
- **Check**: Browser DevTools → Application → Local Storage
- **Fix**: Ensure frontend stores token after login/register

### Issue: 401 Unauthorized
- **Check**: Token is included in Authorization header
- **Fix**: `Authorization: Bearer <token>`

### Issue: User Not Approved
- **Check**: User `approved` field in database
- **Fix**: HQ must approve user via `/api/users/:id/approve`

### Issue: Messages Not Appearing
- **Check**: User is member of selected group
- **Check**: Messages are being decrypted correctly
- **Fix**: Verify encryption key matches on frontend/backend

### Issue: Alerts Not Detected
- **Check**: Message contains keywords: "attack", "urgent", "critical"
- **Check**: HQ dashboard is decrypting messages
- **Fix**: Verify alert detection logic in HQ dashboard component

---

## Security Validation

### JWT Token Security
- ✅ Token expires after 30 days
- ✅ Token includes user ID and role
- ✅ Protected routes validate token
- ✅ Token stored securely in localStorage

### Encryption Validation
- ✅ Messages encrypted before storage
- ✅ AES encryption with secret key
- ✅ Decryption only on authorized access

### Role-Based Access Control
- ✅ User role can only access `/chat` and `/groups`
- ✅ HQ role can access `/dashboard` and `/approvals`
- ✅ Protected routes enforce role validation

---

## Test Data

### Test Users
```json
{
  "user1": {
    "username": "testuser1",
    "email": "testuser1@test.com",
    "password": "Test@1234",
    "role": "user"
  },
  "user2": {
    "username": "testuser2",
    "email": "testuser2@test.com",
    "password": "Test@1234",
    "role": "user"
  },
  "hq": {
    "username": "hqadmin",
    "email": "hq@defcomm.com",
    "password": "HQ@Admin123",
    "role": "hq"
  }
}
```

### Test Groups
```json
{
  "group1": {
    "name": "Alpha Team",
    "description": "Primary operations team"
  },
  "group2": {
    "name": "Command Center",
    "description": "Central command operations"
  }
}
```

### Test Messages
```json
{
  "regular": "Hello team, this is a test message",
  "alert1": "URGENT: Security breach detected",
  "alert2": "CRITICAL: System failure imminent",
  "alert3": "ATTACK: Incoming threat from sector 7"
}
```

---

## Next Steps

1. Open browser to http://localhost:5173
2. Follow manual testing steps above
3. Run automated test script for API validation
4. Verify all features work end-to-end
5. Check browser console for errors
6. Monitor network tab for API calls
7. Validate JWT tokens in requests

---

## Success Criteria

- ✅ Users can register and login
- ✅ JWT tokens are generated and validated
- ✅ HQ can approve/reject users
- ✅ Groups can be created and managed
- ✅ Messages are sent and received
- ✅ Messages are encrypted/decrypted correctly
- ✅ Alerts are detected and displayed
- ✅ Dashboard shows accurate statistics
- ✅ Role-based access control works
- ✅ No console errors
- ✅ All API endpoints respond correctly
