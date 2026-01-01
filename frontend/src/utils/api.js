const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }

  const fullUrl = `${API_BASE_URL}${endpoint}`
  console.log('=== API Request ===')
  console.log('URL:', fullUrl)
  console.log('Config:', config)
  console.log('Token exists:', !!token)
  console.log('Token length:', token?.length || 0)

  try {
    const response = await fetch(fullUrl, config)
    console.log('=== API Response ===')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Headers:', [...response.headers.entries()])

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`
      try {
        const errorBody = await response.json()
        if (errorBody?.message) message = errorBody.message
        console.error('API Error Body:', errorBody)
      } catch {
        const errorText = await response.text()
        console.error('API Error Text:', errorText)
      }
      throw new Error(message)
    }

    if (response.status === 204) return null
    return response.json()
  } catch (error) {
    console.error('=== API Request Failed ===')
    console.error('Error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw error
  }
}
