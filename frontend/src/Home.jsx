import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from './utils/api'

function Home({ onLogout }) {
  console.log('Home component rendered')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest('/user')
        setUser(data)
      } catch (err) {
        console.error('Fetch user error:', err)
        setError(err.message.includes('fetch') ? 'Network error. Ensure the backend is running on localhost:8080.' : 'Failed to load user data.')
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="form-container">
      <h2>Welcome to the Home Page!</h2>
      {user ? (
        <div>
          <p>Hello, {user.name}!</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home
