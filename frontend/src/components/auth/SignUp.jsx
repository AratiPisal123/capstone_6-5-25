import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginSuccess } from '../../redux/slices/authSlice'
import { apiRequest } from '../../utils/api'
import EmailVerification from './EmailVerification'
import SignupSuccess from './SignupSuccess'
import { initializeGoogleAuth, renderGoogleButton, showGoogleOneTap, GOOGLE_CLIENT_ID } from '../../utils/googleAuth'

function SignUp() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    agreeTerms: false
  })
  const [registeredUser, setRegisteredUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()

  // Initialize Google One Tap
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await initializeGoogleAuth(GOOGLE_CLIENT_ID, handleGoogleSignUp);
        renderGoogleButton('google-signup-button', { text: 'signup_with' });
        showGoogleOneTap();
      } catch (error) {
        console.error('Google auth initialization failed:', error);
      }
    };

    initGoogleAuth();
  }, [])

  const handleGoogleSignUp = async (response) => {
    try {
      console.log('Google ID token received for signup:', response.credential)
      
      // Make the API call with more detailed error handling
      const apiResponse = await fetch('http://localhost:8081/api/auth/google/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential })
      })

      console.log('API Response status:', apiResponse.status)
      console.log('API Response headers:', apiResponse.headers)

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${apiResponse.status}, message: ${errorText}`)
      }

      const data = await apiResponse.json()
      console.log('Google signup successful:', data)
      
      // Store the JWT token
      if (data.token) {
        localStorage.setItem('token', data.token)
        console.log('JWT token stored in localStorage')
      }
      
      if (data.user) {
        console.log('User info received:', data.user)
        
        // Dispatch login action to update Redux state and store user data
        dispatch(loginSuccess({ user: data.user, token: data.token }))
      }
      
      // Show success message
      setError('')
      setStep(3) // Move to success step
      setRegisteredUser(data.user)
      
      // TODO: Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/home')
      }, 2000)
      
    } catch (error) {
      console.error('Google signup failed - Full error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      if (error.message.includes('invalid_client') || error.message.includes('no registered origin') || error.message.includes('The given origin is not allowed')) {
        setError('Google OAuth not configured properly. Please ensure your domain is added to Google Cloud Console authorized origins.')
        console.error('Google OAuth Configuration Error - Check Google Cloud Console:', error.message)
      } else if (error.message.includes('HTTP error! status: 401')) {
        setError('Invalid Google token. Please try again.')
      } else if (error.message.includes('HTTP error! status: 400')) {
        setError('Invalid request. Please try again.')
      } else if (error.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError(`Google signup failed: ${error.message}`)
      }
    }
  }

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err
    
    if (err?.message) {
      if (err.message.includes('HTTP error! status: 400')) {
        return 'Invalid information. Please check all fields and try again.'
      }
      if (err.message.includes('HTTP error! status: 409')) {
        return 'Email already registered. Please use a different email or try logging in.'
      }
      if (err.message.includes('HTTP error! status: 422')) {
        return 'Invalid data. Please check all fields and try again.'
      }
      if (err.message.includes('HTTP error! status: 500')) {
        return 'Server error. Please try again later.'
      }
      if (err.message.includes('Network error')) {
        return 'Network connection failed. Please check your internet connection.'
      }
      return err.message
    }
    
    return 'Signup failed. Please try again.'
  }

  const validatePassword = (password) => {
    const errors = []
    let strength = 0
    
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    
    if (password.length < 8) {
      errors.push('Password is too short')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password needs uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password needs lowercase letter')
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password needs a number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password needs special character')
    }
    
    return { errors, strength }
  }

  const getPasswordStrength = (strength) => {
    if (strength <= 2) return { text: 'Weak', color: '#ef4444' }
    if (strength <= 3) return { text: 'Fair', color: '#f59e0b' }
    if (strength <= 4) return { text: 'Good', color: '#eab308' }
    return { text: 'Strong', color: '#22c55e' }
  }

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate password
    const { errors: passwordErrors, strength } = validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '))
      return
    }
    
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms and Conditions')
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          agreeToTerms: formData.agreeTerms,
        }),
      })

      // Store registered user info for verification step
      setRegisteredUser(data.user)
      setStep(2) // Move to verification step
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignup = () => {
    setError('Facebook authentication is not available')
  }

  const handleEmailVerified = () => {
    setStep(3) // Move to success step
  }

  const handleBackToSignup = () => {
    setStep(1)
    setError('')
  }

  // Step 2: Email Verification
  if (step === 2 && registeredUser) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <div className="logo-small">🏥 BluWalls Medbudy</div>
        </header>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <div className="steps-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span>1</span>
                <p>Account</p>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <p>Verify</p>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span>3</span>
                <p>Complete</p>
              </div>
            </div>
            <EmailVerification 
              email={registeredUser.email}
              userId={registeredUser.id}
              onVerified={handleEmailVerified}
              onBack={handleBackToSignup}
            />
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Success
  if (step === 3) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <div className="logo-small">🏥 BluWalls Medbudy</div>
        </header>
        <div className="auth-container">
          <div className="auth-form-wrapper">
            <div className="steps-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <span>1</span>
                <p>Account</p>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <p>Verify</p>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <span>3</span>
                <p>Complete</p>
              </div>
            </div>
            <SignupSuccess />
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Account Creation
  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="logo-small">🏥 BluWalls Medbudy</div>
      </header>
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <h2>Create Your Account</h2>
          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Account</p>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Verify</p>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Complete</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Mobile</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(getPasswordStrength(validatePassword(formData.password).strength).strength / 5) * 100}%`,
                      backgroundColor: getPasswordStrength(validatePassword(formData.password).strength).color
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-text" 
                  style={{ color: getPasswordStrength(validatePassword(formData.password).strength).color }}
                >
                  {getPasswordStrength(validatePassword(formData.password).strength).text}
                </span>
              </div>
            )}
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

            <label className="checkbox">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              I agree to the Terms and Conditions
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="login-link">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Login</a></p>
          </form>

          <div className="divider">OR</div>

          <div className="social-login">
            <div id="google-signup-button" className="social-btn google-btn">
              🔍 Sign up with Google
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
