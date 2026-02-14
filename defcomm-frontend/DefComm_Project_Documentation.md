DEFCOMM – HQ-CONTROLLED SECURE COMMUNICATION PLATFORM
Complete A-to-Z Project Documentation
Prototype Version

------------------------------------------------------------
1. PROJECT OVERVIEW
------------------------------------------------------------

Project Name:
DefComm – HQ-Controlled Secure Communication Platform

Project Type:
Frontend Prototype (React + Context API)

Objective:
To build a secure closed-group communication platform with role-based governance,
encrypted messaging, group-based communication, and HQ monitoring capabilities.

This prototype demonstrates:
- Secure messaging flow
- Role-based authentication
- Group-level communication control
- Alert detection system
- Governance dashboard

This is a frontend architectural prototype, not a production defense-grade system.

------------------------------------------------------------
2. CORE CONCEPT
------------------------------------------------------------

DefComm simulates a secure ecosystem where:

Users:
- Must be approved by HQ
- Can only communicate within approved groups

HQ:
- Monitors system activity
- Views metadata
- Detects suspicious keywords
- Maintains governance control

Security Layers (Prototype-Level):
- Application-level AES encryption
- Role-based routing
- Context-based global state management

------------------------------------------------------------
3. TECHNOLOGY STACK
------------------------------------------------------------

Frontend:
- React (Vite)
- JavaScript
- Tailwind CSS
- React Router v6
- Context API

Encryption:
- crypto-js (AES encryption)

Architecture Pattern:
- Component-based modular design
- Global state using Context
- Separation of concerns

------------------------------------------------------------
4. PROJECT STRUCTURE
------------------------------------------------------------

src/
  components/
    layout/
    chat/
    dashboard/
    common/
  pages/
    auth/
    user/
    hq/
  context/
    AuthContext.jsx
    useAuth.js
    ChatContext.jsx
    useChat.js
  mock/
    dummyData.js
  utils/
    encrypt.js
  services/
  App.jsx
  main.jsx

------------------------------------------------------------
5. AUTHENTICATION SYSTEM
------------------------------------------------------------

AuthContext:
- Stores current user
- login(userData)
- logout()

Roles:
- user
- hq

Routing:
- /chat → user only
- /dashboard → hq only

ProtectedRoute ensures role-based access control.

------------------------------------------------------------
6. CHAT SYSTEM ARCHITECTURE
------------------------------------------------------------

ChatContext:
- Global message state
- addMessage(newMessage)
- Shared between Chat page and HQ dashboard

Message Structure:
{
  id,
  groupId,
  senderId,
  encryptedText,
  timestamp
}

Encryption:
- AES using secret key: "defcomm_prototype_key"
- encryptMessage()
- decryptMessage()

Chat Features:
- Group switching
- Encrypted message storage
- Decryption before rendering
- Auto-scroll
- Dynamic message updates

------------------------------------------------------------
7. GROUP MANAGEMENT
------------------------------------------------------------

Groups:
- Alpha Team
- Command Center

Users can switch active group.
Messages are filtered by groupId.

------------------------------------------------------------
8. HQ DASHBOARD
------------------------------------------------------------

Features:
- Total Users
- Approved Users
- Pending Users
- Total Groups
- Total Messages

Recent Activity:
- Metadata only (no full message display)

Alert Detection:
- Keywords monitored:
  ["attack", "urgent", "critical"]

If decrypted message contains any keyword:
→ Alert card generated

------------------------------------------------------------
9. ALERT SYSTEM LOGIC
------------------------------------------------------------

1. Decrypt each message
2. Convert to lowercase
3. Check keyword match
4. Add to alert array
5. Render red alert cards

------------------------------------------------------------
10. DATA FLOW
------------------------------------------------------------

User sends message
→ MessageInput encrypts text
→ ChatContext addMessage()
→ Chat UI updates
→ HQ Dashboard reads same message state
→ Alert system checks message

Single global state source of truth.

------------------------------------------------------------
11. CURRENT LIMITATIONS (PROTOTYPE)
------------------------------------------------------------

- No backend
- No persistent storage
- No real VPN
- No database
- No real authentication validation
- No production-grade encryption key management

------------------------------------------------------------
12. FUTURE ENHANCEMENTS
------------------------------------------------------------

- Backend integration (Node.js / Express)
- Database (MongoDB / PostgreSQL)
- JWT authentication
- Real user approval workflow
- WebSocket real-time sync
- End-to-end key exchange
- Message persistence
- SIEM integration
- Role-based permission matrix

------------------------------------------------------------
13. DEMO FLOW (FOR JUDGES)
------------------------------------------------------------

1. Register as user
2. Login
3. Send encrypted message
4. Switch groups
5. Trigger alert using keyword
6. Login as HQ
7. Show dashboard stats
8. Show alert detection

------------------------------------------------------------
14. ARCHITECTURAL PRINCIPLES FOLLOWED
------------------------------------------------------------

- Separation of concerns
- Modular design
- Clean folder hierarchy
- Global state management
- Reusable components
- Role-based routing
- Encryption abstraction

------------------------------------------------------------
15. MIGRATION CONTEXT (FOR AI SYSTEMS)
------------------------------------------------------------

If migrating this project to another AI-based development environment:

System Type:
Frontend secure chat prototype

Primary Focus:
Governance + Encryption + Role-Based Communication

Important Context:
- Chat state is global (ChatContext)
- Auth state is global (AuthContext)
- Messages are encrypted before storage
- Alerts rely on decrypted content
- HQ dashboard reads shared state

Any migration must preserve:
- Context-based state architecture
- Encryption-decryption pairing
- Role-based routing guards
- Group-based message filtering

------------------------------------------------------------

END OF DOCUMENTATION
