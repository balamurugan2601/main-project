# Aiven Migration Quick Start

**Goal**: Migrate DefComm from local MySQL to Aiven managed MySQL

---

## Prerequisites
- [ ] Local MySQL running with DefComm working
- [ ] Aiven account created ([aiven.io](https://aiven.io))
- [ ] Aiven MySQL service provisioned

---

## Migration Steps (Summary)

### 1. Check MySQL Readiness (5 mins)
```powershell
cd "e:\main project\defcomm-backend"
.\scripts\check-mysql-aiven-ready.ps1
```

### 2. Configure Local MySQL (10 mins)
Edit `my.ini` and add:
```ini
[mysqld]
gtid_mode=ON
enforce_gtid_consistency=ON
log_bin=mysql-bin
binlog_format=ROW
bind-address=0.0.0.0
server-id=1
```

Restart MySQL:
```powershell
Restart-Service MySQL80
```

Grant replication privileges:
```powershell
mysql -u root -p < scripts\prepare-mysql-for-aiven.sql
```

### 3. Create Aiven MySQL (10 mins)
1. Login to Aiven Console
2. Create MySQL service (choose region/plan)
3. Wait for "Running" status
4. Copy Service URI from Overview tab

### 4. Run Migration (15-30 mins)
1. Aiven Console → Service → Service Settings → Import Database
2. Enter connection details:
   - Hostname: Your public IP (or use ngrok)
   - Port: 3306
   - Username: root
   - Password: tiger123
   - Exclude: `information_schema,mysql,performance_schema,sys`
3. Click "Run checks"
4. Click "Start migration"
5. Wait for "Replication complete"

### 5. Configure Backend for Aiven (5 mins)
Create `.env.aiven`:
```env
DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defcomm?ssl-mode=REQUIRED
```

Create `defcomm` database in Aiven:
```sql
mysql -h HOST -P PORT -u avnadmin -p
CREATE DATABASE defcomm;
```

### 6. Test Connection (5 mins)
```powershell
# Backup current .env
Copy-Item .env .env.local.backup

# Use Aiven
Copy-Item .env.aiven .env

# Test
npm run dev
node test-db.js
```

### 7. Verify & Close (10 mins)
- Test all DefComm features
- In Aiven Console: Click "Close connection"
- Update production environment variables

### 8. Cleanup (5 mins)
Revert MySQL config:
```ini
bind-address=127.0.0.1
```

```powershell
Restart-Service MySQL80
```

---

## Files Created

| File | Purpose |
|------|---------|
| `AIVEN_MIGRATION_GUIDE.md` | Full detailed guide |
| `.env.aiven.template` | Aiven config template |
| `scripts/check-mysql-aiven-ready.ps1` | Pre-flight checker |
| `scripts/prepare-mysql-for-aiven.sql` | Grant privileges |

---

## Troubleshooting

**Connection Failed**
→ Check firewall, use ngrok as alternative

**Unable to use logical replication**
→ Verify GTID is enabled, use dump method if needed

**SSL errors**
→ Ensure `?ssl-mode=REQUIRED` in connection string

---

## Support

📚 **Full Guide**: [AIVEN_MIGRATION_GUIDE.md](./AIVEN_MIGRATION_GUIDE.md)  
💡 **Aiven Docs**: https://docs.aiven.io/docs/products/mysql  
🔧 **MySQL Setup**: [MYSQL_SETUP.md](./MYSQL_SETUP.md)

---

**Total Time**: ~1-1.5 hours
