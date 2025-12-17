import axios from 'axios'

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // In development (localhost), use the proxy
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api'
  }
  
  // In production, always use the Render backend URL
  return 'https://bulk-mailer-trigger.onrender.com'
}

const API_BASE_URL = getApiBaseUrl()

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Log API calls for debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)

export default apiClient
