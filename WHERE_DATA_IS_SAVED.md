# 📍 Data Storage Location & Access Guide

## 🎯 The Answer: Where Data is Saved

### 📁 File Location
```
/home/shubhamdhyani/Downloads/mailer/backend/data.json
```

### 📊 File Details
```
Owner:        shubhamdhyani
Permissions:  rw-rw-r-- (664)
File Size:    1.6 KB
Format:       JSON (text-based)
Last Modified: Dec 16 16:33
Backup:       Manual (none yet)
```

---

## 🗂️ What's Stored in data.json

### 1️⃣ User Management Details
```json
{
  "users": [
    {
      "id": "unique_identifier",
      "email": "user@example.com",
      "password": "$2a$10$bcrypt_hashed_password",
      "name": "User Name",
      "role": "superadmin | admin | user",
      "isActive": true,
      "createdBy": "creator_user_id",
      "createdAt": "ISO_timestamp"
    }
  ]
}
```

### 2️⃣ Sender Setup Details
```json
{
  "senders": [
    {
      "id": "unique_identifier",
      "name": "Sender Display Name",
      "email": "sender@gmail.com",
      "password": "smtp_password",
      "host": "smtp.gmail.com",
      "port": 587,
      "createdAt": "ISO_timestamp"
    }
  ]
}
```

---

## 📝 How to Access the Data

### Option 1: View in Terminal
```bash
# Simple view
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json

# Pretty print
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq .

# View specific section
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq '.users'
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq '.senders'
```

### Option 2: Edit in Text Editor
```bash
# Nano
nano /home/shubhamdhyani/Downloads/mailer/backend/data.json

# VS Code
code /home/shubhamdhyani/Downloads/mailer/backend/data.json

# Vim
vim /home/shubhamdhyani/Downloads/mailer/backend/data.json
```

### Option 3: View in Application
```
1. Open http://localhost:5174
2. Login as superadmin
3. Go to User Management or Sender Setup
4. All data from data.json displayed in UI
```

### Option 4: API Request
```bash
# Get all users
curl http://localhost:5000/auth/users

# Get all senders
curl http://localhost:5000/senders
```

---

## 🔄 How Data Flows From UI to File

### User Creates a New User

```
1. USER INTERFACE (Frontend)
   └─ UserManagement.jsx
      └─ User clicks "Add New User"
      └─ Fills form (email, password, role, name)
      └─ Clicks "Create"

2. HTTP REQUEST
   └─ POST http://localhost:5000/auth/register
      └─ Body: { email, password, name, role }

3. BACKEND (Node.js/Express)
   └─ userRoutes.js receives request
   └─ Validates input
   └─ Hashes password with bcrypt
   └─ Creates user object
   └─ Calls readDB()
      └─ Reads /backend/data.json from disk
      └─ Returns parsed JSON object

4. MODIFY DATA
   └─ db.users.push(newUser)
   └─ User added to array in memory

5. SAVE TO FILE
   └─ writeDB(db)
   └─ fs.writeFileSync()
      └─ Writes updated data to /backend/data.json
      └─ File updated on disk ✓

6. RESPONSE TO FRONTEND
   └─ Return { success: true, user: newUser }

7. FRONTEND UPDATE
   └─ Show success message
   └─ Refresh user list
   └─ Display new user in table
```

---

## 💾 File Structure (Complete)

```
/home/shubhamdhyani/Downloads/mailer/
│
├── backend/
│   ├── data.json ◄─────────────────────── 📍 MAIN DATABASE FILE
│   │              (All data stored here)
│   │
│   ├── db.js
│   │   ├─ readDB()   → Opens data.json, parses JSON
│   │   ├─ writeDB()  → Converts to JSON, saves to disk
│   │   └─ initializeDB() → Creates file if missing
│   │
│   ├── routes/
│   │   ├─ userRoutes.js
│   │   │  ├─ POST /auth/register   → readDB → add user → writeDB
│   │   │  ├─ GET /auth/users       → readDB → return users
│   │   │  ├─ PUT /auth/users/:id   → readDB → modify → writeDB
│   │   │  └─ DELETE /auth/users/:id → readDB → remove → writeDB
│   │   │
│   │   ├─ senderRoutes.js
│   │   │  ├─ POST /senders         → readDB → add sender → writeDB
│   │   │  ├─ GET /senders          → readDB → return senders
│   │   │  ├─ PUT /senders/:id      → readDB → modify → writeDB
│   │   │  └─ DELETE /senders/:id   → readDB → remove → writeDB
│   │   │
│   │   └─ emailRoutes.js
│   │      ├─ POST /send-email      → Gets sender from readDB()
│   │      └─ POST /test-sender     → Gets sender from readDB()
│   │
│   └─ server.js (Main Express server)
│
└── frontend/
    └─ src/components/
       ├─ UserManagement.jsx (UI for user CRUD)
       └─ SenderModal.jsx (UI for sender CRUD)
```

---

## 🚀 File Operations Summary

| Operation | What Happens | Result |
|-----------|--------------|--------|
| **User opens app** | `readDB()` called | data.json read from disk |
| **User creates user** | `readDB()` → modify → `writeDB()` | data.json updated on disk |
| **User creates sender** | `readDB()` → modify → `writeDB()` | data.json updated on disk |
| **User disables user** | `readDB()` → modify → `writeDB()` | data.json updated on disk |
| **User deletes sender** | `readDB()` → modify → `writeDB()` | data.json updated on disk |
| **Server restarts** | data.json still exists | All data preserved |
| **App crashes** | data.json still exists | All data preserved |

---

## 🔐 Data Persistence

### What Happens When Data is Created

1. **In Memory**: Created in Node.js process
2. **On Disk**: Saved to `/backend/data.json` immediately
3. **Persists**: Survives server restart
4. **Backup**: Manual only (no automatic backup)

### Data Lifecycle

```
Create User in UI
    ↓ (HTTP POST)
Backend receives request
    ↓ (Validation)
Valid? ✓
    ↓ (Read from disk)
data.json loaded into memory
    ↓ (Modify)
New user added to users array
    ↓ (Write to disk)
Updated data.json written back to disk ← 📍 PERSISTED!
    ↓ (Response)
Frontend receives success
    ↓ (UI Update)
User sees new user in list
```

---

## 🔍 Current Data in data.json

### Users
```
✓ 4 users total
├─ 2 superadmin
├─ 0 admin
├─ 2 user
├─ 3 active
└─ 1 inactive
```

### Senders
```
✓ 1 sender configured
├─ Email: shubhamdhyani5144@gmail.com
├─ SMTP: smtp.gmail.com:587
└─ Status: Ready
```

---

## 💡 Key Points to Remember

### ✅ Automatic
- Every change via UI saves automatically
- No manual save needed
- Changes visible immediately

### ✅ Persistent
- Data survives server restarts
- Data survives app crashes
- Data survives power cycles

### ✅ Single File
- One JSON file = entire database
- Easy to understand
- Easy to backup

### ⚠️ Manual Backup
- No automatic backup system
- Losing data.json = losing all data
- Should backup regularly

### ⚠️ Not Production-Ready
- JSON file database fine for dev/testing
- For production: Use SQL/NoSQL database
- Current limit: ~1000 users

---

## 🛡️ Backup Strategy

### Create Backup
```bash
# One-time backup
cp /home/shubhamdhyani/Downloads/mailer/backend/data.json \
   /home/shubhamdhyani/Downloads/mailer/backend/data.json.backup

# Timestamped backup
cp /home/shubhamdhyani/Downloads/mailer/backend/data.json \
   /home/shubhamdhyani/Downloads/mailer/backend/data.json.backup-$(date +%Y%m%d-%H%M%S)
```

### Restore from Backup
```bash
# Restore latest backup
cp /home/shubhamdhyani/Downloads/mailer/backend/data.json.backup \
   /home/shubhamdhyani/Downloads/mailer/backend/data.json

# Restart backend to reload data
cd /home/shubhamdhyani/Downloads/mailer/backend
npm start
```

### Schedule Automated Backup (Linux Cron)
```bash
# Edit crontab
crontab -e

# Add this line (backup every day at 2 AM)
0 2 * * * cp /home/shubhamdhyani/Downloads/mailer/backend/data.json /home/shubhamdhyani/Downloads/mailer/backups/data.json.$(date +\%Y\%m\%d-\%H\%M\%S)
```

---

## 🔄 File Modification Timeline

```
2025-12-16 09:09:16 → superadmin@mailer.com created (default)
2025-12-16 09:21:29 → shubham (superadmin) created
2025-12-16 09:22:12 → shubham.dhyani+1@... (user) created
2025-12-16 09:22:44 → shubham.dhyani+001@... (user) created
2025-12-16 11:03:17 → shubham sender added
2025-12-16 16:33:00 → Last modification (today)
```

---

## 📌 Most Important Facts

1. **Single Source of Truth**: `/home/shubhamdhyani/Downloads/mailer/backend/data.json`

2. **Everything Saved Here**:
   - All users (4 total)
   - All senders (1 total)
   - All credentials
   - All configurations

3. **Auto-Updated**: Every change via UI saves immediately

4. **Manual Backup**: No automatic backups - do it yourself

5. **Easy to Restore**: Just restore data.json and restart backend

---

## ✅ Next Steps

1. **Review Current Data**
   ```bash
   cat /home/shubhamdhyani/Downloads/mailer/backend/data.json
   ```

2. **Create First Backup**
   ```bash
   cp /home/shubhamdhyani/Downloads/mailer/backend/data.json \
      /home/shubhamdhyani/Downloads/mailer/backend/data.json.backup-original
   ```

3. **Start Using System**
   ```
   Open http://localhost:5174
   Login with superadmin credentials
   Create new users and senders
   ```

4. **Monitor Changes**
   ```bash
   watch -n 5 'cat /home/shubhamdhyani/Downloads/mailer/backend/data.json'
   ```

---

**Version:** 2.0  
**Comprehensive:** ✅ YES  
**Updated:** December 16, 2025  
**Status:** READY FOR USE
