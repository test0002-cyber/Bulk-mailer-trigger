# Deployment Guide

## 🚀 Deploying Your Mailer Application

This guide covers deploying to free/low-cost services.

---

## Option 1: Deploy to Vercel + Render (Recommended)

### Frontend: Deploy to Vercel

Vercel makes deploying React/Vite apps extremely easy.

1. **Push code to GitHub**
   ```bash
   cd ~/Downloads/mailer
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mailer.git
   git push -u origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up with GitHub
   - Import your repository
   - Select `frontend` as root directory
   - Environment variables: Leave empty (no secrets needed)
   - Deploy!

3. **Update API URL**
   - Vercel will give you a URL like `https://mailer-frontend.vercel.app`
   - In `frontend/vite.config.js`, update proxy target:
   ```javascript
   proxy: {
     '/api': {
       target: 'https://your-backend-url.com',  // Update this
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, '')
     }
   }
   ```

### Backend: Deploy to Render

Render offers free tier with automatic deployments.

1. **Prepare for deployment**
   ```bash
   # In backend/package.json, verify you have:
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

2. **Push to GitHub** (same repo, if using monorepo)

3. **Create Render service**
   - Go to https://render.com
   - Sign up with GitHub
   - New → Web Service
   - Connect your GitHub repo
   - Configure:
     - Name: `mailer-backend`
     - Root directory: `backend`
     - Build command: `npm install`
     - Start command: `npm start`
     - Region: closest to your users

4. **Set environment variables** on Render:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here-change-this
   PORT=5000
   ```

5. **Get the backend URL**
   - Render gives you a URL like `https://mailer-backend.onrender.com`
   - Update `frontend/vite.config.js` proxy target to this

6. **Redeploy frontend** with updated API URL

---

## Option 2: Deploy to Heroku + Heroku (Or Fly.io)

### Prerequisites
- Heroku account (https://heroku.com)
- Heroku CLI installed

### Backend: Deploy to Heroku

1. **Create Heroku app**
   ```bash
   cd backend
   heroku login
   heroku create mailer-backend
   ```

2. **Set environment variables**
   ```bash
   heroku config:set JWT_SECRET="your-secret-key-here"
   heroku config:set NODE_ENV="production"
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend: Deploy to Heroku too (alternative)

You can deploy frontend to Heroku or Vercel. Since Heroku is phasing out free tier, consider Vercel.

---

## Option 3: Deploy Locally/VPS

### Self-hosted on VPS (DigitalOcean, Linode, AWS EC2)

1. **Rent a VPS** (starting ~$4/month on DigitalOcean)

2. **SSH into server**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mailer.git
   cd mailer
   ```

5. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install && npm run build
   cd ..
   ```

6. **Setup backend with PM2** (process manager)
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name "mailer-api"
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx** as reverse proxy
   ```bash
   sudo apt-get install -y nginx
   ```

   Create `/etc/nginx/sites-available/mailer`:
   ```nginx
   server {
     listen 80;
     server_name your_domain.com;

     # Frontend
     location / {
       root /path/to/mailer/frontend/dist;
       try_files $uri $uri/ /index.html;
     }

     # Backend API
     location /api {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

8. **Enable and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/mailer /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

9. **Setup HTTPS with Let's Encrypt**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your_domain.com
   ```

---

## Database Migration (Optional but Recommended)

### Migrate from JSON to MongoDB

1. **Create MongoDB Atlas account** (free tier available)
   - https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

2. **Update backend** to use MongoDB instead of JSON:
   ```bash
   npm install mongoose
   ```

3. **Create Mongoose models** for Users

4. **Replace db.js** with MongoDB connection

### OR Migrate to PostgreSQL

1. **Create Postgres database** (Render, Railway, or local)

2. **Install Postgres driver**
   ```bash
   npm install pg
   ```

3. **Create database schema** and update routes

---

## Post-Deployment Checklist

### Security
- [ ] Change default superadmin password
- [ ] Set strong JWT_SECRET in environment
- [ ] Enable HTTPS (use Let's Encrypt or managed service)
- [ ] Set CORS to specific domain (not *)
- [ ] Enable rate limiting on API
- [ ] Enable request logging and monitoring

### Functionality
- [ ] Test login with superadmin credentials
- [ ] Create test user account
- [ ] Test bulk email sending
- [ ] Verify sender credentials work
- [ ] Test CSV import and preview
- [ ] Check email delivery logs

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Set up uptime monitoring (StatusPage, UptimeRobot)
- [ ] View logs regularly for errors
- [ ] Monitor database/file storage usage
- [ ] Set up alerts for failures

### Optimization
- [ ] Enable gzip compression
- [ ] Set up CDN for frontend (CloudFlare, Fastly)
- [ ] Cache static assets
- [ ] Enable database query optimization
- [ ] Consider email queuing for bulk sends

### Backups
- [ ] Set up daily database backups
- [ ] Store backups in different region
- [ ] Test backup restoration process
- [ ] Document backup procedure

---

## Environment Variables Reference

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# Authentication
JWT_SECRET=your-super-secret-key-here-change-in-production

# Email (optional - if using external SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Database (if using MongoDB)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mailer

# Deployment
ALLOW_ORIGINS=https://your-frontend-domain.com
```

### Frontend (automatic from build)

No environment variables needed - API URL is in `vite.config.js`

---

## Cost Estimation

### Recommended Stack (Free-tier friendly)

| Service | Cost | Notes |
|---------|------|-------|
| Frontend (Vercel) | Free | 100GB bandwidth/month |
| Backend (Render) | Free tier or $7/month | Free tier sleeps after 15 min inactivity |
| Database (MongoDB Atlas) | Free | 512MB storage |
| Email (Gmail API) | Free | Limited to 10k emails/day |
| Domain (Namecheap) | ~$10/year | Or use free .vercel.app domain |
| **Total** | **~$10/year** | Can scale as needed |

### Production Stack (Recommended at scale)

| Service | Cost | Notes |
|---------|------|-------|
| Frontend (Vercel Pro) | $20/month | Better performance |
| Backend (AWS App Runner) | $5+ /month | Auto-scaling |
| Database (AWS RDS) | $15+ /month | PostgreSQL/MySQL |
| Email Service (SendGrid) | ~$20/month | 40k emails/month |
| Domain | $10/year | Custom domain |
| **Total** | **~$60+/month** | Professional setup |

---

## Scaling Considerations

### As Your Application Grows

1. **Database**
   - Move from JSON to proper database (PostgreSQL/MongoDB)
   - Add indexes for faster queries
   - Consider read replicas

2. **Email Service**
   - Switch from Nodemailer to SendGrid/AWS SES
   - Better deliverability and tracking
   - More reliable bulk sending

3. **Background Jobs**
   - Implement job queue (Bull, RabbitMQ)
   - Send emails asynchronously
   - Add email scheduling

4. **Frontend**
   - Add PWA support
   - Implement service workers
   - Add offline functionality

5. **Infrastructure**
   - Use load balancing
   - Add caching layer (Redis)
   - Implement CDN for assets
   - Use monitoring and alerting

---

## Common Issues & Solutions

### Issue: Backend not accessible from frontend
**Solution:** Update API proxy URL in vite.config.js and redeploy frontend

### Issue: Database file not found on deployed backend
**Solution:** Switch to proper database (MongoDB/PostgreSQL)

### Issue: Emails bouncing in production
**Solution:** 
- Use professional email service (SendGrid, AWS SES)
- Verify domain reputation
- Add proper SPF/DKIM records

### Issue: Slow email sending
**Solution:**
- Implement async/queue system
- Use background jobs
- Batch process emails

### Issue: Out of memory with large CSVs
**Solution:**
- Stream CSV parsing instead of loading all at once
- Process in chunks
- Use worker threads

---

## Support & Next Steps

1. **Monitor your deployment** - Check logs regularly
2. **Gather user feedback** - Iterate on features
3. **Plan scaling** - Prepare for growth
4. **Security hardening** - Add advanced features
5. **Marketing** - Promote your service

---

## Additional Resources

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Node.js Production Checklist: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- Express Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- React Performance: https://react.dev/learn/render-and-commit

---

**Ready to go live! 🚀**
