import { useState } from 'react'
import '../styles/BulkMailer.css'

function BulkMailer() {
  const [csvData, setCsvData] = useState([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  // Sender details
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderPassword, setSenderPassword] = useState('')

  // Test email fields
  const [testEmail, setTestEmail] = useState('')
  const [testCC, setTestCC] = useState('')
  const [testBCC, setTestBCC] = useState('')
  const [testSenderName, setTestSenderName] = useState('')
  const [testSenderEmail, setTestSenderEmail] = useState('')
  const [testSenderPassword, setTestSenderPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [message_display, setMessageDisplay] = useState(null)
  const [showTestModal, setShowTestModal] = useState(false)

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target.result
      const lines = csv.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj = {}
        headers.forEach((header, idx) => {
          obj[header] = values[idx]?.trim() || ''
        })
        return obj
      })

      setCsvData(data)
      setMessageDisplay({ type: 'success', text: `✅ CSV loaded: ${data.length} rows` })
      setTimeout(() => setMessageDisplay(null), 3000)
    }
    reader.readAsText(file)
  }

  const handleTestEmail = async () => {
    if (!testSenderEmail || !testSenderPassword || !testEmail || !subject || !message) {
      setMessageDisplay({ type: 'error', text: '❌ Fill all required fields' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: testSenderName || 'Test Sender',
          senderEmail: testSenderEmail,
          senderPassword: testSenderPassword,
          recipients: {
            to: testEmail,
            cc: testCC || undefined,
            bcc: testBCC || undefined
          },
          subject,
          message
        })
      })

      const data = await response.json()
      if (response.ok) {
        setMessageDisplay({ type: 'success', text: '✅ Test email sent successfully!' })
        setShowTestModal(false)
      } else {
        setMessageDisplay({ type: 'error', text: `❌ ${data.message}` })
      }
    } catch (error) {
      setMessageDisplay({ type: 'error', text: `❌ ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkSend = async () => {
    if (!csvData.length) {
      setMessageDisplay({ type: 'error', text: '❌ Please upload CSV first' })
      return
    }
    if (!senderEmail || !senderPassword || !subject || !message) {
      setMessageDisplay({ type: 'error', text: '❌ Fill all required fields' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName || 'Bulk Mailer',
          senderEmail,
          senderPassword,
          csvData,
          subject,
          message
        })
      })

      const data = await response.json()
      if (response.ok) {
        setMessageDisplay({
          type: 'success',
          text: `✅ Sent: ${data.successCount} | Failed: ${data.failureCount}`
        })
      } else {
        setMessageDisplay({ type: 'error', text: `❌ ${data.message}` })
      }
    } catch (error) {
      setMessageDisplay({ type: 'error', text: `❌ ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bulk-mailer">
      <div className="container">
        <h1>📧 Bulk Mailer</h1>

        {message_display && (
          <div className={`message ${message_display.type}`}>
            {message_display.text}
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="section">
          <h2>📄 Step 1: Upload CSV</h2>
          <div className="csv-upload">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
            />
          </div>
          {csvData.length > 0 && (
            <div className="csv-info">
              ✅ {csvData.length} rows loaded
              <table className="preview-table">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(csvData[0]).map((val, idx) => (
                      <td key={idx}>{val}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Email Template Section */}
        <div className="section">
          <h2>✉️ Step 2: Email Template</h2>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject (use {{column}} for variables)"
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email body (use {{column}} for variables)"
              rows="8"
            />
          </div>
          <small>💡 Use {{email}}, {{name}}, etc. to include CSV columns</small>
        </div>

        {/* Sender Details Section */}
        <div className="section">
          <h2>👤 Step 3: Sender Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Sender Name (optional)</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="form-group">
              <label>Sender Email *</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Sender Password / App Password *</label>
            <input
              type="password"
              value={senderPassword}
              onChange={(e) => setSenderPassword(e.target.value)}
              placeholder="Gmail App Password"
            />
            <small>Use Gmail App Password for Gmail accounts</small>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="section actions">
          <button
            className="btn btn-test"
            onClick={() => setShowTestModal(true)}
            disabled={loading || !subject || !message}
          >
            🧪 Test Email
          </button>
          <button
            className="btn btn-send"
            onClick={handleBulkSend}
            disabled={loading || !csvData.length}
          >
            {loading ? '⏳ Sending...' : '📤 Send Bulk Email'}
          </button>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🧪 Send Test Email</h2>

            <div className="form-group">
              <label>Sender Name (optional)</label>
              <input
                type="text"
                value={testSenderName}
                onChange={(e) => setTestSenderName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>

            <div className="form-group">
              <label>Sender Email *</label>
              <input
                type="email"
                value={testSenderEmail}
                onChange={(e) => setTestSenderEmail(e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Sender Password *</label>
              <input
                type="password"
                value={testSenderPassword}
                onChange={(e) => setTestSenderPassword(e.target.value)}
                placeholder="Gmail App Password"
              />
            </div>

            <div className="form-group">
              <label>Recipient Email *</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <div className="form-group">
              <label>CC (optional)</label>
              <input
                type="text"
                value={testCC}
                onChange={(e) => setTestCC(e.target.value)}
                placeholder="cc@example.com"
              />
            </div>

            <div className="form-group">
              <label>BCC (optional)</label>
              <input
                type="text"
                value={testBCC}
                onChange={(e) => setTestBCC(e.target.value)}
                placeholder="bcc@example.com"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-send" onClick={handleTestEmail} disabled={loading}>
                {loading ? '⏳ Sending...' : '📧 Send Test Email'}
              </button>
              <button className="btn btn-cancel" onClick={() => setShowTestModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkMailer
