import { useState } from 'react'
import './Sidebar.css'

function Sidebar({ user, onNavigation, currentPage, onLogout }) {
  const [isOpen, setIsOpen] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const renderMenuItems = () => {
    if (!user) return null

    const commonItems = [
      {
        id: 'bulk-mail',
        label: '📧 Bulk Mail',
        icon: '✉️',
        roles: ['superadmin', 'admin', 'user']
      }
    ]

    const adminItems = [
      {
        id: 'user-management',
        label: '👥 User Management',
        icon: '🔐',
        roles: ['superadmin', 'admin']
      }
    ]

    const items = commonItems.concat(
      user.role === 'superadmin' || user.role === 'admin' ? adminItems : []
    )

    return items.map(item => (
      <button
        key={item.id}
        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
        onClick={() => {
          onNavigation(item.id)
          if (window.innerWidth < 768) setIsOpen(false)
        }}
        title={item.label}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
      </button>
    ))
  }

  if (!user) return null

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button 
          className="toggle-sidebar"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
        <div className="sidebar-title">
          <span className="app-icon">📧</span>
          {isOpen && <span className="app-name">Mailer</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {isOpen && <div className="nav-section-title">Menu</div>}
          {renderMenuItems()}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-section">
          <button 
            className="user-info"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User menu"
          >
            <div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
            {isOpen && (
              <>
                <div className="user-details">
                  <div className="user-email">{user.email}</div>
                  <div className="user-role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
                <span className={`menu-arrow ${showUserMenu ? 'open' : ''}`}>▼</span>
              </>
            )}
          </button>
          
          {showUserMenu && isOpen && (
            <div className="user-menu-dropdown">
              <button 
                className="logout-menu-btn"
                onClick={() => {
                  onLogout()
                  setShowUserMenu(false)
                }}
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
