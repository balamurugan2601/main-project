# MySQL Setup Guide for DefComm Backend

## Quick Start

### 1. Create Database
Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE defcomm;
```

### 2. Configure Credentials

Update `.env` file with your MySQL password:

```env
DB_PASSWORD=your_mysql_root_password
```

If using a different MySQL user:
```env
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
```

### 3. Start Backend

```bash
npm run dev
```

The server will automatically create all tables on first run.

## Database Schema

Sequelize will auto-create these tables:

### users
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(30), UNIQUE)
- password (VARCHAR(255), hashed)
- role (ENUM: 'user', 'hq')
- isApproved (BOOLEAN, default: false)
- createdAt, updatedAt (TIMESTAMP)

### groups
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100))
- createdBy (INT, FOREIGN KEY → users.id)
- createdAt, updatedAt (TIMESTAMP)

### group_members (junction table)
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- userId (INT, FOREIGN KEY → users.id)
- groupId (INT, FOREIGN KEY → groups.id)
- createdAt, updatedAt (TIMESTAMP)
- UNIQUE INDEX on (userId, groupId)

### messages
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- groupId (INT, FOREIGN KEY → groups.id)
- senderId (INT, FOREIGN KEY → users.id)
- encryptedText (TEXT)
- createdAt, updatedAt (TIMESTAMP)
- INDEX on (groupId, createdAt)

## Testing Connection

```bash
# Test MySQL is running
mysql -u root -p

# Inside MySQL shell
SHOW DATABASES;
USE defcomm;
SHOW TABLES;
```

## Troubleshooting

**Error: Access denied for user 'root'@'localhost'**
- Update `DB_PASSWORD` in `.env` file

**Error: Unknown database 'defcomm'**
- Run `CREATE DATABASE defcomm;` in MySQL

**Error: connect ECONNREFUSED**
- Start MySQL service
- Windows: `net start MySQL80` (or your MySQL service name)
- Check MySQL is running on port 3306
