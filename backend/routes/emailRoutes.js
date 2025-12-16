import nodemailer from 'nodemailer'
import { readDB } from '../db.js'

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const sendEmail = async (req, res) => {
  try {
    const { senderId, recipients, subject, message, csvData } = req.body

    // Validate input
    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' })
    }
    if (!recipients || !recipients.to) {
      return res.status(400).json({ message: 'Recipients (to field) are required' })
    }
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' })
    }
    if (!csvData || csvData.length === 0) {
      return res.status(400).json({ message: 'CSV data is required' })
    }

    // Get sender details from database
    const db = readDB()
    const sender = db.senders.find(s => s.id === senderId)

    if (!sender) {
      return res.status(404).json({ 
        message: 'Sender not found',
        senderId: senderId
      })
    }

    // Validate sender configuration
    if (!sender.email || !sender.password || !sender.host || !sender.port) {
      return res.status(400).json({ 
        message: 'Sender configuration is incomplete',
        details: 'Missing email, password, host, or port'
      })
    }

    // Create transporter with sender's SMTP details
    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: sender.port === 465, // true for 465, false for other ports
      auth: {
        user: sender.email,
        pass: sender.password
      }
    })

    // Helper function to replace variables in a string
    const replaceVars = (str, row) => {
      if (!str) return ''
      return str.replace(/{{(.*?)}}/g, (_, variable) => row[variable] || '')
    }

    // Send emails to each recipient
    let successCount = 0
    let failureCount = 0
    const errors = []
    let senderConnectionError = null

    // Test sender connection first
    try {
      await transporter.verify()
    } catch (error) {
      senderConnectionError = error.message
      return res.status(500).json({ 
        message: 'Failed to connect to sender SMTP server',
        error: senderConnectionError,
        senderEmail: sender.email,
        senderHost: sender.host
      })
    }

    for (const rowData of csvData) {
      try {
        // Replace variables in recipients and content
        const toEmail = replaceVars(recipients.to, rowData)
        const ccEmails = recipients.cc ? replaceVars(recipients.cc, rowData) : undefined
        const bccEmails = recipients.bcc ? replaceVars(recipients.bcc, rowData) : undefined
        const emailSubject = replaceVars(subject, rowData)
        const emailMessage = replaceVars(message, rowData)

        // Validate that we have at least one recipient
        if (!toEmail || toEmail.trim() === '') {
          failureCount++
          errors.push({
            row: rowData,
            error: 'No valid "to" email address found'
          })
          continue
        }

        // Validate email format
        if (!isValidEmail(toEmail)) {
          failureCount++
          errors.push({
            row: rowData,
            error: `Invalid email format: ${toEmail}`
          })
          continue
        }

        const mailOptions = {
          from: `${sender.name} <${sender.email}>`,
          to: toEmail,
          subject: emailSubject,
          html: emailMessage.replace(/\n/g, '<br>'),
          text: emailMessage
        }

        // Add CC and BCC if provided
        if (ccEmails && ccEmails.trim()) {
          // Validate CC emails
          const ccList = ccEmails.split(',').map(e => e.trim())
          const validCCs = ccList.filter(e => isValidEmail(e))
          if (validCCs.length > 0) {
            mailOptions.cc = validCCs.join(', ')
          }
        }
        if (bccEmails && bccEmails.trim()) {
          // Validate BCC emails
          const bccList = bccEmails.split(',').map(e => e.trim())
          const validBCCs = bccList.filter(e => isValidEmail(e))
          if (validBCCs.length > 0) {
            mailOptions.bcc = validBCCs.join(', ')
          }
        }

        await transporter.sendMail(mailOptions)
        successCount++
      } catch (error) {
        failureCount++
        errors.push({
          row: rowData,
          error: error.message
        })
      }
    }

    res.status(200).json({
      message: 'Bulk email send completed',
      successCount,
      failureCount,
      totalCount: csvData.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error sending emails:', error)
    res.status(500).json({ message: 'Failed to send emails', error: error.message })
  }
}

// Test sender connection
export const testSender = async (req, res) => {
  try {
    const { senderId } = req.body

    const db = readDB()
    const sender = db.senders.find(s => s.id === senderId)

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: sender.port === 465,
      auth: {
        user: sender.email,
        pass: sender.password
      }
    })

    // Verify connection
    await transporter.verify()

    res.json({ message: 'Sender connection is valid' })
  } catch (error) {
    console.error('Sender test error:', error)
    res.status(400).json({ message: 'Failed to connect to sender', error: error.message })
  }
}

// Send test email to sender's own email using first row of data
export const sendTestEmail = async (req, res) => {
  try {
    const { senderId, subject, message, rowData } = req.body

    // Validate input
    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' })
    }
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' })
    }
    if (!rowData || typeof rowData !== 'object') {
      return res.status(400).json({ message: 'Row data is required' })
    }

    // Get sender details from database
    const db = readDB()
    const sender = db.senders.find(s => s.id === senderId)

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    // Validate sender configuration
    if (!sender.email || !sender.password || !sender.host || !sender.port) {
      return res.status(400).json({ 
        message: 'Sender configuration is incomplete'
      })
    }

    // Create transporter with sender's SMTP details
    const transporter = nodemailer.createTransport({
      host: sender.host,
      port: sender.port,
      secure: sender.port === 465,
      auth: {
        user: sender.email,
        pass: sender.password
      }
    })

    // Helper function to replace variables
    const replaceVars = (str, row) => {
      if (!str) return ''
      return str.replace(/{{(.*?)}}/g, (_, variable) => row[variable] || '')
    }

    // Test sender connection first
    try {
      await transporter.verify()
    } catch (error) {
      return res.status(500).json({ 
        message: 'Failed to connect to sender SMTP server',
        error: error.message
      })
    }

    // Replace variables in subject and message using first row
    const emailSubject = replaceVars(subject, rowData)
    const emailMessage = replaceVars(message, rowData)

    // Create mail options
    const mailOptions = {
      from: `${sender.name} <${sender.email}>`,
      to: sender.email,  // Send to sender's own email
      subject: `[TEST] ${emailSubject}`,  // Add [TEST] prefix
      html: emailMessage.replace(/\n/g, '<br>'),
      text: emailMessage
    }

    // Send test email
    await transporter.sendMail(mailOptions)

    res.status(200).json({
      message: 'Test email sent successfully',
      sentTo: sender.email,
      subject: mailOptions.subject,
      note: 'Test email sent to sender\'s address with data from first CSV row'
    })
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({ 
      message: 'Failed to send test email', 
      error: error.message 
    })
  }
}