# 🔐 YOUR PRODUCTION JWT SECRET

**IMPORTANT:** Use this for production deployment ONLY. Never commit this to GitHub!

## JWT Secret (copy this to Render)
```
133286977053d4de4537d02a9430a84d0546ae0c9
```

## Production Secrets Checklist

Before deploying DefComm to production (Render, Railway, Vercel Functions, etc.), ensure these environment variables are set on your hosting platform:

## Required Environment Variables

### 1. Node Environment
```
NODE_ENV=production
```

### 2. Frontend URL
```
FRONTEND_URL=https://your-frontend-deployment.vercel.app
```
Replace with your actual Vercel frontend URL.

### 3. JWT Secret
Generate a secure random secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```
JWT_SECRET=your_generated_secret_here
JWT_EXPIRE=30d
```

**CRITICAL**: Never use the development JWT secret in production!

### 4. Database Connection (Aiven MySQL)

After completing Aiven migration, set:

```
DATABASE_URL=mysql://avnadmin:YOUR_PASSWORD@mysql-xxxxx.aivencloud.com:PORT/defcomm?ssl-mode=REQUIRED
```

**Get this from**:
- Aiven Console → Your MySQL Service → Overview → Service URI
- Change database name from `defaultdb` to `defcomm`
- Ensure `?ssl-mode=REQUIRED` is at the end

**Alternative format** (legacy):
```
DB_HOST=mysql-xxxxx.aivencloud.com
DB_PORT=13039
DB_NAME=defcomm
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
```

> **Note**: `DATABASE_URL` is preferred and takes precedence over individual DB_* variables.

---

**Security Note:** This file is in your local directory only. Make sure it's in `.gitignore`!
