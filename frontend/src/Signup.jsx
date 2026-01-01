import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest } from './utils/api'

function Signup({ onLogin }) {
  console.log('Signup component rendered')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const data = await apiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      })
      localStorage.setItem('token', data.token)
      onLogin()
      navigate('/home')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message.includes('fetch') ? 'Network error. Ensure the backend is running on localhost:8080.' : (err.message || 'Signup failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="toggle-buttons">
        <Link to="/login"><button>Login</button></Link>
        <button className="active">Signup</button>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
      </form>
    </div>
  )
}

export default Signup
