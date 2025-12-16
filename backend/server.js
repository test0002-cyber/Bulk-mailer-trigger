import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { initializeDB } from './db.js'
import { sendEmail, testSender, sendTestEmail } from './routes/emailRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { getSenders, addSender, deleteSender, updateSender } from './routes/senderRoutes.js'

dotenv.config()
initializeDB()

const app = express()
const PORT = process.env.PORT || 5000

// CORS Configuration for Cloudflare Pages & local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CORS_ORIGIN || '', // For Cloudflare Pages URL
].filter(Boolean)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Routes
app.post('/send-email', sendEmail)
app.post('/test-sender', testSender)
app.post('/test-email', sendTestEmail)
app.get('/senders', getSenders)
app.post('/senders', addSender)
app.delete('/senders/:senderId', deleteSender)
app.put('/senders/:senderId', updateSender)
app.use('/auth', userRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

