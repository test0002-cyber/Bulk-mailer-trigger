import { useState } from 'react'
import apiClient from '../api'
import './UserProfile.css'

export default function UserProfile({ user, onClose }) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await apiClient.put('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      })
      setSuccess('Password changed successfully!')
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="user-info">Logged in as: <strong>{user?.email}</strong></p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
