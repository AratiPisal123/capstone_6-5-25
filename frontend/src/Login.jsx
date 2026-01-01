import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest } from './utils/api'

function Login({ onLogin }) {
  console.log('Login component rendered')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      localStorage.setItem('token', data.token)
      onLogin()
      navigate('/home')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message.includes('fetch') ? 'Network error. Ensure the backend is running on localhost:8080.' : 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="toggle-buttons">
        <button className="active">Login</button>
        <Link to="/signup"><button>Signup</button></Link>
      </div>
      <form onSubmit={handleSubmit} className="form">
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
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  )
}

export default Login
