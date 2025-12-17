import { useState, useEffect } from 'react'
import apiClient from '../api'
import './SenderModal.css'

function SenderModal({ isOpen, onClose, onSelectSender, currentSender, user }) {
  const [senders, setSenders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    host: 'smtp.gmail.com',
    port: '587'
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadSenders()
    }
  }, [isOpen])

  const loadSenders = async () => {
    try {
      const response = await apiClient.get('/senders')
      setSenders(response.data)
    } catch (err) {
      console.error('Failed to load senders:', err)
    }
  }

  const testSenderConnection = async (senderId) => {
    try {
      setTesting(senderId)
      const response = await apiClient.post('/test-sender', { senderId })
      alert('✅ Sender connection is valid!')
    } catch (err) {
      alert('❌ Connection failed: ' + (err.response?.data?.message || err.message))
    } finally {
      setTesting(null)
    }
  }

  const handleAddSender = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.name || !formData.email || !formData.password || !formData.host || !formData.port) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        // Update existing sender
        const response = await apiClient.put(`/senders/${editingId}`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          host: formData.host,
          port: parseInt(formData.port)
        })
        setSuccess('Sender updated successfully!')
      } else {
        // Create new sender
        const response = await apiClient.post('/senders', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          host: formData.host,
          port: parseInt(formData.port)
        })
        setSuccess('Sender added successfully!')
      }

      setFormData({ name: '', email: '', password: '', host: 'smtp.gmail.com', port: '587' })
      setEditingId(null)
      setShowForm(false)
      loadSenders()

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSender = (sender) => {
    onSelectSender(sender)
    onClose()
  }

  const handleEditSender = (sender) => {
    setEditingId(sender.id)
    setFormData({
      name: sender.name,
      email: sender.email,
      password: sender.password,
      host: sender.host,
      port: sender.port.toString()
    })
    setShowForm(true)
  }

  const handleDeleteSender = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sender?')) return

    try {
      await apiClient.delete(`/senders/${id}`)
      loadSenders()
      setSuccess('Sender deleted successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sender')
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const canManageSender = (sender) => {
    return user?.role === 'superadmin' || sender.createdBy === user?.id
  }

  if (!isOpen) return null

  return (
    <div className="sender-modal-overlay" onClick={onClose}>
      <div className="sender-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sender-modal-header">
          <h2>📧 Sender Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sender-modal-content">
          {senders.length > 0 && !showForm && (
            <div className="senders-list">
              <h3>Select a Sender</h3>
              {senders.map(sender => (
                <div key={sender.id} className={`sender-item ${currentSender?.id === sender.id ? 'active' : ''}`}>
                  <div className="sender-info" onClick={() => handleSelectSender(sender)}>
                    <div className="sender-name">{sender.name}</div>
                    <div className="sender-email">{sender.email}</div>
                    <div className="sender-creator">Created by: {sender.createdByEmail || 'Unknown'}</div>
                  </div>
                  <div className="sender-actions">
                    <button
                      className="test-btn"
                      onClick={() => testSenderConnection(sender.id)}
                      disabled={testing === sender.id}
                      title="Test sender connection"
                    >
                      {testing === sender.id ? '⏳' : '🔌'}
                    </button>
                    {canManageSender(sender) && (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditSender(sender)}
                          title="Edit sender"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteSender(sender.id)}
                          title="Delete sender"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <button
                className="add-sender-btn"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name: '', email: '', password: '', host: 'smtp.gmail.com', port: '587' })
                  setShowForm(true)
                }}
              >
                ➕ Add New Sender
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAddSender} className="sender-form">
              <h3>{editingId ? 'Edit Sender' : (senders.length > 0 ? 'Add New Sender' : 'Add Your First Sender')}</h3>
              
              <div className="form-group">
                <label htmlFor="name">Sender Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="your-email@gmail.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password / App Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password"
                  required
                />
                <small className="help-text">Use Gmail App Password for Gmail accounts</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="host">SMTP Host</label>
                  <input
                    type="text"
                    id="host"
                    name="host"
                    value={formData.host}
                    onChange={handleFormChange}
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="port">SMTP Port</label>
                  <input
                    type="number"
                    id="port"
                    name="port"
                    value={formData.port}
                    onChange={handleFormChange}
                    placeholder="587"
                    required
                  />
                  <small className="help-text">587 (TLS) or 465 (SSL)</small>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-buttons">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingId ? 'Update Sender' : 'Save Sender')}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', password: '', host: 'smtp.gmail.com', port: '587' })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {senders.length === 0 && !showForm && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Senders Yet</h3>
              <p>Add your first sender to get started</p>
              <button
                className="add-sender-btn"
                onClick={() => setShowForm(true)}
              >
                ➕ Add Your First Sender
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SenderModal
