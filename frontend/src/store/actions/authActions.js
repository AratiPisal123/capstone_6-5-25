export const login = (user) => {
  // Store user data in localStorage
  localStorage.setItem('user', JSON.stringify(user))
  
  return {
    type: 'LOGIN',
    payload: user
  }
}

export const logout = () => {
  console.log('Logout action called')
  
  // Clear all user data from localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('authUser')
  localStorage.removeItem('userName')
  
  console.log('All localStorage data cleared in logout action')
  
  return {
    type: 'LOGOUT'
  }
}
