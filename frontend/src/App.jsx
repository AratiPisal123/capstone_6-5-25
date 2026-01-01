import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import SuccessPage from './components/SuccessPage'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import './App.css'
import './assets/styles/global.css'

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [resetToken, setResetToken] = useState(null)
  const isAuthenticated = useSelector(state => state.isAuthenticated)

  useEffect(() => {
    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    if (token) {
      setResetToken(token)
      setCurrentPage('reset-password')
    }
    
    // Check for OAuth success or error
    const path = window.location.pathname
    if (path === '/auth/success') {
      // OAuth was successful, redirect to dashboard or login with token
      setCurrentPage('login')
    } else if (path === '/auth/callback') {
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (code) {
        // Handle OAuth callback with authorization code
        console.log('Received OAuth code:', code)
        // TODO: Exchange code for token with backend
        setCurrentPage('login')
      } else if (error) {
        console.error('OAuth error:', error)
        setCurrentPage('login')
      }
    } else if (path === '/login') {
      const error = urlParams.get('error')
      if (error) {
        // Handle OAuth error
        console.error('OAuth error:', error)
        setCurrentPage('login')
      }
    }
  }, [])

  // Reset currentPage when user logs out (but not on initial load or when navigating to auth pages)
  useEffect(() => {
    const authPages = ['landing', 'login', 'signup', 'forgot-password', 'reset-password', 'success'];
    if (!isAuthenticated && !authPages.includes(currentPage)) {
      console.log('User logged out from protected page, resetting currentPage to login')
      setCurrentPage('login')
    }
  }, [isAuthenticated, currentPage])

  if (isAuthenticated) {
    console.log('User is authenticated, showing Dashboard')
    return <Dashboard />
  }

  console.log('User not authenticated, currentPage:', currentPage, 'isAuthenticated:', isAuthenticated)
  console.log('Available pages: landing, login, signup, forgot-password, reset-password, success')

  switch (currentPage) {
    case 'landing':
      console.log('Rendering LandingPage')
      return <LandingPage onNavigate={setCurrentPage} />
    case 'login':
      console.log('Rendering Login')
      return <Login onNavigate={setCurrentPage} />
    case 'signup':
      console.log('Rendering SignUp')
      return <Signup onNavigate={setCurrentPage} />
    case 'forgot-password':
      console.log('Rendering ForgotPassword')
      return <ForgotPassword onNavigate={setCurrentPage} />
    case 'reset-password':
      console.log('Rendering ResetPassword')
      return <ResetPassword onNavigate={setCurrentPage} resetToken={resetToken} />
    case 'success':
      console.log('Rendering SuccessPage')
      return <SuccessPage onNavigate={setCurrentPage} />
    default:
      console.log('Default case - rendering Login page')
      return <Login onNavigate={setCurrentPage} /> // Show login by default
  }
}

function App() {
  return (
    <AppContent />
  )
}

export default App
