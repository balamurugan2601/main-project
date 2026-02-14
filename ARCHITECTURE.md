# DefComm Project - Architecture Overview

**Last Updated**: 2026-02-12

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite + Context API + crypto-js (AES encryption)   │
│                    Port: 5173                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (CORS enabled)
┌──────────────────────▼──────────────────────────────────────┐
│                        BACKEND                               │
│     Node.js + Express + JWT + Sequelize ORM                 │
│                    Port: 5000                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      DATABASE                                │
│                  MySQL Server                                │
│              Database: defcomm                               │
│                    Port: 3306                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **State Management**: Context API (AuthContext, ChatContext)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Encryption**: crypto-js (AES-256)
- **Role-Based Access**: Protected routes

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize
- **Authentication**: JWT (httpOnly cookies)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting

### Database
- **DBMS**: MySQL
- **Tables**: users, groups, group_members, messages
- **Relationships**: Foreign keys with proper constraints

---

## Database Schema

### users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'hq') DEFAULT 'user',
  isApproved BOOLEAN DEFAULT false,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### groups
```sql
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### group_members
```sql
CREATE TABLE group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  groupId INT NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (groupId) REFERENCES groups(id),
  UNIQUE KEY (userId, groupId)
);
```

### messages
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupId INT NOT NULL,
  senderId INT NOT NULL,
  encryptedText TEXT NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (groupId) REFERENCES groups(id),
  FOREIGN KEY (senderId) REFERENCES users(id),
  INDEX (groupId, createdAt)
);
```

---

## Security Architecture

### Encryption Flow
1. **Client-Side Encryption** (Frontend)
   - User types message
   - crypto-js encrypts with AES-256
   - Encrypted text sent to backend

2. **Server Storage** (Backend)
   - Stores ONLY `encryptedText`
   - Never decrypts messages
   - No plaintext in database

3. **Client-Side Decryption** (Frontend)
   - Fetch encrypted messages
   - crypto-js decrypts for display
   - Encryption key: `defcomm_prototype_key`

### Authentication Flow
1. User registers → password hashed with bcrypt
2. User logs in → credentials validated
3. Backend generates JWT with userId + role
4. JWT stored in httpOnly cookie
5. All requests include cookie
6. Middleware validates JWT

### Authorization
- **Middleware**: `protect` (validates JWT) + `authorize(role)`
- **User role**: Access to `/chat`, `/groups`, `/messages`
- **HQ role**: Access to `/dashboard`, `/users/pending`, `/users/:id/approve`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/logout` - Clear JWT cookie
- `GET /api/auth/check` - Verify auth status

### User Management (HQ Only)
- `GET /api/users` - Get all users
- `GET /api/users/pending` - Get pending approvals
- `PUT /api/users/:id/approve` - Approve user

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create group (HQ)
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id/members` - Add member (HQ)

### Messages
- `GET /api/groups/:groupId/messages` - Get messages (paginated)
- `POST /api/groups/:groupId/messages` - Send message

---

## Project Structure

```
defcomm/
├── defcomm-frontend/          # React frontend
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Route pages
│   │   ├── context/           # Global state
│   │   ├── utils/             # Encryption utilities
│   │   └── App.jsx
│   └── package.json
│
└── defcomm-backend/           # Node.js backend
    ├── config/                # Database config
    ├── models/                # Sequelize models
    ├── controllers/           # Request handlers
    ├── services/              # Business logic
    ├── middleware/            # Auth, validation
    ├── routes/                # API routes
    ├── utils/                 # Helpers
    ├── .env                   # Environment variables
    └── server.js              # Entry point
```

---

## Data Flow Example: Send Message

1. **Frontend** (User types message)
   ```javascript
   const encrypted = encryptMessage(plaintext, key);
   POST /api/groups/1/messages { encryptedText: encrypted }
   ```

2. **Backend** (Receives request)
   - Middleware validates JWT
   - Checks user is group member
   - Stores encrypted text in MySQL
   - Returns message object

3. **Database** (Stores)
   ```sql
   INSERT INTO messages (groupId, senderId, encryptedText, createdAt)
   VALUES (1, 42, 'U2FsdGVkX1...', NOW());
   ```

4. **Frontend** (Fetches messages)
   ```javascript
   GET /api/groups/1/messages
   messages.map(msg => decryptMessage(msg.encryptedText, key))
   ```

---

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=defcomm
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## Deployment Checklist

- [ ] MySQL database created
- [ ] Environment variables configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] MySQL credentials set in backend `.env`
- [ ] Frontend API URL configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] CORS configured for frontend origin
- [ ] JWT secret is strong and unique
- [ ] MySQL user has appropriate privileges

---

## Key Design Decisions

1. **MySQL over MongoDB**: User had MySQL installed
2. **Client-side encryption**: Server never sees plaintext
3. **JWT in cookies**: More secure than localStorage
4. **Role-based access**: HQ controls governance
5. **Sequelize ORM**: Type safety and migrations
6. **Context API**: Simple state management for prototype

---

**For detailed setup instructions, see:**
- [MYSQL_SETUP.md](file:///e:/main%20project/defcomm-backend/MYSQL_SETUP.md)
- [MIGRATION_NOTICE.md](file:///e:/main%20project/defcomm-backend/MIGRATION_NOTICE.md)
