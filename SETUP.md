# Mailer Application - Setup & Run Guide

## Overview

This is a complete bulk email sending application with:
- **Role-based user management** (SuperAdmin, Admin, User)
- **Backend API** with JWT authentication
- **Frontend UI** with bulk email configurator and user dashboard
- **CSV bulk email** support with dynamic variable insertion

## Prerequisites

- Node.js (v16+)
- npm or yarn

## Installation

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login Credentials

### SuperAdmin Account
- **Email**: `superadmin@mailer.com`
- **Password**: `superadmin123`

## Application Flow

### 1. Login Page
- Users see the AuthLogin component on initial load
- Enter email and password to authenticate
- Token is saved to localStorage for persistent sessions

### 2. Role-Based Dashboards

#### SuperAdmin Dashboard
- View all users in the system
- Create new Admin and User accounts
- Enable/disable user accounts
- Manage system-wide settings

#### Admin/User Dashboard
- Access the bulk email configurator
- Upload CSV files with recipient data
- Create email templates with dynamic variables (e.g., {{firstName}}, {{email}})
- Manage sender credentials (email and password for SMTP)
- Preview emails before sending
- Send bulk emails to all recipients in CSV

## Features

### Bulk Email Configurator
- **CSV Import**: Upload CSV files with recipient data
- **Dynamic Variables**: Use `{{columnName}}` syntax in To, CC, BCC, Subject, and Body
- **Live Preview**: See the first email preview in real-time as you type
- **Variable Insertion**: Click column name buttons to insert variables into fields
- **Sender Management**: Save multiple sender accounts and switch between them

### User Management (SuperAdmin)
- Create new users with different roles
- Assign roles: superadmin, admin, or user
- Enable/disable user access
- View user creation date and creator

### Authentication
- JWT token-based authentication
- 30-day token expiration
- Password hashing with bcryptjs
- Secure session management with localStorage

## Project Structure

```
mailer/
├── backend/
│   ├── auth.js              # JWT token utilities and middleware
│   ├── db.js                # JSON database with initialization
│   ├── server.js            # Express server setup
│   ├── data.json            # User database file
│   ├── package.json
│   └── routes/
│       ├── userRoutes.js    # Authentication and user management endpoints
│       └── emailRoutes.js   # Email sending endpoint
│
└── frontend/
    ├── vite.config.js       # Vite config with API proxy
    ├── package.json
    ├── index.html
    ├── src/
    │   ├── App.jsx          # Main app with role-based routing
    │   ├── App.css
    │   ├── main.jsx
    │   └── components/
    │       ├── AuthLogin.jsx & .css      # Login form
    │       ├── SuperAdminDashboard.jsx & .css # User management
    │       ├── EmailForm.jsx & .css      # Bulk email configurator
    │       ├── SenderModal.jsx & .css    # Sender management
    │       ├── Header.jsx & .css         # Navigation header
    │       └── csvUtils.js               # CSV parsing utilities
```

## API Endpoints

### Authentication Routes (`/auth`)

- **POST** `/auth/login` - Login user
  - Request: `{ email, password }`
  - Response: `{ token, user: { id, email, name, role } }`

- **POST** `/auth/register` - Create new user (SuperAdmin only)
  - Request: `{ email, password, name, role, createdBy }`
  - Response: `{ message, user }`

- **GET** `/auth/users` - Get all users (SuperAdmin only)
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ id, email, name, role, isActive, createdAt, createdBy }]`

- **PUT** `/auth/users/:userId/enable` - Enable user (Admin+ only)
  - Headers: `Authorization: Bearer <token>`

- **PUT** `/auth/users/:userId/disable` - Disable user (Admin+ only)
  - Headers: `Authorization: Bearer <token>`

### Email Routes

- **POST** `/send-email` - Send bulk emails
  - Request: `{ recipients: [{to, cc, bcc, subject, message}], sender: {email, password} }`

## CSV Format Example

```csv
firstName,lastName,email,customField
John,Doe,john@example.com,value1
Jane,Smith,jane@example.com,value2
```

Then use variables in email template:
- `Dear {{firstName}} {{lastName}},`
- `To: {{email}}`
- `Custom: {{customField}}`

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```
PORT=5000
JWT_SECRET=your-super-secret-key-here
```

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running on `localhost:5000`
- Check that vite.config.js proxy is correctly set up
- Clear browser cache and localStorage if needed

### Login fails
- Verify superadmin account credentials: `superadmin@mailer.com` / `superadmin123`
- Check backend console for error messages
- Ensure data.json exists in backend directory

### Password hashing issues
- Make sure bcryptjs is installed: `npm install bcryptjs`
- Regenerate data.json if corrupted by deleting it (will reinitialize)

## Security Notes

- Change the default superadmin password immediately in production
- Update `JWT_SECRET` in environment variables
- Use environment variables for all sensitive data
- Never commit `.env` files to version control
- Implement rate limiting on production
- Use HTTPS in production
- Store sensitive sender passwords securely (consider encryption)

## Future Enhancements

- Admin dashboard for admins to manage their own users
- User dashboard showing sent campaigns and history
- Email delivery status tracking
- Email template library
- Schedule emails for future sending
- Bounce handling and email validation
- Two-factor authentication
- Database migration from JSON to proper database (MongoDB, PostgreSQL)

## Support

For issues or questions, refer to the component-specific comments in the code or check the console for error messages.
