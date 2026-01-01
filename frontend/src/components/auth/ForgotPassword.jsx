import { useState } from 'react'
import { apiRequest } from '../../utils/api'

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err
    
    if (err?.message) {
      if (err.message.includes('HTTP error! status: 400')) {
        return 'Please enter a valid email address.'
      }
      if (err.message.includes('HTTP error! status: 404')) {
        return 'Email address not found in our system.'
      }
      if (err.message.includes('HTTP error! status: 500')) {
        return 'Server error. Please try again later.'
      }
      if (err.message.includes('Network error')) {
        return 'Network connection failed. Please check your internet connection.'
      }
      return err.message
    }
    
    return 'Failed to send reset link. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setLoading(true)
    try {
      const data = await apiRequest('/password-reset/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo-small">🏥 BluWalls Medbudy</div>
      </header>
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <h2>Forgot Password</h2>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="auth-form">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              {error && <p className="error">{error}</p>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <p className="login-link">Back to <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login') }}>Login</a></p>
            </form>
          ) : (
            <div className="success-wrapper">
              <div className="success-icon">✓</div>
              <h2>Request Submitted</h2>
              <p>If an account exists for <strong>{email}</strong>, you will receive a reset link.</p>
              <button onClick={() => onNavigate('login')} className="submit-btn">Back to Login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
