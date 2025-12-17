import { useState, useEffect } from 'react'
import apiClient from '../api'
import './SuperAdminDashboard.css'

function SuperAdminDashboard({ user, token }) {
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
      await apiClient.post('/auth/register', 
        {
          ...formData,
          createdBy: user.id
        }
      )
      setSuccess('User created successfully!')
      setFormData({ name: '', email: '', password: '', role: 'user' })
      setShowCreateForm(false)
      fetchUsers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const toggleUserStatus = async (userId, isActive) => {
    try {
      const endpoint = isActive ? 'disable' : 'enable'
      await apiClient.put(`/auth/users/${userId}/${endpoint}`, {})
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  return (
    <div className="superadmin-dashboard">
      <div className="dashboard-header">
        <h1>👑 SuperAdmin Dashboard</h1>
        <p>Manage users, admins, and system settings</p>
      </div>

      {error && <div className="error-alert">{error}</div>}
      {success && <div className="success-alert">{success}</div>}

      <div className="dashboard-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '❌ Cancel' : '➕ Create New User'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateUser} className="create-form">
            <h2>Create New User</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                  <option value="superadmin">SuperAdmin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-success">Create User</button>
          </form>
        </div>
      )}

      <div className="users-list">
        <h2>All Users ({users.length})</h2>
        
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={!u.isActive ? 'disabled' : ''}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? '✓ Active' : '✗ Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={`action-btn ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                      >
                        {u.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuperAdminDashboard
