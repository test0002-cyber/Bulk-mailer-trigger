# Cloudflare + Render Deployment Quick Reference

## 🚀 Quick Start (5 Steps)

### Step 1: Frontend to Cloudflare Pages (5 minutes)
```bash
1. Visit: https://dash.cloudflare.com
2. Login/Sign up (free account)
3. Workers & Pages → Pages → Create project
4. Connect to Git: test0002-cyber/Bulk-mailer-trigger
5. Build settings:
   - Framework: Vite
   - Build command: npm run build
   - Output: dist
6. Deploy!
```

**Your Frontend URL**: `https://your-project-name.pages.dev`

---

### Step 2: Backend to Render (5 minutes)
```bash
1. Visit: https://render.com
2. Login/Sign up (free account)
3. Create New → Web Service
4. Connect GitHub: test0002-cyber/Bulk-mailer-trigger
5. Configure:
   - Name: bulk-mailer-backend
   - Build: cd backend && npm install
   - Start: cd backend && npm start
   - Plan: Free (with cold starts)
6. Deploy!
```

**Your Backend URL**: `https://bulk-mailer-backend.onrender.com`

---

### Step 3: Create PostgreSQL Database (2 minutes)
```bash
1. In Render → Dashboard → PostgreSQL
2. New PostgreSQL Instance
3. Name: bulk-mailer-db
4. Plan: Free (256MB)
5. Create
6. Copy connection string (Internal Database URL)
```

**Save this URL** - you'll need it for the backend.

---

### Step 4: Add Environment Variables to Render
```bash
Go to Render Web Service Dashboard → Environment

Add these variables:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db_name
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=https://your-project-name.pages.dev
```

---

### Step 5: Keep Service Awake (Free)
```bash
Render free tier services sleep after 15 minutes of inactivity.
To prevent this, use UptimeRobot:

1. Visit: https://uptimerobot.com
2. Sign up (free)
3. Add Monitor → HTTP(s)
4. URL: https://bulk-mailer-backend.onrender.com/health
5. Monitoring interval: 5-10 minutes
6. Create Monitor

This keeps your service awake 24/7!
```

---

## 📋 Checklist

- [ ] Cloudflare account created
- [ ] Frontend deployed to Pages
- [ ] Render account created
- [ ] Backend deployed to Render
- [ ] PostgreSQL created on Render
- [ ] Environment variables added to Render
- [ ] UptimeRobot monitor created
- [ ] Frontend-backend connection tested

---

## 🧪 Testing Your Deployment

### Test Frontend
```bash
Visit: https://your-project-name.pages.dev
You should see the login page
```

### Test Backend
```bash
curl https://bulk-mailer-backend.onrender.com/health
You should see: {"status":"ok"}
```

### Test Full App
```bash
1. Go to https://your-project-name.pages.dev
2. Login: superadmin@mailer.com / superadmin123
3. Try the bulk email feature
4. Check the test email button works
```

---

## 🔗 Important URLs

| Service | URL | Type |
|---------|-----|------|
| Frontend | `https://your-project.pages.dev` | Live |
| Backend | `https://bulk-mailer-backend.onrender.com` | Live |
| PostgreSQL | Internal only | Database |
| GitHub Repo | `https://github.com/test0002-cyber/Bulk-mailer-trigger` | Source |

---

## 💡 Key Points

### Cloudflare Pages (Frontend)
- ✅ Unlimited bandwidth
- ✅ Global CDN
- ✅ Auto deploys on git push
- ✅ 100% free forever
- ✅ No cold starts

### Render (Backend)
- ✅ Free Node.js hosting
- ✅ Auto deploys on git push
- ✅ PostgreSQL database included
- ⚠️ Services sleep after 15 min inactivity (use UptimeRobot to keep awake)
- ⚠️ Cold start takes ~30 seconds on first request

### Total Cost
**$0/month** (forever free tier)

---

## 🚨 Troubleshooting

### "Cannot GET /" on frontend
- Wait 2-3 minutes for Cloudflare to finish deployment
- Hard refresh browser (Ctrl+Shift+R)

### API calls failing
- Check backend is running: `curl https://backend-url/health`
- Verify CORS is enabled in backend
- Check API_URL in frontend is correct

### Database errors
- Verify DATABASE_URL env var is set
- Check PostgreSQL service is running in Render
- Run migrations if needed

### Backend sleeping (slow first request)
- This is normal on free tier (cold start)
- UptimeRobot pings every 5-10 minutes to keep it warm
- Wait 30 seconds for first request to respond

---

## 📖 Next: Custom Domain (Optional)

### Add Custom Domain to Cloudflare Pages
```bash
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Cloudflare Pages → Settings → Custom domains
3. Add your domain
4. Follow DNS setup instructions
```

### Add Custom Domain to Render
```bash
1. In Render Web Service → Settings → Custom Domain
2. Add your domain
3. Update DNS records at your domain registrar
```

Example: `https://bulk-mailer.yourdomain.com`

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         Your Application Architecture           │
├─────────────────────────────────────────────────┤
│                                                 │
│  User Browser                                   │
│       ↓                                          │
│  Cloudflare Pages (Frontend)                    │
│  https://your-project.pages.dev                 │
│       ↓                                          │
│  API Calls (HTTPS)                              │
│       ↓                                          │
│  Render.com (Backend API)                       │
│  https://bulk-mailer-backend.onrender.com       │
│       ↓                                          │
│  PostgreSQL Database (Render)                   │
│  bulk-mailer-db                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📞 Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Render Docs: https://render.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- UptimeRobot Docs: https://docs.uptimerobot.com/

---

**Questions?** Check the main CLOUDFLARE_DEPLOYMENT.md file for detailed instructions.

**Ready to go live?** Follow the 5 steps above! 🚀
