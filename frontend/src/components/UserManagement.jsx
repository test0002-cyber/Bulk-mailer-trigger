import { useState, useEffect } from 'react'
import apiClient from '../api'
import './UserManagement.css'

function UserManagement({ user, token, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
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

  const handleEditUser = (u) => {
    setEditingUserId(u.id)
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role
    })
    setShowCreateForm(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }
      if (formData.password) {
        updateData.password = formData.password
      }
      
      const res = await apiClient.put(`/auth/users/${editingUserId}`, updateData)
      setUsers(users.map(u => u.id === editingUserId ? res.data.user : u))
      setFormData({ name: '', email: '', password: '', role: 'user' })
      setEditingUserId(null)
      setShowCreateForm(false)
      setSuccess('User updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await apiClient.delete(`/auth/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      setSuccess('User deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
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

  const canManageUser = (u) => {
    return user.role === 'superadmin' || (user.role === 'admin' && u.createdBy === user.id)
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
        onClick={() => {
          setShowCreateForm(!showCreateForm)
          setEditingUserId(null)
          setFormData({ name: '', email: '', password: '', role: 'user' })
        }}
      >
        {showCreateForm ? '✕ Cancel' : '+ Create New User'}
      </button>

      {showCreateForm && (
        <form className="create-user-form" onSubmit={editingUserId ? handleUpdateUser : handleCreateUser}>
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
            <label>Password {editingUserId && '(leave blank to keep current)'}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter password"
              required={!editingUserId}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User</option>
              {user.role === 'superadmin' && (
                <>
                  <option value="admin">Admin</option>
                  <option value="superadmin">SuperAdmin</option>
                </>
              )}
            </select>
          </div>

          <button type="submit" className="submit-btn">
            {editingUserId ? 'Update User' : 'Create User'}
          </button>
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
                    <div className="action-buttons-group">
                      {/* Enable/Disable: Visible to SuperAdmin only */}
                      {user.role === 'superadmin' && (
                        u.isActive ? (
                          <button
                            className="action-btn disable"
                            onClick={() => handleToggleUser(u.id, 'disable')}
                            title="Disable user"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            className="action-btn enable"
                            onClick={() => handleToggleUser(u.id, 'enable')}
                            title="Enable user"
                          >
                            Enable
                          </button>
                        )
                      )}

                      {/* Edit: SuperAdmin can edit anyone, Admin can edit own users */}
                      {canManageUser(u) && (
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditUser(u)}
                          title="Edit user"
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {/* Delete: SuperAdmin can delete anyone, Admin can delete own users */}
                      {canManageUser(u) && u.role !== 'superadmin' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
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
