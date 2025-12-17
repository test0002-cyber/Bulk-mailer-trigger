import nodemailer from 'nodemailer'

export const sendBulkEmail = async (req, res) => {
  try {
    const { senderName, senderEmail, senderPassword, csvData, subject, message } = req.body

    if (!senderEmail || !senderPassword || !csvData || !csvData.length) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: senderEmail,
        pass: senderPassword
      }
    })

    const replaceVars = (str, row) => {
      if (!str) return ''
      return str.replace(/{{(.*?)}}/g, (_, variable) => row[variable] || '')
    }

    let successCount = 0
    let failureCount = 0

    for (const rowData of csvData) {
      try {
        const toEmail = replaceVars('{{email}}', rowData)
        if (!toEmail || toEmail.trim() === '') {
          failureCount++
          continue
        }

        const mailOptions = {
          from: `${senderName} <${senderEmail}>`,
          to: toEmail,
          subject: replaceVars(subject, rowData),
          html: replaceVars(message, rowData).replace(/\n/g, '<br>'),
          text: replaceVars(message, rowData)
        }

        await transporter.sendMail(mailOptions)
        successCount++
      } catch (error) {
        failureCount++
      }
    }

    res.json({
      message: 'Bulk email send completed',
      successCount,
      failureCount
    })
  } catch (error) {
    console.error('Error sending bulk email:', error)
    res.status(500).json({ message: 'Failed to send emails', error: error.message })
  }
}

export const sendTestEmail = async (req, res) => {
  try {
    const { senderName, senderEmail, senderPassword, recipients, subject, message } = req.body

    if (!senderEmail || !senderPassword || !recipients?.to) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: senderEmail,
        pass: senderPassword
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    })

    const mailOptions = {
      from: `${senderName} <${senderEmail}>`,
      to: recipients.to,
      subject,
      html: message.replace(/\n/g, '<br>'),
      text: message
    }

    if (recipients.cc && recipients.cc.trim()) {
      mailOptions.cc = recipients.cc
    }
    if (recipients.bcc && recipients.bcc.trim()) {
      mailOptions.bcc = recipients.bcc
    }

    await transporter.sendMail(mailOptions)

    res.json({
      message: 'Test email sent successfully!',
      recipientEmail: recipients.to
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    let message = 'Failed to send test email'
    if (error.message.includes('Invalid login')) {
      message = 'Invalid email or password - check sender credentials'
    } else if (error.message.includes('timeout')) {
      message = 'Connection timeout - verify SMTP credentials'
    }
    res.status(500).json({ message, error: error.message })
  }
}
