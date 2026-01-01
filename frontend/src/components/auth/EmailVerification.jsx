import { useState } from 'react'
import { apiRequest } from '../../utils/api'
import './EmailVerification.css'

function EmailVerification({ email, userId, onVerified, onBack }) {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  const handleInputChange = (index, value) => {
    if (value.length > 1) return
    
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
    
    setError('')
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setVerificationCode(digits)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = verificationCode.join('')
    
    if (code.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await apiRequest('/email-verification/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          verificationCode: code
        })
      })
      
      if (response.message) {
        setMessage('Email verified successfully!')
        setTimeout(() => {
          onVerified()
        }, 1500)
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError('')
    setMessage('')
    
    try {
      await apiRequest('/email-verification/send', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          userId: userId
        })
      })
      
      setMessage('Verification code sent successfully!')
      setVerificationCode(['', '', '', '', '', ''])
      
      // Focus first input
      const firstInput = document.getElementById('code-input-0')
      if (firstInput) firstInput.focus()
      
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="email-verification-container">
      <div className="verification-header">
        <h2>Verify Your Email</h2>
        <p>We've sent a 6-digit verification code to:</p>
        <p className="email-display">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
        <div className="code-inputs">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`code-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="code-input"
              required
            />
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <div className="verification-actions">
          <button 
            type="submit" 
            className="verify-btn" 
            disabled={loading || verificationCode.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <button 
            type="button" 
            className="resend-btn" 
            onClick={handleResendCode}
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <button 
          type="button" 
          className="back-btn" 
          onClick={onBack}
        >
          ← Back to Signup
        </button>
      </form>

      <div className="verification-info">
        <p>• The verification code will expire in 10 minutes</p>
        <p>• Check your spam folder if you don't see the email</p>
        <p>• Make sure to enter all 6 digits</p>
      </div>
    </div>
  )
}

export default EmailVerification
