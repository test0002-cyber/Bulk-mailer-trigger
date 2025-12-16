# 🎯 Quick Reference - Data Storage

## 📍 Where Everything is Saved

```
File Location: /home/shubhamdhyani/Downloads/mailer/backend/data.json
```

---

## 📦 What's Inside data.json

```json
{
  "users": [
    {
      "id": "unique_id",
      "email": "user@example.com",
      "password": "$2a$10$hashed_password",
      "name": "User Name",
      "role": "superadmin|admin|user",
      "isActive": true,
      "createdAt": "2025-12-16T09:21:29.583Z"
    }
  ],
  "senders": [
    {
      "id": "unique_id",
      "name": "Sender Name",
      "email": "sender@gmail.com",
      "password": "smtp_password",
      "host": "smtp.gmail.com",
      "port": 587,
      "createdAt": "2025-12-16T11:03:17.845Z"
    }
  ]
}
```

---

## 🔄 Data Flow

### Adding a User
```
Frontend (UserManagement.jsx)
    ↓
Backend (userRoutes.js)
    ↓
Read data.json
    ↓
Add user to users array
    ↓
Write updated data.json
    ↓
Show success message
```

### Adding a Sender
```
Frontend (SenderModal.jsx)
    ↓
Backend (senderRoutes.js)
    ↓
Read data.json
    ↓
Add sender to senders array
    ↓
Write updated data.json
    ↓
Show success message
```

---

## 📂 File Structure

```
mailer/
├── backend/
│   ├── db.js           ← Reads/writes data.json
│   ├── data.json       ← 📍 ALL DATA STORED HERE
│   ├── routes/
│   │   ├── userRoutes.js       ← User CRUD
│   │   └── senderRoutes.js     ← Sender CRUD
│   └── server.js
└── frontend/
    └── src/components/
        ├── UserManagement.jsx  ← Shows users
        └── SenderModal.jsx     ← Shows senders
```

---

## 🔐 Current System Users

### Users in data.json
```
1. superadmin@mailer.com (password: superadmin123)
2. shubham.dhyani@singleinterface.com (superadmin)
3. shubham.dhyani+1@singleinterface.com (user)
4. shubham.dhyani+001@singleinterface.com (user - disabled)
```

### Senders in data.json
```
1. shubham (shubhamdhyani5144@gmail.com)
   - SMTP: smtp.gmail.com:587
```

---

## 🛠️ Common Tasks

### View All Data
```bash
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json
```

### Pretty Print JSON
```bash
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq .
```

### Edit Manually
```bash
nano /home/shubhamdhyani/Downloads/mailer/backend/data.json
```

### Backup Data
```bash
cp /home/shubhamdhyani/Downloads/mailer/backend/data.json \
   /home/shubhamdhyani/Downloads/mailer/backend/data.json.backup
```

### Reset to Default
```bash
rm /home/shubhamdhyani/Downloads/mailer/backend/data.json
# Restart backend - will recreate with default superadmin
```

---

## 📊 Data Schema

### User Object
| Field | Type | Example |
|-------|------|---------|
| id | string | "1765876889523" |
| email | string | "user@example.com" |
| password | string (hashed) | "$2a$10$..." |
| name | string | "John Doe" |
| role | string | "superadmin" / "admin" / "user" |
| isActive | boolean | true |
| createdAt | ISO string | "2025-12-16T09:21:29.583Z" |

### Sender Object
| Field | Type | Example |
|-------|------|---------|
| id | string | "1765882997845" |
| name | string | "Gmail Account" |
| email | string | "sender@gmail.com" |
| password | string | "app_password" |
| host | string | "smtp.gmail.com" |
| port | number | 587 |
| createdAt | ISO string | "2025-12-16T11:03:17.845Z" |

---

## 💾 Important Notes

✅ **Automatic Saving**
- All changes via UI are automatically saved to data.json
- No manual save required

✅ **Persistent Storage**
- Data survives server restarts
- File-based, not in-memory

⚠️ **Security**
- Passwords are hashed with bcrypt
- Sender SMTP passwords stored as plaintext (consider encryption)

⚠️ **Backup**
- Keep backups of data.json
- Losing this file = losing all data

⚠️ **Single File**
- All data in one JSON file
- Good for development, not scalable for production

---

## 🚀 Quick Start

1. **Check current data:**
   ```bash
   cd /home/shubhamdhyani/Downloads/mailer/backend
   cat data.json | jq .
   ```

2. **Create new user:**
   - Open application
   - Go to User Management (if superadmin)
   - Click "Add New User"
   - Fill form and save
   - Check data.json to see it was added

3. **Add new sender:**
   - Click "Setup Sender" button
   - Click "Add New Sender"
   - Fill SMTP details
   - Save
   - Check data.json to see it was added

4. **View changes:**
   ```bash
   cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq .
   ```

---

**Version:** 1.0  
**Last Updated:** December 16, 2025
