import express from 'express'
import bcrypt from 'bcryptjs'
import { generateToken, verifyToken } from '../auth.js'
import { readDB, writeDB } from '../db.js'

const router = express.Router()

// Register a new user (SuperAdmin and Admin can create users)
router.post('/register', (req, res) => {
  try {
    const { email, password, name, role, createdBy } = req.body
    const db = readDB()

    // Validate role
    if (!['superadmin', 'admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    // Check if user already exists
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Verify creator exists and has permission
    const creator = db.users.find(u => u.id === createdBy)
    if (!creator) {
      return res.status(403).json({ message: 'Creator not found' })
    }

    // SuperAdmin can create any role, Admin can only create User role
    const isAuthorized = creator.role === 'superadmin' || 
                         (creator.role === 'admin' && role === 'user')
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'You do not have permission to create this user role' })
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password: bcrypt.hashSync(password, 10),
      name,
      role,
      isActive: true,
      createdBy,
      createdAt: new Date().toISOString()
    }

    db.users.push(newUser)
    writeDB(db)

    res.json({ message: 'User created successfully', user: { ...newUser, password: undefined } })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message })
  }
})

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body
    const db = readDB()

    const user = db.users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'User is disabled' })
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message })
  }
})

// Get all users (SuperAdmin only)
router.get('/users', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can view all users' })
    }

    const db = readDB()
    const users = db.users.map(u => ({ ...u, password: undefined }))
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
})

// Disable user (SuperAdmin only)
router.put('/users/:userId/disable', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can disable users' })
    }

    const db = readDB()
    const user = db.users.find(u => u.id === req.params.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isActive = false
    writeDB(db)
    res.json({ message: 'User disabled successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error disabling user', error: error.message })
  }
})

// Enable user (SuperAdmin only)
router.put('/users/:userId/enable', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can enable users' })
    }

    const db = readDB()
    const user = db.users.find(u => u.id === req.params.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.isActive = true
    writeDB(db)
    res.json({ message: 'User enabled successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error enabling user', error: error.message })
  }
})

// Edit user (SuperAdmin only, or creator Admin)
router.put('/users/:userId', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const db = readDB()
    const targetUser = db.users.find(u => u.id === req.params.userId)
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // SuperAdmin can edit anyone, Admin can only edit users they created
    const canEdit = decoded.role === 'superadmin' || 
                    (decoded.role === 'admin' && targetUser.createdBy === decoded.id)
    
    if (!canEdit) {
      return res.status(403).json({ message: 'You can only edit users you created' })
    }

    const { name, email, password, role } = req.body

    // Admin cannot change role
    if (decoded.role === 'admin' && role && role !== targetUser.role) {
      return res.status(403).json({ message: 'Admins cannot change user roles' })
    }

    if (name) targetUser.name = name
    if (email) targetUser.email = email
    if (password) targetUser.password = bcrypt.hashSync(password, 10)
    if (role && decoded.role === 'superadmin') targetUser.role = role

    writeDB(db)
    res.json({ 
      message: 'User updated successfully', 
      user: { ...targetUser, password: undefined } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message })
  }
})

// Delete user (SuperAdmin only, or creator Admin)
router.delete('/users/:userId', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const db = readDB()
    const userIndex = db.users.findIndex(u => u.id === req.params.userId)
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' })
    }

    const targetUser = db.users[userIndex]

    // SuperAdmin can delete anyone, Admin can only delete users they created
    const canDelete = decoded.role === 'superadmin' || 
                      (decoded.role === 'admin' && targetUser.createdBy === decoded.id)
    
    if (!canDelete) {
      return res.status(403).json({ message: 'You can only delete users you created' })
    }

    // Cannot delete superadmin
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete superadmin users' })
    }

    db.users.splice(userIndex, 1)
    writeDB(db)
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message })
  }
})

export default router
