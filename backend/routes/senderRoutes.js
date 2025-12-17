import { readDB, writeDB } from '../db.js'
import { verifyToken } from '../auth.js'

// Get all senders (with role-based filtering)
export const getSenders = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const db = readDB()
    let senders = db.senders || []

    // SuperAdmin sees all senders
    if (decoded.role === 'superadmin') {
      return res.json(senders)
    }

    // Admin sees only senders they created
    if (decoded.role === 'admin') {
      senders = senders.filter(sender => sender.createdBy === decoded.id)
      return res.json(senders)
    }

    // User sees only senders they created
    if (decoded.role === 'user') {
      senders = senders.filter(sender => sender.createdBy === decoded.id)
      return res.json(senders)
    }

    res.json(senders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch senders', error: error.message })
  }
}

// Add a new sender
export const addSender = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const db = readDB()
    if (!db.senders) {
      db.senders = []
    }

    const newSender = {
      id: Date.now().toString(),
      name,
      email,
      password,
      host: 'smtp.gmail.com',
      port: 587,
      createdBy: decoded.id,
      createdByEmail: decoded.email,
      createdAt: new Date().toISOString()
    }

    db.senders.push(newSender)
    writeDB(db)

    res.status(201).json({ message: 'Sender added successfully', sender: newSender })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add sender', error: error.message })
  }
}

// Delete a sender
export const deleteSender = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { senderId } = req.params
    const db = readDB()
    const senderIndex = db.senders.findIndex(sender => sender.id === senderId)

    if (senderIndex === -1) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    // SuperAdmin can delete any sender
    // Others can only delete senders they created
    const sender = db.senders[senderIndex]
    if (decoded.role !== 'superadmin' && sender.createdBy !== decoded.id) {
      return res.status(403).json({ message: 'You can only delete senders you created' })
    }

    db.senders.splice(senderIndex, 1)
    writeDB(db)

    res.json({ message: 'Sender deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sender', error: error.message })
  }
}

// Update a sender
export const updateSender = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { senderId } = req.params
    const { name, email, password } = req.body

    const db = readDB()
    const senderIndex = db.senders.findIndex(sender => sender.id === senderId)

    if (senderIndex === -1) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    // SuperAdmin can update any sender
    // Others can only update senders they created
    const sender = db.senders[senderIndex]
    if (decoded.role !== 'superadmin' && sender.createdBy !== decoded.id) {
      return res.status(403).json({ message: 'You can only update senders you created' })
    }

    db.senders[senderIndex] = {
      ...db.senders[senderIndex],
      name,
      email,
      password,
      host: 'smtp.gmail.com',
      port: 587
    }

    writeDB(db)
    res.json({ message: 'Sender updated successfully', sender: db.senders[senderIndex] })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sender', error: error.message })
  }
}
