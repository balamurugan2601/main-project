# DefComm Production Deployment Guide

## Quick Deploy Checklist

- [ ] Deploy MySQL database (Step 1)
- [ ] Deploy backend to Render (Step 2)
- [ ] Configure backend environment variables (Step 3)
- [ ] Update Vercel frontend environment (Step 4)
- [ ] Test end-to-end (Step 5)

---

## Step 1: Deploy MySQL Database (Choose One)

### Option A: Aiven (Recommended - Free 1GB)
1. Go to https://aiven.io
2. Sign up → Create MySQL service
3. Select: **Free plan** → Region: **Asia Pacific (Singapore)** or closest
4. Wait 3-5 minutes for provisioning
5. Copy **Service URI** from dashboard (looks like: `mysql://user:pass@host:port/defaultdb`)

### Option B: Railway
1. Go to https://railway.app
2. New Project → Add MySQL
3. Copy `DATABASE_URL` from Variables tab

### Option C: PlanetScale
1. Go to https://planetscale.com
2. Create database → Get connection string

**Save your DATABASE_URL** - you'll need it in Step 3.

---

## Step 2: Deploy Backend to Render

### Method 1: Using render.yaml (One-Click)

1. Go to https://render.com
2. New → Web Service
3. Connect your GitHub repository
4. Root Directory: `defcomm-backend`
5. Render will detect `render.yaml` automatically
6. Click **Create Web Service**

### Method 2: Manual Setup

1. Go to https://render.com
2. New → Web Service  
3. Connect repository
4. Configure:
   - **Name:** `defcomm-backend`
   - **Root Directory:** `defcomm-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

---

## Step 3: Configure Backend Environment Variables

In Render dashboard → Environment tab, add:

| Variable | Value | How to Get |
|----------|-------|------------|
| `NODE_ENV` | `production` | Just type this |
| `PORT` | `5000` | Just type this |
| `FRONTEND_URL` | `https://main-project-lac.vercel.app` | Your Vercel URL |
| `JWT_SECRET` | `<64-char random string>` | Run locally: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRE` | `30d` | Just type this |
| `DATABASE_URL` | `mysql://user:pass@host:port/db` | From Step 1 (your MySQL provider) |

**CRITICAL:** Generate a new `JWT_SECRET` - don't reuse development secrets!

After adding all variables, Render will auto-deploy. Wait 2-3 minutes.

---

## Step 4: Get Backend URL & Configure Frontend

1. **Copy Backend URL** from Render dashboard (e.g., `https://defcomm-backend.onrender.com`)

2. **Go to Vercel:**
   - Open project → Settings → Environment Variables
   - Add new variable:
     - **Name:** `VITE_API_BASE_URL`
     - **Value:** `https://your-backend-url.onrender.com/api` *(Note the `/api` at end!)*
     - **Environment:** Production

3. **Redeploy Frontend:**
   - Go to Deployments tab
   - Click ⋯ on latest deployment → Redeploy

---

## Step 5: Test End-to-End

### Test Backend Health
```bash
curl https://your-backend-url.onrender.com/
# Expected: {"status":"OK","message":"DefComm API is running"}
```

### Test Registration
1. Open: https://main-project-lac.vercel.app/register
2. Fill form:
   - Username: `testuser`
   - Password: `test123`
   - Role: User
3. Click **Register**
4. **Expected:** "Registration Successful! Account pending HQ approval"

### Check Browser Console
- Open DevTools → Console
- Should be NO errors
- Check Network tab:
  - POST to `https://your-backend.onrender.com/api/auth/register`
  - Status: 200 OK

---

## Troubleshooting

### ❌ "Registration failed"

**Check 1: Browser Network Tab**
- Request URL = production backend? (not localhost)
- Status code?
  - 500 → Backend error (check Render logs)
  - CORS error → Verify `FRONTEND_URL` matches Vercel URL exactly
  - Connection refused → Backend not running

**Check 2: Render Logs**
```
Logs → Look for:
✅ "MySQL Database connected successfully"
✅ "Database synchronized"
✅ "Server running in production mode on port 5000"
```

**Check 3: Environment Variables**
- All 6 variables set in Render?
- `DATABASE_URL` formatted correctly?
- `FRONTEND_URL` has https:// and matches Vercel URL?

### ❌ Database Connection Failed

- Verify `DATABASE_URL` format: `mysql://user:pass@host:port/database`
- Check database provider dashboard - is service running?
- SSL enabled? (should be auto-detected)

### ❌ CORS Error

- `FRONTEND_URL` must match Vercel URL EXACTLY
- Include `https://` protocol
- NO trailing slash
- Redeploy backend after changing environment variable

---

## Security Checklist

- [ ] `JWT_SECRET` is randomly generated (64+ chars)
- [ ] `NODE_ENV=production` is set
- [ ] Database password is strong
- [ ] `FRONTEND_URL` is exact Vercel URL
- [ ] No secrets committed to GitHub (.env files in .gitignore)

---

## Post-Deployment

**Create HQ Admin Account:**

After successful deployment, you'll need at least one HQ admin to approve users.

1. Register an HQ account via frontend
2. Manually approve it via database query, OR
3. Use provided approval script (if available)

---

## Quick Reference

**Backend URL:** `https://your-backend.onrender.com`  
**Frontend URL:** `https://main-project-lac.vercel.app`  
**API Base:** `https://your-backend.onrender.com/api`

**Files Created:**
- `render.yaml` - Render deployment config
- `.env.production.example` - Environment variable template
- `DEPLOYMENT.md` - This guide

Good luck! 🚀
