import './Header.css'

function Header({ user, onSenderClick, currentSender }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-logo">📧 Mailer</h1>
        <div className="header-actions">
          {currentSender && (
            <div className="sender-display">
              <span className="sender-badge">
                ✓ From: <strong>{currentSender.name}</strong>
              </span>
              <span className="sender-email-display">
                {currentSender.email}
              </span>
            </div>
          )}
          <button 
            className="sender-setup-btn"
            onClick={onSenderClick}
            title={currentSender ? "Change sender" : "Setup sender"}
          >
            📤 {currentSender ? 'Change Sender' : 'Setup Sender'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
