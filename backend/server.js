import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { sendBulkEmail, sendTestEmail } from './routes/simplifiedEmailRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Routes
app.post('/send-bulk-email', sendBulkEmail)
app.post('/send-test-email', sendTestEmail)

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
