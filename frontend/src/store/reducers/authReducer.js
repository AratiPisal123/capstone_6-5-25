const storedToken = localStorage.getItem('token')
const storedUserRaw = localStorage.getItem('user')

let storedUser = null
try {
  storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null
} catch {
  storedUser = null
}

const initialState = {
  isAuthenticated: Boolean(storedToken),
  user: storedUser
}

const authReducer = (state = initialState, action) => {
  console.log('AuthReducer action:', action.type, 'Current state:', state)
  
  switch (action.type) {
    case 'LOGIN':
      console.log('LOGIN action - Setting isAuthenticated to true')
      return { ...state, isAuthenticated: true, user: action.payload }
    case 'LOGOUT':
      console.log('LOGOUT action - Setting isAuthenticated to false')
      return { ...state, isAuthenticated: false, user: null }
    default:
      return state
  }
}

export default authReducer
