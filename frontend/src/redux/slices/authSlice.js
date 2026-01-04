import { createSlice } from '@reduxjs/toolkit'

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
  user: storedUser,
  token: storedToken,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      // Store in localStorage
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = action.payload
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.loading = false
      state.error = null
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUser } = authSlice.actions

// Legacy action exports for compatibility
export const login = (user) => ({
  type: 'LOGIN',
  payload: user
})

export default authSlice.reducer