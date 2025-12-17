
import { useState, useRef } from 'react'
import apiClient from '../api'
import { parseCSV } from './csvUtils'
import './EmailForm.css'



function replaceVars(str, row) {
  if (!str) return ''
  return str.replace(/{{(.*?)}}/g, (_, v) => row[v] ?? '')
}

function EmailForm({ setPreview, currentSender }) {
  const [csvData, setCsvData] = useState([])
  const [csvColumns, setCsvColumns] = useState([])
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [csvError, setCsvError] = useState(null)
  const [showVariableModal, setShowVariableModal] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const fileInputRef = useRef()

  const updatePreview = (data, form) => {
    if (!setPreview) return
    if (data && data.length > 0) {
      const row = data[0]
      setPreview({
        to: replaceVars(form.to, row),
        cc: replaceVars(form.cc, row),
        bcc: replaceVars(form.bcc, row),
        subject: replaceVars(form.subject, row),
        message: replaceVars(form.message, row)
      })
    } else {
      setPreview(null)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      updatePreview(csvData, updated)
      return updated
    })
  }

  const handleCSV = async (e) => {
    setCsvError(null)
    const file = e.target.files[0]
    if (!file) return
    try {
      const results = await parseCSV(file)
      setCsvData(results.data)
      setCsvColumns(results.meta.fields)
      setTimeout(() => updatePreview(results.data, formData), 0)
      // Reset file input to allow re-uploading the same file
      e.target.value = ''
    } catch (err) {
      setCsvError('Invalid CSV file')
      setCsvData([])
      setCsvColumns([])
      setPreview && setPreview(null)
      // Reset file input on error
      e.target.value = ''
    }
  }

  const insertVariable = (field, variable) => {
    setFormData(prev => {
      let newValue = prev[field]
      
      // For To, CC, BCC fields: add comma and space before the variable if field is not empty
      if ((field === 'to' || field === 'cc' || field === 'bcc') && newValue.trim()) {
        newValue = newValue + `, {{${variable}}}`
      } else {
        newValue = newValue + `{{${variable}}}`
      }
      
      const updated = { ...prev, [field]: newValue }
      updatePreview(csvData, updated)
      return updated
    })
    setShowVariableModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)

    if (!currentSender) {
      setError('Please select a sender before sending emails')
      setLoading(false)
      return
    }

    if (!formData.to || !formData.subject || !formData.message) {
      setError('Please fill in all required fields (To, Subject, Message)')
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.post('/send-email', {
        senderId: currentSender.id,
        recipients: {
          to: formData.to,
          cc: formData.cc,
          bcc: formData.bcc
        },
        subject: formData.subject,
        message: formData.message,
        csvData: csvData
      })

      setResponse({
        message: `✅ Successfully sent ${response.data.successCount} email(s)${response.data.failureCount > 0 ? ` (${response.data.failureCount} failed)` : ''}`
      })
    } catch (err) {
      setError(err.response?.data?.message || `Error: ${err.message}`)
      console.error('Send error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse(null)

    if (!currentSender) {
      setError('Please select a sender before sending test email')
      setLoading(false)
      return
    }

    if (!formData.to || !formData.subject || !formData.message) {
      setError('Please fill in all required fields (To, Subject, Message)')
      setLoading(false)
      return
    }

    if (csvData.length === 0) {
      setError('Please upload a CSV file first')
      setLoading(false)
      return
    }

    try {
      const firstRowData = csvData[0] // Get first row data

      const response = await apiClient.post('/test-sender', {
        senderId: currentSender.id,
        testData: {
          recipients: {
            to: formData.to,
            cc: formData.cc,
            bcc: formData.bcc
          },
          subject: formData.subject,
          message: formData.message,
          firstRow: firstRowData
        }
      })

      setResponse({
        message: `✅ Test email sent successfully to ${response.data.testEmail}!`
      })
    } catch (err) {
      setError(err.response?.data?.message || `Error: ${err.message}`)
      console.error('Test email error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="email-form">
      {/* CSV Upload Section */}
      <div className="csv-upload-section">
        <label className="csv-upload-label">📥 Step 1: Upload CSV File</label>
        <div 
          className="csv-upload-area"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="csv-upload-icon">📄</span>
          <div className="csv-upload-text">
            <strong>Click to upload CSV file</strong>
            <small>or drag and drop (CSV format)</small>
          </div>
        </div>
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleCSV}
          ref={fileInputRef}
          disabled={loading}
          className="csv-file-input"
        />
        
        {csvData.length > 0 && (
          <div className="csv-info">
            <div className="csv-info-item">
              <span className="csv-info-label">Rows</span>
              <span className="csv-info-value">{csvData.length}</span>
            </div>
            <div className="csv-info-item">
              <span className="csv-info-label">Columns</span>
              <span className="csv-info-value">{csvColumns.length}</span>
            </div>
          </div>
        )}
        
        {csvError && <div className="error-message">{csvError}</div>}
      </div>

      {/* Email Template Section */}
      {csvColumns.length > 0 && (
        <div style={{ paddingTop: '8px' }}>
          <label style={{ display: 'block', fontWeight: '700', color: '#333', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✉️ Step 2: Create Email Template
          </label>
          
          <div className="form-grid">
            <div className="form-group">
              <div className="form-label-wrapper">
                <label htmlFor="to">
                  <span className="label-icon">📬</span>
                  To
                </label>
                <button
                  type="button"
                  className="insert-var-btn"
                  onClick={() => { setActiveField('to'); setShowVariableModal(true) }}
                  title="Insert variable"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="e.g., {{email}} or john@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="form-label-wrapper">
                <label htmlFor="cc">
                  <span className="label-icon">📋</span>
                  CC
                </label>
                <button
                  type="button"
                  className="insert-var-btn"
                  onClick={() => { setActiveField('cc'); setShowVariableModal(true) }}
                  title="Insert variable"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                id="cc"
                name="cc"
                value={formData.cc}
                onChange={handleChange}
                placeholder="e.g., {{manager_email}}"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <div className="form-label-wrapper">
                <label htmlFor="bcc">
                  <span className="label-icon">🔒</span>
                  BCC
                </label>
                <button
                  type="button"
                  className="insert-var-btn"
                  onClick={() => { setActiveField('bcc'); setShowVariableModal(true) }}
                  title="Insert variable"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                id="bcc"
                name="bcc"
                value={formData.bcc}
                onChange={handleChange}
                placeholder="e.g., {{admin_email}}"
                disabled={loading}
              />
            </div>

            <div className="form-group full">
              <div className="form-label-wrapper">
                <label htmlFor="subject">
                  <span className="label-icon">📌</span>
                  Subject
                </label>
                <button
                  type="button"
                  className="insert-var-btn"
                  onClick={() => { setActiveField('subject'); setShowVariableModal(true) }}
                  title="Insert variable"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Welcome {{firstName}}!"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group full">
              <div className="form-label-wrapper">
                <label htmlFor="message">
                  <span className="label-icon">💬</span>
                  Message Body
                </label>
                <button
                  type="button"
                  className="insert-var-btn"
                  onClick={() => { setActiveField('message'); setShowVariableModal(true) }}
                  title="Insert variable"
                >
                  +
                </button>
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Dear {{firstName}},&#10;&#10;This is a personalized email for {{email}}.&#10;&#10;Best regards"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          type="button"
          className="test-email-btn"
          onClick={handleTestEmail}
          disabled={loading || csvData.length === 0}
          title="Send test email using first row of CSV data"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Sending Test...
            </>
          ) : (
            `📧 Send Test Email (First Row)`
          )}
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || csvData.length === 0}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Sending...
            </>
          ) : (
            `🚀 Send ${csvData.length} Bulk Emails`
          )}
        </button>
        <button 
          type="button"
          className="clear-btn"
          onClick={() => {
            setFormData({ to: '', cc: '', bcc: '', subject: '', message: '' })
            setPreview?.(null)
            setError(null)
            setResponse(null)
          }}
          disabled={loading || csvData.length === 0}
        >
          🔄 Clear Form
        </button>
      </div>

      {/* Messages */}
      <div className="messages-section">
        {response && (
          <div className="success-message">
            {response.message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Variable Selection Modal */}
      {showVariableModal && csvColumns.length > 0 && (
        <div className="variable-modal-overlay" onClick={() => setShowVariableModal(false)}>
          <div className="variable-modal" onClick={(e) => e.stopPropagation()}>
            <div className="variable-modal-header">
              <h3>Select Variable</h3>
              <button
                type="button"
                className="variable-modal-close"
                onClick={() => setShowVariableModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="variable-modal-content">
              <div className="variable-grid">
                {csvColumns.map(col => (
                  <button
                    key={col}
                    type="button"
                    className="variable-option"
                    onClick={() => {
                      if (activeField) {
                        insertVariable(activeField, col)
                      }
                    }}
                  >
                    <span className="variable-icon">{'{{'}</span>
                    <span className="variable-name">{col}</span>
                    <span className="variable-icon">{'}}'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}


export default EmailForm
