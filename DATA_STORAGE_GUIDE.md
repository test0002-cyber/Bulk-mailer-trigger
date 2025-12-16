# 📦 Data Storage Guide - User Management & Sender Setup

## 📍 Where Data is Stored

All user management and sender setup details are saved in a **JSON file database** located at:

```
/home/shubhamdhyani/Downloads/mailer/backend/data.json
```

---

## 📂 Database Structure

The `data.json` file contains two main collections:

```json
{
  "users": [ ... ],      // User management data
  "senders": [ ... ]     // Sender setup data
}
```

---

## 👥 Users Collection

### Location
```
data.json → users[]
```

### Data Structure
```json
{
  "id": "1765876889523",
  "email": "shubham.dhyani@singleinterface.com",
  "password": "$2a$10$1AMMO.rWZiqxGbS3amU1p...",  // Hashed with bcrypt
  "name": "shubham",
  "role": "superadmin",                           // superadmin | admin | user
  "isActive": true,
  "createdBy": "1",                               // ID of user who created this user
  "createdAt": "2025-12-16T09:21:29.583Z"
}
```

### User Roles
| Role | Permissions | File Access |
|------|------------|------------|
| **superadmin** | Full access - create/edit/delete users and senders | `data.json` |
| **admin** | Can manage users but limited access | `data.json` |
| **user** | Can only use bulk email feature | `data.json` |

### Current Users in System
```
1. superadmin@mailer.com (default superadmin)
2. shubham.dhyani@singleinterface.com (superadmin - created by you)
3. shubham.dhyani+1@singleinterface.com (user - active)
4. shubham.dhyani+001@singleinterface.com (user - inactive)
```

---

## 📧 Senders Collection

### Location
```
data.json → senders[]
```

### Data Structure
```json
{
  "id": "1765882997845",
  "name": "shubham",
  "email": "shubhamdhyani5144@gmail.com",
  "password": "ajsdnsa dlsandlksand",             // SMTP password (plaintext stored)
  "host": "smtp.gmail.com",                      // SMTP server host
  "port": 587,                                   // SMTP port (usually 587 or 465)
  "createdAt": "2025-12-16T11:03:17.845Z"
}
```

### Current Senders in System
```
1. shubham (shubhamdhyani5144@gmail.com)
   - Host: smtp.gmail.com
   - Port: 587
```

---

## 🔧 How Data is Managed

### Backend Operations

#### 1. **Reading Data** (`readDB()`)
```javascript
// File: backend/db.js
function readDB() {
  if (!fs.existsSync(dbPath)) {
    initializeDB()
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
}
```

#### 2. **Writing Data** (`writeDB()`)
```javascript
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}
```

#### 3. **Initialization** (`initializeDB()`)
```javascript
function initializeDB() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [
        {
          id: '1',
          email: 'superadmin@mailer.com',
          password: bcrypt.hashSync('superadmin123', 10),
          name: 'Super Admin',
          role: 'superadmin',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      senders: []
    }
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2))
  }
}
```

---

## 🔄 Data Operations

### User Management Operations

#### Creating a User
```
Frontend: UserManagement.jsx
    ↓
Backend: userRoutes.js → POST /auth/register
    ↓
Reads current data.json
    ↓
Adds new user with bcrypt-hashed password
    ↓
Writes updated data back to data.json
```

#### Updating User Status (Enable/Disable)
```
Frontend: UserManagement.jsx
    ↓
Backend: userRoutes.js → PUT /auth/users/:userId
    ↓
Updates isActive flag
    ↓
Writes to data.json
```

#### Retrieving All Users
```
Frontend: UserManagement.jsx
    ↓
Backend: userRoutes.js → GET /auth/users
    ↓
Reads data.json
    ↓
Returns users array
```

---

### Sender Setup Operations

#### Creating a Sender
```
Frontend: SenderModal.jsx
    ↓
Backend: senderRoutes.js → POST /senders
    ↓
Reads current data.json
    ↓
Adds new sender with SMTP details
    ↓
Writes updated data back to data.json
```

#### Retrieving All Senders
```
Frontend: SenderModal.jsx
    ↓
Backend: senderRoutes.js → GET /senders
    ↓
Reads data.json
    ↓
Returns senders array
```

#### Testing Sender Connection
```
Frontend: SenderModal.jsx
    ↓
Backend: emailRoutes.js → POST /test-sender
    ↓
Gets sender from data.json
    ↓
Tests nodemailer connection
    ↓
Returns success/failure
```

#### Deleting a Sender
```
Frontend: SenderModal.jsx
    ↓
Backend: senderRoutes.js → DELETE /senders/:senderId
    ↓
Reads data.json
    ↓
Removes sender from senders array
    ↓
Writes updated data back to data.json
```

---

## 📊 File Location Hierarchy

```
/home/shubhamdhyani/Downloads/mailer/
│
├── backend/
│   ├── db.js                    ← Database functions
│   ├── data.json               ← 📍 ACTUAL DATA STORED HERE
│   ├── server.js               ← Express server
│   ├── routes/
│   │   ├── userRoutes.js       ← User CRUD operations
│   │   ├── senderRoutes.js     ← Sender CRUD operations
│   │   └── emailRoutes.js      ← Email sending
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserManagement.jsx  ← User management UI
│   │   │   └── SenderModal.jsx     ← Sender setup UI
│   │   └── App.jsx
│   └── package.json
│
└── data.json  ← Same as backend/data.json
```

---

## 🔐 Security Considerations

### Passwords
- **User Passwords:** Hashed with bcrypt (10 salt rounds)
  ```javascript
  bcrypt.hashSync(password, 10)
  ```
- **Sender SMTP Passwords:** Stored as plaintext ⚠️ (Consider encryption for production)

### Access Control
- SuperAdmin: Full access to all data
- Admin: Limited user management access
- User: Read-only access to their own data

### Best Practices
1. **Backup data.json regularly** - It's your entire database
2. **Never commit data.json to Git** - Add to `.gitignore`
3. **Encrypt sender SMTP passwords** in production
4. **Use environment variables** for sensitive config

---

## 📝 Example: How User Creation Flows

### Step-by-Step Data Flow

**1. User clicks "Create User" in UI**
```
UserManagement.jsx → handleAddUser()
```

**2. Frontend sends POST request**
```javascript
fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User',
    role: 'admin'
  })
})
```

**3. Backend receives request**
```javascript
// userRoutes.js
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body
  
  // Read current data
  const db = readDB()
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    password: bcrypt.hashSync(password, 10),  // Hash password
    name,
    role,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  
  // Add to users array
  db.users.push(newUser)
  
  // Write back to data.json
  writeDB(db)
  
  // Return response
  res.json({ message: 'User created', user: newUser })
})
```

**4. Frontend receives response**
```javascript
// Update UI with success message
setSuccess('User created successfully!')

// Reload users list
loadUsers()
```

**5. Check data.json**
```json
{
  "users": [
    // ... existing users
    {
      "id": "1765882000000",
      "email": "newuser@example.com",
      "password": "$2a$10$...",  // Hashed
      "name": "New User",
      "role": "admin",
      "isActive": true,
      "createdAt": "2025-12-16T12:00:00.000Z"
    }
  ]
}
```

---

## 🚀 Accessing the Data

### Method 1: Direct File Access
```bash
# View the file
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json

# Edit the file manually
nano /home/shubhamdhyani/Downloads/mailer/backend/data.json

# Pretty print JSON
cat /home/shubhamdhyani/Downloads/mailer/backend/data.json | jq .
```

### Method 2: Through Application UI
```
1. Login to application
2. Go to User Management (SuperAdmin only)
3. View/create/edit/delete users
4. Go to Sender Setup
5. View/create/edit/delete senders
```

### Method 3: Through Backend API
```bash
# Get all users
curl http://localhost:5000/auth/users

# Get all senders
curl http://localhost:5000/senders
```

---

## 📋 Summary Table

| Item | Location | Format | Managed By |
|------|----------|--------|-----------|
| **Users** | `data.json → users[]` | JSON objects | userRoutes.js |
| **Senders** | `data.json → senders[]` | JSON objects | senderRoutes.js |
| **File** | `/backend/data.json` | JSON | fs (Node.js) |
| **Database Type** | File-based JSON | Plain text | No external DB needed |
| **Password Encryption** | bcrypt | SHA256 hash | bcryptjs library |

---

## ⚠️ Important Notes

1. **Single JSON File Database**
   - All data in one file: `data.json`
   - No SQL database
   - Simple but not scalable for production

2. **Auto-Initialization**
   - If `data.json` doesn't exist, it's created with default superadmin
   - Happens on first backend startup

3. **Data Persistence**
   - Every time you create/edit a user or sender, `data.json` is updated
   - Changes are immediately persistent
   - Survives server restarts

4. **Backup Strategy**
   - **Important:** Keep backups of `data.json`
   - This file contains all your application data
   - Losing it means losing all users and senders

---

## 🔄 Migration to Production Database

When ready to scale, consider migrating from JSON to:
- ✅ MongoDB
- ✅ PostgreSQL  
- ✅ MySQL
- ✅ SQLite

The code would need updates to the `db.js` functions to use database drivers instead of fs operations.

---

**Version:** 1.0  
**Last Updated:** December 16, 2025  
**Status:** ✅ Complete
