function SuccessPage({ onNavigate }) {
  const handleGoToLogin = () => {
    onNavigate('login')
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo-small">🏥 BluWalls Medbudy</div>
      </header>
      <div className="auth-container">
        <div className="success-wrapper">
          <div className="success-icon">✓</div>
          <h2>Account Created!</h2>
          <p>You have successfully created your account, Please verify your email address to proceed to the next stage.</p>
          <button onClick={handleGoToLogin} className="secondary-btn">Back to Login</button>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage
