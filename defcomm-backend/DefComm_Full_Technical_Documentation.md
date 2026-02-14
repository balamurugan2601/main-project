# DefComm – Full Technical Project Documentation
## Secure HQ-Controlled Communication Platform (Prototype Version)

---

## 1. System Overview
DefComm is a secure, closed-group communication platform designed for role-based governance and encrypted messaging. It ensures that communication occurs only within approved groups and is monitored by a central HQ for security threats.

**Core Objective:** To provide a demonstration of secure messaging, administrative oversight, and automated threat detection in a defensive communication context.

---

## 2. Technical Stack

### Frontend Architecture
- **Framework:** React (Vite-based)
- **Styling:** Tailwind CSS (Modern, responsive design)
- **State Management:** React Context API
  - `AuthContext`: Manages user sessions, roles (User/HQ), and approval status.
  - `ChatContext`: Handles real-time message state, group switching, and message broad-casting.
- **Routing:** React Router v6 (Protected routes for role-based access control).
- **Security:** `crypto-js` (Client-side AES encryption).

### Backend Architecture
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Relational storage for structured governance)
- **ORM:** Sequelize (Database modeling and associations)
- **Authentication:** JWT (JSON Web Tokens) stored in HTTP-only, secure cookies.
- **Security Middleware:**
  - `Helmet`: Security headers.
  - `express-rate-limit`: Brute-force protection.
  - `cookieParser`: Secure cookie handling.

---

## 3. Database Schema (MySQL)
The system uses a relational schema to manage complex user-group-message relationships:

- **Users:** `id`, `username`, `password` (hashed), `role` (user/hq), `isApproved` (boolean).
- **Groups:** `id`, `name`, `createdBy` (Reference to User).
- **GroupMembers:** Junction table handling M:N relationships between Users and Groups.
- **Messages:** `id`, `groupId`, `senderId`, `encryptedText`, `timestamp`.

---

## 4. Security Framework

### Implementation Layers
1. **At-Rest Security:** Passwords are hashed using `bcrypt` before storage.
2. **In-Transit Security:** JWT-based session management with secure cookie delivery.
3. **Application Layer Encryption:** 
   - Messages are encrypted on the client side using **AES-256** before being sent to the server.
   - The server stores only the `encryptedText`, ensuring that even a database breach does not expose message contents without the shared secret.

### Threat Detection Engine (HQ Dashboard)
HQ monitors the platform through a centralized dashboard:
- **Alert Logic:** The dashboard performs real-time decryption of incoming message metadata for monitoring purposes.
- **Keyword Heuristics:** Decrypted text is scanned against high-risk categories (e.g., "attack", "urgent", "critical").
- **Automated Alerts:** If a match is found, the system triggers a visual alert card in the HQ console.

---

## 5. Project Structure

### Backend (`/defcomm-backend`)
```text
├── config/             # Database connection (Sequelize)
├── controllers/        # Business logic (Auth, Messages, Groups, Admin)
├── middleware/         # Auth guards, Error handling, Security
├── models/             # Sequelize models (User, Group, Message, etc.)
├── routes/             # API endpoints
├── services/           # Reusable data logic
├── utils/              # Token generation, Helpers
└── server.js           # Entry point
```

### Frontend (`/defcomm-frontend`)
```text
├── src/
│   ├── components/     # UI components (Chat, Layout, Dashboard)
│   ├── context/        # Global state (AuthContext, ChatContext)
│   ├── pages/          # View entry points (Login, Chat, HQ Dashboard)
│   ├── utils/          # Encryption utilities (AES wrappers)
│   └── App.jsx         # Routing and layout initialization
```

---

## 6. Functional Workflow

1. **Onboarding:** User registers → Account enters "Pending" state in HQ dashboard.
2. **Governance:** HQ reviews metadata → Approves User → User gains access to chat.
3. **Communication:** 
   - User types message → Frontend encrypts via AES → Sent to Backend.
   - Message saved in MySQL → Broadcasted to Group Members.
4. **Monitoring:** HQ Dashboard reads Message stream → Decrypts (via shared secret) → Scans for alerts → Displays metrics (Total Users, Approved, Messages).

---

## 7. Current Project State
The project has successfully transitioned from a frontend-only prototype to a full-stack **MySQL/Express/React** application. It features persistent storage, live authentication, and a robust administrative governance layer.

---
*Document Version: 2.0 (Full-Stack Integrated)*
