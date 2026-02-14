# DefComm Manual Testing Guide

## Quick Start - Testing in Browser

Since you have both servers running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000 (check if running properly)

Follow these steps to manually test all features:

---

## 🔐 Step 1: User Registration & Authentication

### Test User Registration
1. Open browser to **http://localhost:5173**
2. You should see a login page or be redirected to `/login`
3. Click **Register** or navigate to `/register`
4. Fill in the registration form:
   ```
   Username: testuser1
   Email: testuser1@test.com
   Password: Test@1234
   Role: user
   ```
5. Click **Submit/Register**

**✅ Expected Results:**
- User is created
- JWT token is generated
- Token is stored in browser (check DevTools → Application → Local Storage)
- User is redirected (possibly to chat or dashboard)

**🔍 How to Verify JWT Token:**
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Expand **Local Storage** → `http://localhost:5173`
4. Look for a key like `token`, `authToken`, or `jwt`
5. You should see a long string starting with `eyJ...`

---

## 🔐 Step 2: User Login & JWT Validation

### Test User Login
1. If not already on login page, navigate to **http://localhost:5173/login**
2. Enter credentials:
   ```
   Email: testuser1@test.com
   Password: Test@1234
   ```
3. Click **Login**

**✅ Expected Results:**
- JWT token is generated and stored
- User is redirected to `/chat` (for user role)
- No errors in console

**🔍 How to Verify JWT Validation:**
1. Open DevTools → **Network** tab
2. Filter by **XHR** or **Fetch**
3. Look for API calls to backend (e.g., `/api/auth/login`)
4. Click on the request
5. Go to **Headers** tab
6. Check **Request Headers** for `Authorization: Bearer <token>`
7. Check **Response** tab for user data

**🔍 Check Console for Errors:**
1. Open DevTools → **Console** tab
2. Look for any red error messages
3. Common errors:
   - `401 Unauthorized` = JWT token invalid or missing
   - `403 Forbidden` = User not approved or wrong role
   - `Network Error` = Backend not running

---

## 👥 Step 3: Create HQ User for Approvals

### Register HQ User
1. Logout (if logged in)
2. Navigate to `/register`
3. Fill in:
   ```
   Username: hqadmin
   Email: hq@defcomm.com
   Password: HQ@Admin123
   Role: hq
   ```
4. Register and login

**✅ Expected Results:**
- HQ user is created
- After login, redirected to `/dashboard` (HQ dashboard)

---

## ✅ Step 4: User Approval System

### Test Approving Users
1. Login as **HQ user** (hq@defcomm.com)
2. Navigate to **/approvals** page
3. You should see a list of pending users

**✅ Expected Results:**
- See `testuser1` in pending users list
- Each user has **Approve** and **Reject** buttons

### Approve a User
1. Click **Approve** button for `testuser1`
2. User status should change to "Approved"

**🔍 How to Verify:**
- User should now be able to access chat features
- Logout and login as `testuser1@test.com`
- Should be able to access `/chat` without restrictions

### Reject a User (Optional)
1. Register another test user
2. Login as HQ
3. Go to `/approvals`
4. Click **Reject** for the new user
5. That user should not be able to access chat features

---

## 👥 Step 5: Group Creation

### Create a Group (HQ Only)
1. Login as **HQ user**
2. Navigate to `/groups` or look for "Create Group" button on dashboard
3. Click **Create Group**
4. Fill in:
   ```
   Name: Alpha Team
   Description: Primary operations team
   ```
5. Click **Create**

**✅ Expected Results:**
- Group is created
- Group appears in groups list

### Create Second Group
1. Create another group:
   ```
   Name: Command Center
   Description: Central command operations
   ```

### Add Members to Group
1. Look for "Add Members" or "Manage Group" option
2. Select `testuser1` from user list
3. Add to `Alpha Team` group

**✅ Expected Results:**
- User is added to group
- User can now see and access this group in chat

---

## 💬 Step 6: Send & Receive Messages

### Test Sending Messages
1. Logout and login as **testuser1**
2. Navigate to **/chat**
3. Select **Alpha Team** group from group list
4. Type a message: `Hello team, this is a test message`
5. Click **Send**

**✅ Expected Results:**
- Message appears in chat window
- Message is encrypted before being sent to backend
- Message is decrypted and displayed in chat

**🔍 How to Verify Encryption:**
1. Open DevTools → **Network** tab
2. Send a message
3. Look for POST request to `/api/groups/:groupId/messages`
4. Click on the request → **Payload** tab
5. You should see `encryptedText` field with encrypted data (not plain text)

### Test Receiving Messages
**Option 1: Same Browser**
1. Send multiple messages
2. They should appear in chat window

**Option 2: Multiple Browsers (Real-time test)**
1. Open browser window 1: Login as `testuser1`
2. Open browser window 2 (incognito): Login as another user in same group
3. Send message from window 1
4. Check if it appears in window 2 (may need refresh if no WebSocket)

---

## 🚨 Step 7: Alert System - Send & Receive Alerts

### Send Alert-Triggering Messages
1. Login as **testuser1**
2. Go to **/chat**
3. Select a group
4. Send messages with alert keywords:

**Message 1:**
```
URGENT: Security breach detected in sector 7
```

**Message 2:**
```
CRITICAL: System failure imminent
```

**Message 3:**
```
ATTACK: Incoming threat from north perimeter
```

**✅ Expected Results:**
- Messages are sent successfully
- Messages appear in chat

### Check Alert Detection (HQ Dashboard)
1. Logout and login as **HQ user**
2. Navigate to **/dashboard**
3. Look for **Alert Detection** section

**✅ Expected Results:**
- Alerts appear in red cards
- Each alert shows:
  - Message content (decrypted)
  - Sender username
  - Group name
  - Timestamp
  - Red/warning styling

**🔍 Alert Keywords:**
The system detects these keywords (case-insensitive):
- `attack`
- `urgent`
- `critical`

---

## 📊 Step 8: HQ Dashboard Statistics

### View Dashboard Stats
1. Login as **HQ user**
2. Navigate to **/dashboard**

**✅ Expected Dashboard Sections:**

### Statistics Cards:
- **Total Users**: Count of all registered users
- **Approved Users**: Count of approved users
- **Pending Users**: Count of users awaiting approval
- **Total Groups**: Count of all groups
- **Total Messages**: Count of all messages across all groups

### Recent Activity:
- List of recent messages (metadata only)
- Shows: sender, group, timestamp
- Does NOT show full message content (privacy)

### Alert Detection:
- Red alert cards for messages with keywords
- Shows full message content (for monitoring)

**🔍 How to Verify Stats:**
1. Count users you created (should match "Total Users")
2. Count approved users (should match "Approved Users")
3. Count groups created (should match "Total Groups")
4. Count messages sent (should match "Total Messages")

---

## 🧪 Complete End-to-End Test Flow

### Full Integration Test (30 minutes)

**Phase 1: Setup (5 min)**
1. ✅ Register HQ user
2. ✅ Register 2-3 regular users
3. ✅ Login as HQ
4. ✅ Approve all users
5. ✅ Create 2 groups
6. ✅ Add users to groups

**Phase 2: Messaging (10 min)**
7. ✅ Login as User 1
8. ✅ Send 3-5 regular messages in Group 1
9. ✅ Send 2-3 regular messages in Group 2
10. ✅ Login as User 2
11. ✅ Send messages in same groups
12. ✅ Verify messages appear for both users

**Phase 3: Alerts (5 min)**
13. ✅ Login as User 1
14. ✅ Send message with "URGENT" keyword
15. ✅ Send message with "CRITICAL" keyword
16. ✅ Send message with "ATTACK" keyword
17. ✅ Login as HQ
18. ✅ Check dashboard for alerts
19. ✅ Verify all 3 alerts appear

**Phase 4: Approvals (5 min)**
20. ✅ Register new user (don't approve)
21. ✅ Login as that user
22. ✅ Verify restricted access (can't use chat)
23. ✅ Login as HQ
24. ✅ Approve the user
25. ✅ Login as that user again
26. ✅ Verify full access granted

**Phase 5: Verification (5 min)**
27. ✅ Login as HQ
28. ✅ Check dashboard stats are accurate
29. ✅ Verify all groups show correct member count
30. ✅ Check console for any errors
31. ✅ Verify JWT tokens in all requests

---

## 🔍 Debugging Checklist

### If Login Doesn't Work:
- ✅ Check browser console for errors
- ✅ Check Network tab for API response
- ✅ Verify backend is running on port 5000
- ✅ Check if JWT_SECRET is set in backend `.env`

### If Messages Don't Send:
- ✅ Check if user is approved
- ✅ Check if user is member of selected group
- ✅ Check Network tab for API errors
- ✅ Verify encryption/decryption functions work

### If Alerts Don't Appear:
- ✅ Verify message contains keywords: "attack", "urgent", "critical"
- ✅ Check HQ dashboard alert detection logic
- ✅ Verify messages are being decrypted on HQ side
- ✅ Check browser console for errors

### If Groups Don't Load:
- ✅ Verify user is member of at least one group
- ✅ Check API call to `/api/groups`
- ✅ Verify JWT token is valid
- ✅ Check backend group routes

### If Approvals Don't Work:
- ✅ Verify logged in as HQ role
- ✅ Check API call to `/api/users/:id/approve`
- ✅ Verify user ID is correct
- ✅ Check backend user controller

---

## 🔐 Security Testing

### JWT Token Security:
1. ✅ Copy JWT token from localStorage
2. ✅ Decode it at https://jwt.io
3. ✅ Verify it contains: user ID, role, expiration
4. ✅ Try accessing protected route without token (should fail)
5. ✅ Try accessing HQ route as user role (should fail)

### Encryption Testing:
1. ✅ Send a message
2. ✅ Check Network tab → Request payload
3. ✅ Verify `encryptedText` is not plain text
4. ✅ Check if same message encrypted twice produces different ciphertext (if using IV)

### Role-Based Access:
1. ✅ Login as user → Try accessing `/dashboard` (should redirect/error)
2. ✅ Login as HQ → Try accessing `/chat` (should redirect/error)
3. ✅ Verify ProtectedRoute component enforces roles

---

## 📝 Test Results Template

Use this template to document your testing:

```
## DefComm Integration Test Results
Date: [DATE]
Tester: [YOUR NAME]

### User Authentication
- [ ] User Registration: PASS / FAIL
- [ ] User Login: PASS / FAIL
- [ ] JWT Token Storage: PASS / FAIL
- [ ] JWT Token Validation: PASS / FAIL

### User Approvals
- [ ] View Pending Users: PASS / FAIL
- [ ] Approve User: PASS / FAIL
- [ ] Reject User: PASS / FAIL
- [ ] Approved User Access: PASS / FAIL

### Group Management
- [ ] Create Group: PASS / FAIL
- [ ] View Groups: PASS / FAIL
- [ ] Add Members: PASS / FAIL
- [ ] Group Filtering: PASS / FAIL

### Messaging
- [ ] Send Message: PASS / FAIL
- [ ] Receive Message: PASS / FAIL
- [ ] Message Encryption: PASS / FAIL
- [ ] Message Decryption: PASS / FAIL

### Alert System
- [ ] Send Alert (URGENT): PASS / FAIL
- [ ] Send Alert (CRITICAL): PASS / FAIL
- [ ] Send Alert (ATTACK): PASS / FAIL
- [ ] HQ Alert Detection: PASS / FAIL
- [ ] Alert Display: PASS / FAIL

### HQ Dashboard
- [ ] View Statistics: PASS / FAIL
- [ ] Total Users Count: PASS / FAIL
- [ ] Approved Users Count: PASS / FAIL
- [ ] Pending Users Count: PASS / FAIL
- [ ] Total Groups Count: PASS / FAIL
- [ ] Total Messages Count: PASS / FAIL
- [ ] Recent Activity: PASS / FAIL

### Security
- [ ] JWT in Request Headers: PASS / FAIL
- [ ] Role-Based Access Control: PASS / FAIL
- [ ] Message Encryption: PASS / FAIL
- [ ] Unauthorized Access Blocked: PASS / FAIL

### Overall Result: PASS / FAIL
Notes:
[Add any issues or observations here]
```

---

## 🚀 Quick Test Commands (Browser Console)

Open browser console (F12) and run these to quickly test:

### Check if JWT Token Exists:
```javascript
console.log(localStorage.getItem('token') || localStorage.getItem('authToken') || 'No token found');
```

### Check Current User:
```javascript
// If user data is stored
console.log(JSON.parse(localStorage.getItem('user') || '{}'));
```

### Test API Call with Token:
```javascript
fetch('http://localhost:5000/api/auth/check', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('User:', data))
.catch(err => console.error('Error:', err));
```

### Check All LocalStorage:
```javascript
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key + ':', localStorage.getItem(key));
}
```

---

## ✅ Success Criteria Summary

Your DefComm integration is working correctly if:

1. ✅ **Authentication**: Users can register, login, and JWT tokens are generated
2. ✅ **JWT Validation**: Tokens are included in API requests and validated
3. ✅ **Approvals**: HQ can view, approve, and reject users
4. ✅ **Groups**: HQ can create groups and add members
5. ✅ **Messaging**: Users can send and receive encrypted messages
6. ✅ **Alerts**: Messages with keywords trigger alerts on HQ dashboard
7. ✅ **Dashboard**: HQ dashboard shows accurate statistics
8. ✅ **Security**: Role-based access control works correctly
9. ✅ **No Errors**: Browser console shows no critical errors
10. ✅ **Network**: All API calls return successful responses

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Check network requests (F12 → Network tab)
3. Verify both frontend and backend are running
4. Check backend logs in terminal
5. Verify database connection (MongoDB/MySQL)
6. Check `.env` file has all required variables

---

**Happy Testing! 🎉**
