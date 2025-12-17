import nodemailer from 'nodemailer'
import { readDB } from '../db.js'

export const sendEmail = async (req, res) => {
  try {
    const { senderId, recipients, subject, message, csvData } = req.body

    // Validate input
    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' })
    }
    if (!recipients || !recipients.to) {
      return res.status(400).json({ message: 'Recipients (To field) are required' })
    }
    if (!csvData || csvData.length === 0) {
      return res.status(400).json({ message: 'CSV data is required' })
    }
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' })
    }

    // Get sender details from database
    const db = readDB()
    const sender = db.senders.find(s => s.id === senderId)

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' })
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
          mailOptions.cc = ccEmails
        }
        if (bccEmails && bccEmails.trim()) {
          mailOptions.bcc = bccEmails
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

// Test sender connection and send test email
export const testSender = async (req, res) => {
  try {
    const { senderId, testData } = req.body

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
      },
      connectionTimeout: 5000,
      socketTimeout: 5000
    })

    // If testData is provided, send a test email with the first row data
    if (testData && testData.recipients && testData.subject && testData.message) {
      // Helper function to replace variables in a string
      const replaceVars = (str, row) => {
        if (!str) return ''
        return str.replace(/{{(.*?)}}/g, (_, variable) => row[variable] || '')
      }

      // Get the first row of CSV data (or use testData.firstRow)
      const firstRowData = testData.firstRow || {}

      // Replace variables in content
      const toEmail = replaceVars(testData.recipients.to, firstRowData)
      const ccEmails = testData.recipients.cc ? replaceVars(testData.recipients.cc, firstRowData) : undefined
      const bccEmails = testData.recipients.bcc ? replaceVars(testData.recipients.bcc, firstRowData) : undefined
      const emailSubject = replaceVars(testData.subject, firstRowData)
      const emailMessage = replaceVars(testData.message, firstRowData)

      if (!toEmail || toEmail.trim() === '') {
        return res.status(400).json({ message: 'No valid recipient email found in test data' })
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
        mailOptions.cc = ccEmails
      }
      if (bccEmails && bccEmails.trim()) {
        mailOptions.bcc = bccEmails
      }

      await transporter.sendMail(mailOptions)

      return res.json({
        message: 'Test email sent successfully!',
        testEmail: toEmail,
        subject: emailSubject
      })
    }

    // If no testData, just verify connection with timeout
    const verifyPromise = transporter.verify()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout - please check SMTP credentials')), 10000)
    )

    await Promise.race([verifyPromise, timeoutPromise])

    res.json({ message: 'Sender connection is valid' })
  } catch (error) {
    console.error('Sender test error:', error)
    
    // Provide helpful error messages based on error type
    let message = 'Failed to connect to sender'
    if (error.message.includes('timeout')) {
      message = 'Connection timeout - verify SMTP host and port are correct'
    } else if (error.message.includes('Invalid login')) {
      message = 'Invalid email or password - check sender credentials'
    } else if (error.message.includes('ECONNREFUSED')) {
      message = 'Connection refused - check SMTP host and port'
    }

    res.status(400).json({ message, error: error.message })
  }
}

