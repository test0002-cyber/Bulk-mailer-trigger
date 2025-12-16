import { readDB, writeDB } from '../db.js'

// Get all senders
export const getSenders = (req, res) => {
  try {
    const db = readDB()
    const senders = db.senders || []
    res.json(senders)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch senders', error: error.message })
  }
}

// Add a new sender
export const addSender = (req, res) => {
  try {
    const { name, email, password, host, port } = req.body

    if (!name || !email || !password || !host || !port) {
      return res.status(400).json({ message: 'All fields are required' })
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
      host,
      port: parseInt(port),
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
    const { senderId } = req.params
    const db = readDB()

    db.senders = db.senders.filter(sender => sender.id !== senderId)
    writeDB(db)

    res.json({ message: 'Sender deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sender', error: error.message })
  }
}

// Update a sender
export const updateSender = (req, res) => {
  try {
    const { senderId } = req.params
    const { name, email, password, host, port } = req.body

    const db = readDB()
    const senderIndex = db.senders.findIndex(sender => sender.id === senderId)

    if (senderIndex === -1) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    db.senders[senderIndex] = {
      ...db.senders[senderIndex],
      name,
      email,
      password,
      host,
      port: parseInt(port)
    }

    writeDB(db)
    res.json({ message: 'Sender updated successfully', sender: db.senders[senderIndex] })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sender', error: error.message })
  }
}
