const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081'

// All endpoints now go to the single merged service
const getServiceUrl = (endpoint) => {
  return USER_SERVICE_URL
}

const buildUrl = (baseUrl, endpoint) => {
  const base = (baseUrl || '').replace(/\/+$/, '')
  const path = endpoint?.startsWith('/') ? endpoint : `/${endpoint || ''}`

  if (base.endsWith('/api') && path.startsWith('/api/')) {
    return `${base.slice(0, -4)}${path}`
  }

  return `${base}${path}`
}

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const serviceUrl = getServiceUrl(endpoint)
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  }

  const fullUrl = buildUrl(serviceUrl, endpoint)
  console.log('=== API Request ===')
  console.log('Service URL:', serviceUrl)
  console.log('Endpoint:', endpoint)
  console.log('Full URL:', fullUrl)
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
      let errorBody = null
      try {
        errorBody = await response.json()
        if (errorBody?.message) message = errorBody.message
        console.error('API Error Body:', errorBody)
      } catch {
        try {
          const errorText = await response.text()
          console.error('API Error Text:', errorText)
        } catch {
          console.error('Could not read error response')
        }
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
