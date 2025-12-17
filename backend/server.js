import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { initializeDB, readDB } from './db.js'
import { sendEmail, testSender } from './routes/emailRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { getSenders, addSender, deleteSender, updateSender } from './routes/senderRoutes.js'

dotenv.config()
initializeDB()

const app = express()
const PORT = process.env.PORT || 5000
// Force rebuild v2: Hardcoded SMTP settings - 2025-12-17 12:35:00

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// API Routes// Routes
app.post('/send-email', sendEmail)
app.post('/test-sender', testSender)
app.get('/senders', getSenders)
app.post('/senders', addSender)
app.delete('/senders/:senderId', deleteSender)
app.put('/senders/:senderId', updateSender)
app.use('/auth', userRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

app.get('/debug/senders', (req, res) => {
  const db = readDB()
  const senders = db.senders || []
  // Return sender info without passwords
  const info = senders.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    host: s.host,
    port: s.port,
    hasPassword: !!s.password
  }))
  res.json(info)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

