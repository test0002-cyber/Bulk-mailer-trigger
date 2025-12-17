import { useState, useEffect } from 'react'
import apiClient from '../api'
import './UserManagement.css'

function UserManagement({ user, token, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/auth/users')
      setUsers(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      const res = await apiClient.post('/auth/register', {
        ...formData,
        createdBy: user.id
      })
      setUsers([...users, res.data.user])
      setFormData({ name: '', email: '', password: '', role: 'user' })
      setShowCreateForm(false)
      setSuccess('User created successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleToggleUser = async (userId, action) => {
    try {
      const endpoint = action === 'enable' ? 'enable' : 'disable'
      await apiClient.put(`/auth/users/${userId}/${endpoint}`, {})
      fetchUsers()
      setSuccess(`User ${action}d successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`)
    }
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      <button 
        className="create-user-btn"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        {showCreateForm ? '✕ Cancel' : '+ Create New User'}
      </button>

      {showCreateForm && (
        <form className="create-user-form" onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter user name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              {user.role === 'superadmin' && (
                <option value="superadmin">SuperAdmin</option>
              )}
            </select>
          </div>

          <button type="submit" className="submit-btn">Create User</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u.isActive ? (
                      <button
                        className="action-btn disable"
                        onClick={() => handleToggleUser(u.id, 'disable')}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        className="action-btn enable"
                        onClick={() => handleToggleUser(u.id, 'enable')}
                      >
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserManagement
