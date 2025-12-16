
import { useState, useEffect } from 'react'
import EmailForm from './components/EmailForm'
import AuthLogin from './components/AuthLogin'
import Sidebar from './components/Sidebar'
import UserManagement from './components/UserManagement'
import SenderModal from './components/SenderModal'
import Header from './components/Header'
import './App.css'


function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [preview, setPreview] = useState(null)
  const [senderModalOpen, setSenderModalOpen] = useState(false)
  const [currentSender, setCurrentSender] = useState(null)
  const [currentPage, setCurrentPage] = useState('bulk-mail') // 'bulk-mail' or 'user-management'

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setCurrentPage('bulk-mail')
    }
  }, [])

  const handleLoginSuccess = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
    setCurrentPage('bulk-mail')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    setCurrentPage('bulk-mail')
  }

  return (
    <div className="app-wrapper">
      {!user ? (
        <AuthLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <Header 
            user={user} 
            currentSender={currentSender}
            onSenderClick={() => setSenderModalOpen(true)}
          />
          <div className="app-layout">
            <Sidebar 
              user={user} 
              onNavigation={setCurrentPage}
              currentPage={currentPage}
              onLogout={handleLogout}
            />
            
            <main className="app-main-content">
              {currentPage === 'bulk-mail' ? (
                <div className="app-main">
                  <div className="app-content">
                    <div>
                      <h3 style={{marginTop: 0, color: '#666', fontWeight: '500'}}>📧 Bulk Email Campaign</h3>
                    </div>
                    <EmailForm 
                      setPreview={setPreview}
                      currentSender={currentSender}
                    />
                  </div>
                  <div className="app-preview">
                    <h2>📬 Preview (First Row)</h2>
                    {preview ? (
                      <>
                        <div className="preview-section">
                          <div className="preview-label">To:</div>
                          <div className="preview-value">{preview.to || <span className="preview-empty">Not set</span>}</div>
                        </div>
                        <div className="preview-section">
                          <div className="preview-label">CC:</div>
                          <div className="preview-value">{preview.cc || <span className="preview-empty">Not set</span>}</div>
                        </div>
                        <div className="preview-section">
                          <div className="preview-label">BCC:</div>
                          <div className="preview-value">{preview.bcc || <span className="preview-empty">Not set</span>}</div>
                        </div>
                        <div className="preview-section">
                          <div className="preview-label">Subject:</div>
                          <div className="preview-value">{preview.subject || <span className="preview-empty">Not set</span>}</div>
                        </div>
                        <div className="preview-section">
                          <div className="preview-label">Body:</div>
                          <div className="preview-value">{preview.message || <span className="preview-empty">Not set</span>}</div>
                        </div>
                      </>
                    ) : (
                      <div className="preview-value preview-empty">Import a CSV and fill the fields to see a preview of the first email here.</div>
                    )}
                  </div>
                </div>
              ) : (
                <UserManagement 
                  user={user}
                  token={token}
                  onClose={() => setCurrentPage('bulk-mail')}
                />
              )}
            </main>
          </div>

          {senderModalOpen && (
            <SenderModal
              isOpen={senderModalOpen}
              onClose={() => setSenderModalOpen(false)}
              onSelectSender={setCurrentSender}
              currentSender={currentSender}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
