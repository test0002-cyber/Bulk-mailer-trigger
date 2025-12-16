# Application Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                 │
│                    http://localhost:5173                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      App.jsx (Root)                     │   │
│  │  - Manages user state, token, and role-based routing   │   │
│  └────────┬──────────────────────────────────────────────┬─┘   │
│           │                                                │    │
│    ┌──────▼──────┐                            ┌──────────▼──┐  │
│    │ No User?    │                            │ User Logged │  │
│    │ Show:       │                            │ Show:       │  │
│    │ AuthLogin   │                            │ Header +    │  │
│    │             │                            │ Role-based  │  │
│    │ - Login     │                            │ Dashboard   │  │
│    │ - Demo creds│                            │             │  │
│    └─────────────┘                            └─┬──────────┬─┘  │
│                                                  │          │    │
│                                   ┌──────────────▼──┐   ┌──┴───┴───┐
│                                   │ role =          │   │ role =   │
│                                   │ 'superadmin'?   │   │ 'admin'  │
│                                   │                 │   │ or user? │
│                                   ▼                 │   ▼          │
│                            ┌──────────────┐        │  ┌──────────┐│
│                            │SuperAdmin    │        │  │ Mailer   ││
│                            │Dashboard     │        │  │ Interface││
│                            │              │        │  │          ││
│                            │- User list   │        │  │- CSV     ││
│                            │- Create users│        │  │  import  ││
│                            │- Enable/     │        │  │- Template││
│                            │  disable     │        │  │  builder ││
│                            └──────────────┘        │  │- Preview ││
│                                                     │  │- Send    ││
│                                                     │  │  emails  ││
│                                                     │  └──────────┘│
│                                                     │              │
│  ┌─────────────────────────────────────────────────┴──────────────┐
│  │                      Header Component                          │
│  │  - Sender setup button (opens SenderModal)                    │
│  │  - User menu with email and logout button                     │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API calls via Axios
                              │ /api/* routes proxied to backend
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                      Backend (Express)                             │
│                   http://localhost:5000                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              Middleware                                  │   │
│  │  - CORS enabled                                          │   │
│  │  - Body parser (JSON & URL-encoded)                      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────┐         ┌──────────────────────┐     │
│  │  User Routes (/auth)   │         │ Email Routes         │     │
│  │                        │         │                      │     │
│  │ - POST /login          │         │ - POST /send-email   │     │
│  │ - POST /register       │         │                      │     │
│  │ - GET /users           │         │ Sends bulk emails    │     │
│  │ - PUT /:id/enable      │         │ via Nodemailer       │     │
│  │ - PUT /:id/disable     │         │                      │     │
│  │                        │         │ (Future: integrate   │     │
│  │ Requires JWT token     │         │  with real SMTP)     │     │
│  │ for protected routes   │         │                      │     │
│  └───────┬────────────────┘         └──────────────────────┘     │
│          │                                                         │
│  ┌───────▼────────────────┐                                       │
│  │  Auth Utilities        │                                       │
│  │  (auth.js)             │                                       │
│  │                        │                                       │
│  │ - generateToken()      │                                       │
│  │ - verifyToken()        │                                       │
│  │ - authMiddleware       │                                       │
│  │ - roleCheck()          │                                       │
│  │                        │                                       │
│  │ Uses JWT with secret   │                                       │
│  │ Exp: 30 days           │                                       │
│  └────────────────────────┘                                       │
│                                                                     │
│  ┌────────────────────────┐                                       │
│  │  Database (data.json)  │                                       │
│  │                        │                                       │
│  │ {                      │                                       │
│  │   "users": [           │                                       │
│  │     {                  │                                       │
│  │       id,              │                                       │
│  │       email,           │                                       │
│  │       password (hash), │                                       │
│  │       name,            │                                       │
│  │       role,            │                                       │
│  │       isActive,        │                                       │
│  │       createdAt,       │                                       │
│  │       createdBy        │                                       │
│  │     }                  │                                       │
│  │   ]                    │                                       │
│  │ }                      │                                       │
│  └────────────────────────┘                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

```
┌─────────────┐
│   Visit     │
│ App (No     │
│ Token)      │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  AuthLogin Page     │
│  - Email input      │
│  - Password input   │
│  - Demo creds show  │
└──────┬──────────────┘
       │
       │ Enter credentials
       │
       ▼
┌──────────────────────────┐
│ POST /api/auth/login     │
│ (validated, hashed pwd)  │
└──────┬───────────────────┘
       │
       ├─ Success ─────────┐
       │                   │
       ▼                   ▼
  Get token          Save token +
  Get user           user to
  object with        localStorage
  role
       │
       ├─ role='superadmin' ────────┐
       │                             │
       ├─ role='admin'  or 'user' ──┤
       │                             │
       ▼                             ▼
   ┌────────────────┐        ┌──────────────┐
   │ Mailer UI      │        │SuperAdmin    │
   │                │        │Dashboard     │
   │- CSV import    │        │              │
   │- Template edit │        │- Users list  │
   │- Preview       │        │- Create user │
   │- Send emails   │        │- Manage      │
   │- Sender mgmt   │        │  roles       │
   │                │        │- Enable/     │
   │                │        │  disable     │
   └─────────┬──────┘        └──────────────┘
             │
             │ Logout
             ▼
    localStorage.clear()
    Back to AuthLogin
```

## Key Features Flow

### 1. Email Sending Flow

```
User uploads CSV
        │
        ▼
Parse CSV with PapaParse
        │
        ├─ Extract column names
        │
        ├─ Show as variable buttons
        │
        ▼
User fills template fields
(To, CC, BCC, Subject, Body)
        │
        ├─ Type directly
        │
        ├─ Click column buttons
        │   to insert {{variables}}
        │
        ▼
Update preview with first row
(Replace variables with first row values)
        │
        ▼
User clicks "Send"
        │
        ▼
For each CSV row:
  │
  ├─ Replace {{variables}} with row values
  │
  ├─ Prepare email object:
  │  { to, cc, bcc, subject, message }
  │
  ├─ POST /api/send-email
  │
  └─ Get response
        │
        ▼
Done! All emails sent
```

### 2. User Management Flow (SuperAdmin Only)

```
SuperAdmin logs in
        │
        ▼
Sees SuperAdminDashboard
        │
        ├─ Fetch users: GET /api/auth/users
        │   (with Authorization header)
        │
        ├─ Display in table
        │
        ▼
Create new user form
        │
        ├─ Fill: email, password, name, role
        │
        ├─ POST /api/auth/register
        │   { email, password, name, role, createdBy }
        │
        ▼
Manage existing users
        │
        ├─ Enable: PUT /api/auth/users/:id/enable
        │
        ├─ Disable: PUT /api/auth/users/:id/disable
        │
        ▼
Table updates in real-time
```

## Role-Based Access Control

```
┌────────────────────────────────────────────────────────────┐
│                 RBAC Matrix                                │
├────────────────────────────────────────────────────────────┤
│ Action                    │ SuperAdmin │ Admin │ User       │
├───────────────────────────┼────────────┼───────┼────────────┤
│ View all users            │     ✓      │   ✗   │     ✗      │
│ Create users              │     ✓      │   ✗   │     ✗      │
│ Enable/disable users      │     ✓      │   ✗   │     ✗      │
│ Access mailer interface   │     ✓      │   ✓   │     ✓      │
│ Send bulk emails          │     ✓      │   ✓   │     ✓      │
│ Manage own senders        │     ✓      │   ✓   │     ✓      │
│ View sent campaigns       │     ✗*     │   ✗*  │     ✗*     │
│ (Future feature)          │            │       │            │
└────────────────────────────────────────────────────────────┘
* Planned for future enhancement
```

## Authentication Flow

```
┌──────────────────────────────────────────────┐
│  User Submits Login Form                     │
│  { email: "...", password: "..." }           │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Server: POST /auth/login                    │
│                                              │
│  1. Find user by email                       │
│  2. Compare passwords with bcrypt.compare()  │
│  3. Check if user is active (isActive=true)  │
└────────┬─────────────────────────────────────┘
         │
         ├─ ❌ Invalid credentials
         │   └─ Return 401 error
         │
         ├─ ❌ User disabled
         │   └─ Return 401 error
         │
         ✓ Success
         │
         ▼
┌──────────────────────────────────────────────┐
│  Generate JWT Token                          │
│                                              │
│  jwt.sign({                                  │
│    id, email, name, role                     │
│  }, SECRET, { expiresIn: '30d' })            │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Return to Client                            │
│  { token, user: { id, email, name, role } }  │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Client Stores:                              │
│  - localStorage.setItem('token', token)      │
│  - localStorage.setItem('user', JSON.stringify(user))
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│  Future API Requests                         │
│  Headers: { Authorization: 'Bearer ' + token }
│                                              │
│  Server verifies token with jwt.verify()     │
│  Proceeds if valid, rejects if expired/      │
│  invalid                                     │
└──────────────────────────────────────────────┘
```

## State Management

### App.jsx State Variables

```
user: {
  id: string,
  email: string,
  name: string,
  role: 'superadmin' | 'admin' | 'user'
}

token: string (JWT)

preview: {
  to: string,
  cc: string,
  bcc: string,
  subject: string,
  message: string
} | null

senderModalOpen: boolean

currentSender: {
  name: string,
  email: string,
  password: string
} | null

currentPage: 'mailer' | 'admin' (not currently used)
```

### LocalStorage Keys

```
'token'  → JWT token (Bearer auth)
'user'   → User object (JSON)
'senders' → Array of sender credentials (SenderModal)
```

## Security Considerations

```
┌─────────────────────────────────────────┐
│  Frontend Security                      │
├─────────────────────────────────────────┤
│ ✓ Token stored in localStorage          │
│ ✓ Sent as Authorization header          │
│ ✓ Password input masked (eye icon)      │
│ ✓ Session cleared on logout             │
│                                          │
│ ⚠ Improvements needed:                  │
│ - Use httpOnly cookies (not localStorage)
│ - Add CSRF protection                    │
│ - Validate inputs before sending         │
│ - Sanitize HTML outputs                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Backend Security                       │
├─────────────────────────────────────────┤
│ ✓ Passwords hashed with bcryptjs (10    │
│   salt rounds)                          │
│ ✓ JWT tokens with expiration (30 days)  │
│ ✓ Role-based access control (RBAC)      │
│ ✓ Protected routes require valid token   │
│                                          │
│ ⚠ Improvements needed:                  │
│ - Implement rate limiting                │
│ - Add request validation                 │
│ - Use HTTPS in production                │
│ - Store secrets in environment vars      │
│ - Use database instead of JSON file      │
│ - Add password reset functionality       │
│ - Implement email verification          │
└─────────────────────────────────────────┘
```
