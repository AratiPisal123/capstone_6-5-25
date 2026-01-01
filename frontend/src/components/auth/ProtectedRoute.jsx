import { useSelector } from 'react-redux'

function ProtectedRoute({ children, fallback = null }) {
  const isAuthenticated = useSelector(state => state.isAuthenticated)
  return isAuthenticated ? children : fallback
}

export default ProtectedRoute
