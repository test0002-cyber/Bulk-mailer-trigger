# Cloudflare Deployment Guide

## Overview
Deploy your Bulk Mailer application to the cloud **completely free** using Cloudflare Pages (Frontend) + Render.com (Backend).

---

## Part 1: Deploy Frontend to Cloudflare Pages

### Prerequisites
- Cloudflare account (free) - https://www.cloudflare.com
- GitHub account with your repository

### Step-by-Step Frontend Deployment

#### 1. Create Cloudflare Account
```
1. Go to https://www.cloudflare.com
2. Sign up (free plan)
3. Verify your email
```

#### 2. Deploy with Cloudflare Pages
```
1. Login to Cloudflare Dashboard
2. Select "Workers & Pages" from the sidebar
3. Click "Pages" → "Create a project"
4. Select "Connect to Git"
5. Authorize GitHub and select: test0002-cyber/Bulk-mailer-trigger
6. Configure build settings:
   - Framework: Vite
   - Build command: npm run build
   - Build output directory: dist
   - Environment: Node.js 18.x
7. Click "Save and Deploy"
```

#### 3. Set Environment Variables (Optional)
```
In Cloudflare Pages dashboard:
1. Go to your project settings
2. Click "Environment variables"
3. Add: VITE_API_URL = https://your-backend-url.com
4. Save and redeploy
```

**Frontend URL**: `https://your-project.pages.dev`

---

## Part 2: Deploy Backend to Render.com (Free)

### Why Render instead of Cloudflare Workers?
- Cloudflare Workers: Limited to 100,000 requests/day + complex setup
- Render.com: Free tier supports full Node.js applications
- Better for your use case: Email sending, database, authentication

### Step-by-Step Backend Deployment

#### 1. Create Render Account
```
1. Go to https://render.com
2. Sign up (free plan)
3. Verify your email
```

#### 2. Prepare Backend for Deployment

Create `backend/.env.production`:
```
NODE_ENV=production
PORT=10000
```

Update `backend/server.js` to use environment port:
```javascript
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

#### 3. Deploy to Render

```
1. Login to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect to GitHub repository
4. Configure:
   - Name: bulk-mailer-backend
   - Environment: Node
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start
   - Plan: Free
5. Click "Create Web Service"
```

**Backend URL**: `https://bulk-mailer-backend.onrender.com`

#### 4. Render Cold Starts
Render free tier services spin down after 15 minutes of inactivity.
- First request takes 30 seconds to wake up
- Subsequent requests are normal
- To avoid this, upgrade to paid plan or add a keep-alive service

### Keep-Alive Service (Free)
Use a free monitoring service to ping your backend every 10 minutes:
```
Go to UptimeRobot.com → Sign up → Add monitor:
- URL: https://bulk-mailer-backend.onrender.com/health
- Check interval: 10 minutes
```

---

## Part 3: Connect Frontend to Backend

### Update Frontend API Configuration

Update `frontend/src/main.jsx`:
```javascript
window.API_BASE_URL = 'https://bulk-mailer-backend.onrender.com';
```

OR use environment variables in `frontend/.env.production`:
```
VITE_API_URL=https://bulk-mailer-backend.onrender.com
```

Update all axios calls in your components to use this URL.

### CORS Configuration

Ensure your backend `server.js` has proper CORS:
```javascript
app.use(cors({
  origin: [
    'https://your-project.pages.dev',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));
```

---

## Part 4: Data Persistence

### Problem with Current Setup
- Using JSON file (`data.json`) works locally
- Won't persist on Render (ephemeral filesystem)
- Each deployment resets the file

### Solution Options

#### Option A: Use Render PostgreSQL (Recommended)
```
1. In Render Dashboard → PostgreSQL → Create Database
2. Free tier: 256MB storage
3. Update your Node.js code to use PostgreSQL
```

#### Option B: Use Cloudflare KV Storage (Recommended for simplicity)
```
1. In Cloudflare Workers KV → Create namespace
2. Update your backend to use KV for storage
3. Free tier: 100,000 reads/day
```

#### Option C: Keep JSON on GitHub (Temporary)
```
Store data.json in a private GitHub repo
Read/write via GitHub API
Limited to GitHub API rate limits
```

**For now, Option A (PostgreSQL) is simplest:**

#### Setup PostgreSQL on Render
```
1. Create Render account
2. Go to Dashboard → PostgreSQL
3. Click "New PostgreSQL"
4. Name: bulk-mailer-db
5. Region: US East (closest to you)
6. PostgreSQL Version: 15
7. Plan: Free
8. Create
9. Copy connection string
```

#### Connect Backend to PostgreSQL
```javascript
// backend/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function readDB() {
  // Query from PostgreSQL instead of reading JSON
}
```

**Add DATABASE_URL to Render Environment Variables**

---

## Part 5: Update GitHub & Redeploy

```bash
# Add Cloudflare & Render configuration files
git add .

# Commit changes
git commit -m "Add Cloudflare and Render deployment configs"

# Push to GitHub (triggers auto-deploy on both Cloudflare & Render)
git push origin main
```

Both services auto-deploy on GitHub push!

---

## Part 6: Domain Setup (Optional)

### Add Custom Domain to Cloudflare Pages
```
1. In Cloudflare Pages project → Custom domains
2. Add your domain (if you own one)
3. Update DNS records as shown
```

### Add Custom Domain to Render
```
1. In Render Web Service → Settings
2. Add custom domain
3. Update DNS at your domain registrar
```

---

## Testing Your Deployment

### Test Frontend
```
Visit: https://your-project.pages.dev
Check browser console for any errors
```

### Test Backend
```
curl https://bulk-mailer-backend.onrender.com/health
```

### Test API Connection
```
In browser console:
fetch('https://bulk-mailer-backend.onrender.com/users')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Login Test
```
1. Go to https://your-project.pages.dev
2. Login with: superadmin@mailer.com / superadmin123
3. Test bulk email feature
```

---

## Free Tier Limits & Considerations

| Service | Free Limit | Notes |
|---------|-----------|-------|
| **Cloudflare Pages** | Unlimited | Bandwidth, storage limited per month |
| **Render** | 750 hrs/month | ~1 service continuously |
| **PostgreSQL** | 256MB | 1 database per account |
| **Email (Nodemailer)** | Depends on SMTP | Use your own email service |

---

## Cost Estimate
- **Frontend (Cloudflare Pages)**: FREE
- **Backend (Render)**: FREE (with cold starts)
- **Database (PostgreSQL)**: FREE (256MB)
- **Total Monthly Cost**: **$0.00**

---

## Troubleshooting

### Frontend shows blank page
```
1. Check browser console for errors
2. Verify API_URL is correct
3. Check CORS settings on backend
```

### API calls failing
```
1. Verify backend is running (visit /health)
2. Check CORS origin in server.js
3. Verify API_URL in frontend
```

### Database not persisting data
```
1. Check DATABASE_URL is set in Render
2. Run migrations if needed
3. Verify PostgreSQL is running
```

### Render service sleeping (cold start)
```
1. Upgrade to paid plan, OR
2. Use UptimeRobot to keep it warm, OR
3. Use Cloudflare Workers + KV (complex)
```

---

## Alternative: All-in-One Cloudflare Workers (Advanced)

If you want everything on Cloudflare:

1. **Cloudflare Pages** (Frontend)
2. **Cloudflare Workers** (Backend API)
3. **Cloudflare KV** (Database)

This requires rewriting your backend as serverless functions. Not recommended for beginners.

---

## Next Steps

1. Create Cloudflare account
2. Deploy frontend to Pages
3. Create Render account
4. Deploy backend to Render
5. Update API URLs in frontend
6. Migrate database to PostgreSQL
7. Test everything
8. Set up custom domain (optional)

---

## Support Resources

- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Render**: https://render.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Nodemailer**: https://nodemailer.com/

---

**Happy Deployment! 🚀**
