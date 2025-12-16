# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Install Dependencies (One Time)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start Both Servers

Open **two separate terminals** and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

Visit: **http://localhost:5173**

### Step 4: Login with Demo Account

- **Email**: `superadmin@mailer.com`
- **Password**: `superadmin123`

---

## 📧 Send Your First Email

### As SuperAdmin:

1. Click the **⚙️ superadmin@mailer.com** button in top right
2. Click **"Create New User"** to create an Admin account
3. Logout and login with that account

### As Admin/User:

1. Click **📤 Setup Sender** button
2. Fill in your email and SMTP password (or use test email)
3. Click **"Add Sender"**

Now you can:
1. Click **"Upload CSV"** to add recipient data
2. Fill in email template fields (To, CC, BCC, Subject, Body)
3. Use `{{columnName}}` to insert dynamic values
4. View preview on the right (first row)
5. Click **"Send Emails"** to send to all recipients

---

## 🎯 Key Features

### CSV Format Example

```csv
firstName,lastName,email
John,Doe,john@example.com
Jane,Smith,jane@example.com
```

### Email Template Example

**To:** `{{email}}`  
**Subject:** `Hello {{firstName}} {{lastName}}`  
**Body:** `Dear {{firstName}}, ...`

---

## 🔐 Default Accounts

### SuperAdmin
```
Email: superadmin@mailer.com
Password: superadmin123
```

**Access:** 
- ✅ Create/manage users
- ✅ Send bulk emails
- ✅ User dashboard

### Create Your Own Accounts
Use the SuperAdmin dashboard to create Admin and User accounts.

---

## 📁 Project Structure

```
mailer/
├── backend/           # Express API server
├── frontend/          # React UI (Vite)
├── SETUP.md           # Full setup guide
└── ARCHITECTURE.md    # System design & flow
```

---

## 🛠️ Troubleshooting

### Frontend won't connect to backend?
- Check both terminals are running
- Verify backend is on `localhost:5000`
- Clear browser cache and localStorage

### Login fails?
- Use exact credentials: `superadmin@mailer.com` / `superadmin123`
- Check backend console for errors
- Ensure `data.json` exists in backend folder

### Emails won't send?
- Verify sender credentials are correct
- Check network in browser dev tools
- Ensure CSV is properly formatted

---

## 📚 Next Steps

1. **Create Admin users** from SuperAdmin dashboard
2. **Set up senders** with real email credentials
3. **Upload CSV** with real recipient data
4. **Create email templates** with dynamic variables
5. **Send your first bulk email!**

---

## 🔧 For Development

### Frontend Development
- Edit files in `frontend/src/`
- Vite hot reload automatically updates browser
- No build step needed during development

### Backend Development
- Edit files in `backend/`
- Nodemon automatically restarts server on changes
- Check terminal for errors

### Database
- User data stored in `backend/data.json`
- Can be edited directly for testing
- Automatically initialized with SuperAdmin user

---

## 📖 Full Documentation

- See `SETUP.md` for detailed setup & API endpoints
- See `ARCHITECTURE.md` for system design & flows
- Check component files for inline code comments

---

## 🎉 You're Ready!

That's it! You now have a fully functional:
- ✅ Bulk email mailer
- ✅ User management system (3 roles)
- ✅ JWT authentication
- ✅ Dynamic email templates with CSV
- ✅ Real-time preview

Start sending emails! 📧
