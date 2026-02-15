# Aiven MySQL Migration Guide for DefComm

## Overview

This guide walks you through migrating your DefComm backend from local MySQL to Aiven's managed MySQL service using the Aiven Console migration tool with continuous replication.

---

## Prerequisites Checklist

Before starting the migration:

- [ ] Local MySQL is running and DefComm backend connects successfully
- [ ] Aiven account created (sign up at https://aiven.io)
- [ ] Aiven MySQL service provisioned
- [ ] Your public IP address or accessible hostname is known

---

## Part 1: Prepare Local MySQL (Windows)

### Step 1: Locate MySQL Configuration File

Common locations on Windows:
- `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
- `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`

If not found, check your MySQL installation directory.

### Step 2: Enable GTID and Logical Replication

Open PowerShell **as Administrator** and locate your config file:

```powershell
# Find MySQL config file
Get-ChildItem -Path "C:\ProgramData\MySQL" -Recurse -Filter "my.ini" -ErrorAction SilentlyContinue
Get-ChildItem -Path "C:\Program Files\MySQL" -Recurse -Filter "my.ini" -ErrorAction SilentlyContinue
```

Edit the `my.ini` file and add these settings under the `[mysqld]` section:

```ini
[mysqld]
# Enable GTID (Global Transaction Identifiers)
gtid_mode=ON
enforce_gtid_consistency=ON

# Enable binary logging for replication
log_bin=mysql-bin
binlog_format=ROW

# Allow remote connections (TEMPORARY - for migration only)
bind-address=0.0.0.0

# Server ID (required for replication)
server-id=1
```

**Important**: The `bind-address=0.0.0.0` setting allows remote connections. This is **temporary** for migration and should be reverted afterward.

### Step 3: Restart MySQL Service

```powershell
# Restart MySQL (adjust service name if different)
Restart-Service MySQL80

# Verify service is running
Get-Service MySQL80
```

### Step 4: Grant Replication Privileges

Open MySQL command line:

```powershell
mysql -u root -p
```

Enter your password (`tiger123` based on your `.env`), then run:

```sql
-- Grant replication privileges to root user
GRANT REPLICATION CLIENT ON *.* TO 'root'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;

-- Verify GTID is enabled
SHOW VARIABLES LIKE 'gtid_mode';
-- Expected: gtid_mode = ON

-- Verify binary logging
SHOW VARIABLES LIKE 'log_bin';
-- Expected: log_bin = ON

-- Exit MySQL
EXIT;
```

### Step 5: Configure Windows Firewall (If Needed)

If you're behind a router or firewall, you may need to:

1. **Allow MySQL through Windows Firewall**:
   ```powershell
   New-NetFirewallRule -DisplayName "MySQL Server" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow
   ```

2. **Port Forwarding**: If behind a router, forward port 3306 to your local machine's IP in your router settings.

3. **Alternative - Use ngrok** (easier for testing):
   ```powershell
   # Install ngrok from https://ngrok.com
   ngrok tcp 3306
   ```
   This will give you a public hostname like `0.tcp.ngrok.io:12345` to use in Aiven migration wizard.

### Step 6: Find Your Public IP or Hostname

```powershell
# Get your public IP
Invoke-RestMethod -Uri "https://api.ipify.org?format=text"
```

Note this IP - you'll need it for Aiven migration wizard.

---

## Part 2: Create Aiven MySQL Service

### Step 1: Sign Up for Aiven

1. Go to https://aiven.io
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create MySQL Service

1. Log in to [Aiven Console](https://console.aiven.io)
2. Click **"Create Service"**
3. Select **"MySQL"**
4. Choose configuration:
   - **Cloud Provider**: AWS, Google Cloud, or Azure (recommend AWS for reliability)
   - **Region**: Choose closest to your frontend deployment (e.g., `us-east-1` for US East Coast)
   - **Service Plan**: 
     - For testing: **Startup-4** (smallest tier, ~$25/month)
     - For production: **Business-4** or higher (has backups and high availability)
5. **Service Name**: Enter a name like `defcomm-mysql`
6. Click **"Create Service"**

**Wait 5-10 minutes** for the service to provision. Status will change to "Running" when ready.

### Step 3: Get Connection String

Once the service is running:

1. Click on your service name
2. Go to **"Overview"** tab
3. Find **"Service URI"** - this is your connection string
4. Format will be: `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`
5. **Copy this** - you'll need it for backend configuration

Example:
```
mysql://avnadmin:abc123XYZ@mysql-defcomm-myproject.aivencloud.com:13039/defaultdb?ssl-mode=REQUIRED
```

---

## Part 3: Run Migration via Aiven Console

### Step 1: Access Migration Tool

1. In Aiven Console, click on your MySQL service
2. Navigate to **"Service Settings"** (left sidebar)
3. Scroll down to **"Service Management"** section
4. Click **"Import Database"**

### Step 2: Configure Migration (Wizard Step 1)

Review the guidelines, then click **"Get Started"**.

### Step 3: Validate Connection (Wizard Step 2)

Enter your local MySQL details:

| Field | Value |
|-------|-------|
| **Hostname** | Your public IP OR ngrok hostname (e.g., `0.tcp.ngrok.io`) |
| **Port** | `3306` OR ngrok port (e.g., `12345`) |
| **Username** | `root` |
| **Password** | `tiger123` (from your `.env`) |
| **SSL encryption** | ✅ Recommended (checked) |
| **Exclude databases** | `information_schema,mysql,performance_schema,sys` |

Click **"Run checks"**.

**Expected Result**: All checks should pass with green checkmarks.

### Troubleshooting Connection Issues

If you see "Unable to connect" errors:

- **Connection refused**: 
  - Verify MySQL service is running: `Get-Service MySQL80`
  - Check Windows Firewall allows port 3306
  - If using ngrok, ensure it's still running

- **Access denied**:
  - Verify password in `.env` matches MySQL root password
  - Check replication privileges were granted (Step 4 in Part 1)

- **Unable to use logical replication**:
  - Verify GTID is enabled: `mysql -u root -p -e "SHOW VARIABLES LIKE 'gtid_mode';"`
  - Check `log_bin` is ON
  - If GTID can't be enabled, select **"Start the migration using a one-time snapshot (dump method)"** (less ideal)

### Step 4: Start Migration (Wizard Step 3)

Once checks pass, click **"Start Migration"**.

The migration will begin with two phases:

1. **Initial Data Transfer**: Copies existing data from local MySQL to Aiven
2. **Continuous Replication**: Syncs any new changes in real-time

You can click **"Close window"** and come back to check status anytime.

### Step 5: Monitor Replication (Wizard Step 4)

The migration wizard shows:
- **Replication Status**: Active / Complete
- **Tables Migrated**: Count of tables transferred
- **Data Transferred**: Amount of data synced
- **Lag**: How far behind Aiven is from local MySQL (should be near 0)

**Wait until**:
- Status shows "Replication complete" or "Synchronized"
- Lag is 0 seconds
- All tables are migrated

**Warning**: While replication is active:
- ⚠️ Do NOT write to tables in Aiven database manually
- ⚠️ Do NOT modify MySQL replication settings
- ⚠️ Do NOT stop MySQL service or change firewall rules

---

## Part 4: Configure Backend for Aiven

### Step 1: Create `.env.aiven` File

In `e:\main project\defcomm-backend\`, create a new file `.env.aiven`:

```env
NODE_ENV=production
PORT=5000

# Frontend URL
FRONTEND_URL=https://main-project-lac.vercel.app

# JWT Configuration (keep your existing secret)
JWT_SECRET=dc_s3cur3_jwt_k3y_7f8a2b9e4d1c6e3f5a0b8d7c
JWT_EXPIRE=30d

# Aiven MySQL Connection
# Replace with your actual Aiven connection string
DATABASE_URL=mysql://avnadmin:YOUR_PASSWORD@mysql-xxxxx.aivencloud.com:PORT/defaultdb?ssl-mode=REQUIRED
```

**Important**: Replace `YOUR_PASSWORD`, `mysql-xxxxx.aivencloud.com`, and `PORT` with values from Aiven's Service URI.

**Note**: The database name in Aiven's default connection string is `defaultdb`. We'll change it to `defcomm`:

```env
# Change from defaultdb to defcomm
DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defcomm?ssl-mode=REQUIRED
```

### Step 2: Create `defcomm` Database in Aiven

Aiven creates a default database called `defaultdb`. We need to create `defcomm`:

**Option A: Using Aiven Console**
1. In Aiven Console, go to your MySQL service
2. Click **"Databases"** tab
3. Click **"Create Database"**
4. Enter name: `defcomm`
5. Click **"Create"**

**Option B: Using command line**
```bash
# Connect to Aiven MySQL (replace with your connection string)
mysql -h mysql-xxxxx.aivencloud.com -P PORT -u avnadmin -p

# Enter password when prompted, then:
CREATE DATABASE defcomm;
EXIT;
```

### Step 3: Add `.env.aiven` to `.gitignore`

Ensure sensitive credentials aren't committed:

```bash
# In e:\main project\defcomm-backend\.gitignore
# Add this line if not already present:
.env.aiven
```

---

## Part 5: Test Connection to Aiven

### Step 1: Backup Current `.env`

```powershell
# In backend directory
cd "e:\main project\defcomm-backend"
Copy-Item .env .env.local.backup
```

### Step 2: Switch to Aiven Configuration

```powershell
# Use Aiven environment
Copy-Item .env.aiven .env
```

### Step 3: Test Backend Connection

```powershell
npm run dev
```

**Expected Output**:
```
MySQL Database connected successfully
Database synchronized
Server running in production mode on port 5000
```

**If connection fails**:
- Verify `DATABASE_URL` format is correct
- Check database name is `defcomm` (not `defaultdb`)
- Ensure `ssl-mode=REQUIRED` is in connection string
- Verify Aiven service is "Running" in console

### Step 4: Verify Data Integrity

Run the test script:

```powershell
node test-db.js
```

This should show:
- Connected to Aiven MySQL
- List of tables: `users`, `groups`, `group_members`, `messages`
- Record counts matching your local database

### Step 5: Test API Endpoints

Keep backend running and test with curl or Postman:

```powershell
# Health check
curl http://localhost:5000/

# Should return: {"status":"OK","message":"DefComm API is running"}
```

---

## Part 6: Verify Migration Success

### Frontend Integration Test

1. Start your DefComm frontend (ensure it points to `http://localhost:5000`)
2. Test each feature:

**Authentication**:
- ✅ Login with existing user → Should work
- ✅ Register new user → Should save to Aiven
- ✅ HQ login → Should access admin panel

**Groups**:
- ✅ View groups list → Should show existing groups
- ✅ Create new group → Should persist to Aiven
- ✅ Add members → Should work correctly

**Messages**:
- ✅ Send message → Should encrypt and save
- ✅ View message history → Should load existing messages
- ✅ Real-time updates → Should receive new messages

**Pass Criteria**: All features work identically to local MySQL.

---

## Part 7: Finalize Migration

### Step 1: Close Replication Connection

Once testing is complete and you're confident data is correct:

1. Go back to Aiven Console migration wizard
2. Click **"Close connection"**
3. Confirm to stop replication

This severs the connection between local MySQL and Aiven.

### Step 2: Update Production Environment

For your deployment platform (Render, Railway, Vercel, etc.), set environment variable:

```
DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defcomm?ssl-mode=REQUIRED
```

### Step 3: Restore Local MySQL Security

**IMPORTANT**: Revert the temporary changes made for migration.

Edit `my.ini` again and change:
```ini
# Change back from 0.0.0.0 to localhost only
bind-address=127.0.0.1
```

Restart MySQL:
```powershell
Restart-Service MySQL80
```

Remove remote replication privileges:
```sql
mysql -u root -p

REVOKE REPLICATION CLIENT ON *.* FROM 'root'@'%';
REVOKE REPLICATION SLAVE ON *.* FROM 'root'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Remove Windows Firewall Rule (Optional)

If you created a firewall rule:
```powershell
Remove-NetFirewallRule -DisplayName "MySQL Server"
```

### Step 5: Decide on Local vs Aiven for Development

**Option A**: Keep using local MySQL for development
```powershell
# Restore original .env
Copy-Item .env.local.backup .env
```

**Option B**: Use Aiven for all development
```powershell
# Keep using .env.aiven
# (Current setup)
```

Recommendation: Use local MySQL for development to save Aiven costs and have offline capability.

---

## Part 8: Enable Aiven Features

### Automatic Backups

1. In Aiven Console, go to your MySQL service
2. Click **"Backups"** tab
3. Verify automatic backups are enabled (enabled by default on paid plans)
4. Backups are taken every 12 hours

### IP Whitelisting (Optional)

For extra security, restrict access to Aiven:

1. Go to **"Overview"** tab
2. Click **"Advanced Configuration"**
3. Find **"IP Filter"**
4. Add allowed IP addresses (your server's IP, your local IP for testing, etc.)
5. Click **"Save changes"**

### Monitoring

1. Go to **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Disk space
   - Connection count
   - Query performance

---

## Troubleshooting

### "Connection lost" errors in backend

**Cause**: Network interruption or Aiven service restart

**Solution**:
- Sequelize auto-reconnects with connection pooling
- Check Aiven service status in console
- Increase pool timeout if needed in `config/db.js`

### "Too many connections" error

**Cause**: Connection pool exhausted

**Solution**:
```javascript
// In config/db.js, increase pool size
pool: {
    max: 10,        // Increase from 5
    min: 0,
    acquire: 30000,
    idle: 10000,
}
```

### SSL/TLS certificate errors

**Cause**: SSL mode misconfiguration

**Solution**:
- Ensure connection string has `?ssl-mode=REQUIRED`
- OR in `config/db.js`, verify SSL dialect options are correct

### Slow query performance

**Cause**: Network latency or missing indexes

**Solution**:
- Use Aiven region closest to your deployment
- Check slow query log in Aiven Console
- Add indexes to frequently queried columns

---

## Rollback Plan

If you need to revert to local MySQL:

```powershell
# Stop backend
# Restore original .env
Copy-Item .env.local.backup .env

# Start backend with local MySQL
npm run dev
```

Your local MySQL data is unchanged - migration only copies data, doesn't delete it.

---

## Post-Migration Checklist

- [ ] Aiven MySQL service is running
- [ ] Backend connects to Aiven successfully
- [ ] All tables and data migrated correctly
- [ ] Frontend features work with Aiven backend
- [ ] Production environment variables updated
- [ ] Local MySQL security settings restored
- [ ] Automatic backups enabled in Aiven
- [ ] `.env.aiven` added to `.gitignore`
- [ ] Migration connection closed in Aiven Console

---

## Summary

You have successfully migrated DefComm from local MySQL to Aiven managed MySQL! 

**Benefits**:
- ✅ Managed database with automatic backups
- ✅ High availability and scalability
- ✅ SSL/TLS encryption in transit
- ✅ Monitoring and metrics
- ✅ Production-ready infrastructure

**Next Steps**:
- Deploy backend to Render/Railway with Aiven `DATABASE_URL`
- Monitor Aiven metrics for performance
- Set up alerting for service issues
- Plan for scaling as user base grows

---

## Support Resources

- **Aiven Documentation**: https://docs.aiven.io/docs/products/mysql
- **Aiven Console**: https://console.aiven.io
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **DefComm MySQL Setup**: See `MYSQL_SETUP.md` in this directory

For issues, check Aiven's support portal or community forums.
