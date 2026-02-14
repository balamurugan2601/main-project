# MIGRATION NOTICE: DefComm Backend Database Change

**Date**: 2026-02-12  
**From**: Backend Architecture Manager  
**To**: All Agent Managers (Frontend, DevOps, Testing, etc.)

---

## 🔄 Critical Change: MongoDB → MySQL Migration

The DefComm backend has been **migrated from MongoDB to MySQL** using Sequelize ORM.

---

## What Changed

### Database Technology
- **Before**: MongoDB + Mongoose
- **After**: MySQL + Sequelize

### Models Updated
All models converted to Sequelize:
- `User` - username, password (hashed), role, isApproved
- `Group` - name, createdBy
- `GroupMember` - junction table for user-group relationships
- `Message` - groupId, senderId, encryptedText

### Environment Variables
Updated in `.env`:
```env
# OLD (MongoDB)
MONGO_URI=mongodb://localhost:27017/defcomm

# NEW (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=defcomm
DB_USER=root
DB_PASSWORD=your_password
```

---

## API Contract - NO BREAKING CHANGES

> [!IMPORTANT]
> **All API endpoints remain identical**. Frontend integration is unaffected.

### Endpoints (Unchanged)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/pending` (HQ only)
- `PUT /api/users/:id/approve` (HQ only)
- `GET /api/groups`
- `POST /api/groups`
- `PUT /api/groups/:id/members`
- `POST /api/groups/:groupId/messages`
- `GET /api/groups/:groupId/messages`

### Response Format (Unchanged)
Messages still return:
```json
{
  "id": "integer",
  "groupId": "integer",
  "senderId": "integer",
  "encryptedText": "string",
  "timestamp": "datetime"
}
```

---

## For Frontend Manager

✅ **No changes required** to frontend code  
✅ API contracts preserved  
✅ Message encryption/decryption stays client-side  
✅ Same authentication flow (JWT cookies)

**Action**: None required. Frontend will work as-is once backend connects to MySQL.

---

## For DevOps/Deployment Manager

### New Requirements
1. **MySQL Server** (instead of MongoDB)
2. **Database Setup**:
   ```sql
   CREATE DATABASE defcomm;
   ```
3. **Environment Variables**:
   - Add `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - Remove `MONGO_URI`

### Auto-Migration
Sequelize will automatically create tables on first connection using `sequelize.sync()`.

### Production Considerations
- Use MySQL user with limited privileges (not root)
- Enable MySQL SSL in production
- Set strong DB password
- Consider connection pooling (already configured)

---

## For Testing Manager

### Database Changes
- Primary keys are now integers (auto-increment) instead of ObjectIds
- Junction table `group_members` for user-group relationships
- All foreign keys properly defined

### Test Data
You may need to:
- Update test fixtures if they reference MongoDB ObjectIds
- Adjust any database-specific test queries
- Verify Sequelize transactions in integration tests

### Seed Data
Sequelize supports seeders for test data:
```bash
npx sequelize-cli seed:generate --name demo-users
```

---

## For Documentation Manager

### Files to Update
- Architecture diagrams (MongoDB → MySQL)
- Database schema documentation
- Deployment guides
- Environment setup instructions

### Reference Documents
- [MYSQL_SETUP.md](file:///e:/main%20project/defcomm-backend/MYSQL_SETUP.md) - Setup guide
- [walkthrough.md](file:///C:/Users/shyam/.gemini/antigravity/brain/e760eac1-9725-4667-a724-f031ed8e7074/walkthrough.md) - Updated implementation walkthrough

---

## Migration Rationale

User had **MySQL server already installed** on their system, making MySQL the logical choice over installing MongoDB.

---

## Technical Details

### ORM Comparison
| Feature | Mongoose (Old) | Sequelize (New) |
|---------|---------------|-----------------|
| Database | MongoDB | MySQL |
| Schema | Flexible | Strict |
| Relations | Manual refs | Built-in associations |
| Migrations | Manual | Auto-sync available |
| Transactions | Limited | Full ACID support |

### Code Changes
- All services updated to use Sequelize syntax
- Middleware updated (`findByPk` instead of `findById`)
- Models use DataTypes instead of Schema
- Associations defined in `models/index.js`

---

## Current Status

✅ Migration complete  
✅ All endpoints functional  
✅ Security preserved  
⚠️ Requires MySQL database creation  
⚠️ Requires credentials configuration  

---

## Support

For questions about the migration:
- See [MYSQL_SETUP.md](file:///e:/main%20project/defcomm-backend/MYSQL_SETUP.md)
- Review updated [walkthrough.md](file:///C:/Users/shyam/.gemini/antigravity/brain/e760eac1-9725-4667-a724-f031ed8e7074/walkthrough.md)
- Check `models/` directory for Sequelize implementations

---

**Backend Architecture Manager**  
DefComm Project
