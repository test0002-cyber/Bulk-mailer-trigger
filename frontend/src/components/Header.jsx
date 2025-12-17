import './Header.css'

function Header({ user, onSenderClick, currentSender }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-logo">📧 Mailer</h1>
        <div className="header-actions">
          <button 
            className="sender-setup-btn"
            onClick={onSenderClick}
            title="Setup sender"
          >
            📤 {currentSender ? currentSender.name : 'Setup Sender'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
