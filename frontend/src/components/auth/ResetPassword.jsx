import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../../utils/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [tokenValid, setTokenValid] = useState(null)

  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (resetToken) {
      setToken(resetToken)
      setTokenValid(true)
    } else {
      setError('Invalid or missing reset token')
      setTokenValid(false)
    }
  }, [searchParams])

  const validatePassword = (password) => {
    const errors = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    setError('')
    setMessage('')
  }

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err
    
    if (err?.message) {
      if (err.message.includes('HTTP error! status: 400')) {
        return 'Passwords do not match. Please check and try again.'
      }
      if (err.message.includes('HTTP error! status: 401')) {
        return 'Invalid or expired reset link. Please request a new one.'
      }
      if (err.message.includes('HTTP error! status: 404')) {
        return 'Reset link not found. Please request a new one.'
      }
      if (err.message.includes('HTTP error! status: 500')) {
        return 'Server error. Please try again later.'
      }
      if (err.message.includes('Network error')) {
        return 'Network connection failed. Please check your internet connection.'
      }
      return err.message
    }
    
    return 'Failed to reset password. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (!tokenValid) {
      setError('Invalid reset token')
      return
    }
    
    if (!formData.newPassword) {
      setError('Please enter a new password')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '))
      return
    }
    
    setLoading(true)
    try {
      const data = await apiRequest('/password-reset/reset', {
        method: 'POST',
        body: JSON.stringify({
          resetToken: token,
          newPassword: formData.newPassword
        })
      })
      
      if (data.message) {
        setMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <div className="logo-small">🏥 BluWalls Medbudy</div>
        </header>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <h2>Validating reset token...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <div className="logo-small">🏥 BluWalls Medbudy</div>
        </header>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <h2>Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired.</p>
            <button onClick={() => navigate('/forgot-password')} className="submit-btn">
              Request New Reset Link
            </button>
            <p className="login-link">Back to <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Login</a></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo-small">🏥 BluWalls Medbudy</div>
      </header>
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <h2>Reset Password</h2>
          <p>Enter your new password below.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />

            <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />

            <div className="password-requirements">
              <p>Password must contain:</p>
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&* etc.)</li>
              </ul>
            </div>

            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="login-link">Back to <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Login</a></p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
