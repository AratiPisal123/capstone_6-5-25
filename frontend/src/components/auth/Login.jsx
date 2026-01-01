import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../store/actions/authActions'
import { apiRequest } from '../../utils/api'
import { initializeGoogleAuth, renderGoogleButton, showGoogleOneTap, GOOGLE_CLIENT_ID } from '../../utils/googleAuth'

function Login({ onNavigate }) {
  const [emailOrMobile, setEmailOrMobile] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()

  // Initialize Google One Tap
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        await initializeGoogleAuth(GOOGLE_CLIENT_ID, handleGoogleSignIn);
        renderGoogleButton('google-signin-button', { text: 'signin_with' });
        showGoogleOneTap();
      } catch (error) {
        console.error('Google auth initialization failed:', error);
      }
    };

    initGoogleAuth();
  }, [])

  const handleGoogleSignIn = async (response) => {
    try {
      console.log('Google ID token received:', response.credential)
      
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
      console.log('Google authentication successful:', data)
      
      // Store the JWT token
      if (data.token) {
        localStorage.setItem('token', data.token)
        console.log('JWT token stored in localStorage, token length:', data.token.length)
        console.log('Token first 20 chars:', data.token.substring(0, 20) + '...')
      } else {
        console.error('No token received from Google auth response')
      }
      
      if (data.user) {
        console.log('User info received:', data.user)
        
        // Dispatch login action to update Redux state and store user data
        dispatch(login(data.user))
      }
      
      // Show success message
      setError('')
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
      
    } catch (error) {
      console.error('Google authentication failed - Full error:', error)
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
        setError(`Google authentication failed: ${error.message}`)
      }
    }
  }

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err
    
    if (err?.message) {
      if (err.message.includes('HTTP error! status: 400')) {
        return 'Invalid email or password. Please check your credentials and try again.'
      }
      if (err.message.includes('HTTP error! status: 401')) {
        return 'Invalid password or email. Please check your credentials and try again.'
      }
      if (err.message.includes('HTTP 401 Unauthorized')) {
        return 'Invalid password or email. Please check your credentials and try again.'
      }
      if (err.message.includes('401 Unauthorized')) {
        return 'Invalid password or email. Please check your credentials and try again.'
      }
      if (err.message.includes('401')) {
        return 'Invalid password or email. Please check your credentials and try again.'
      }
      if (err.message.includes('email not found') || err.message.includes('user not found')) {
        return 'Email does not exist. Please check your email or create a new account.'
      }
      if (err.message.includes('invalid email') || err.message.includes('invalid credentials')) {
        return 'Email does not exist. Please check your email or create a new account.'
      }
      if (err.message.includes('HTTP error! status: 403')) {
        return 'Access denied. Please check your credentials and try again.'
      }
      if (err.message.includes('HTTP error! status: 404')) {
        return 'Login service not available. Please try again later.'
      }
      if (err.message.includes('HTTP error! status: 500')) {
        return 'Server error. Please try again later.'
      }
      if (err.message.includes('Network error')) {
        return 'Network connection failed. Please check your internet connection.'
      }
      return err.message
    }
    
    return 'Login failed. Please try again.'
  }

  const handleFacebookLogin = () => {
    setError('Facebook authentication is not available')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrMobile, password, rememberMe }),
      })

      localStorage.setItem('token', data.token)
      console.log('Regular login - JWT token stored, token length:', data.token.length)
      console.log('Token first 20 chars:', data.token.substring(0, 20) + '...')
      localStorage.setItem('authUser', JSON.stringify(data.user))
      localStorage.setItem('userName', data.user?.name || data.user?.email || emailOrMobile)

      dispatch(login(data.user))
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
          <h2>User Login</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Email/Mobile</label>
            <input
              type="text"
              placeholder="Enter your email or mobile"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="form-actions">
              <label className="checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember Me
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forgot-password') }} className="forgot-link">Forgot Password?</a>
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="login-link">
              New user?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup') }}>Create an account</a>
            </p>

           
          </form>

          <div className="divider">OR</div>

          <div className="social-login">
            <div id="google-signin-button" className="social-btn google-btn">
              🔍 Continue with Google
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
